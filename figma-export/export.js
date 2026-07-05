// Orchestrator: node figma-export/export.js
// 1. Server tĩnh serve repo, inject hook (bắt instance) + driver vào app.dc.html
// 2. Spawn Chrome headless, driver tự chạy hết fixtures rồi POST /save từng màn
// 3. Tải toàn bộ ảnh (picsum) + icon Tabler SVG, nhúng base64
// 4. Ghi figma-plugin/vh-export.json
const http = require('http');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8791;
const CHROME = '/run/current-system/sw/bin/google-chrome';
const OUT = path.join(ROOT, 'figma-plugin', 'vh-export.json');
const TABLER_VER = '3.5.0';

const HOOK = `
const __dm = Component.prototype.componentDidMount;
Component.prototype.componentDidMount = function () { window.__vh = this; return __dm && __dm.apply(this, arguments); };
`;
const INJECT_HEAD = `<style>*{animation:none!important;transition:none!important;caret-color:transparent!important}</style>
<script defer src="/figma-export/fixtures.js"></script>
<script defer src="/figma-export/driver.js"></script>
`;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
};

const screens = [];
let doneResolve;
const donePromise = new Promise(r => { doneResolve = r; });

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      if (req.url === '/save') {
        const s = JSON.parse(body);
        screens.push(s);
        console.log(`  [${screens.length}] ${s.name}`);
      } else if (req.url === '/done') {
        doneResolve();
      } else if (req.url === '/log') {
        console.log('  page:', body);
      }
      res.writeHead(204).end();
    });
    return;
  }
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, urlPath === '/' ? 'app.dc.html' : urlPath);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('not found');
    return;
  }
  let data = fs.readFileSync(file);
  if (file.endsWith('app.dc.html')) {
    let html = data.toString('utf8');
    html = html.replace('Object.assign(Component.prototype, VH_DATA, VH_LOGIC, VH_RENDER);',
        'Object.assign(Component.prototype, VH_DATA, VH_LOGIC, VH_RENDER);' + HOOK);
    html = html.replace('</head>', INJECT_HEAD + '</head>');
    data = Buffer.from(html, 'utf8');
  }
  res.writeHead(200, {'content-type': MIME[path.extname(file)] || 'application/octet-stream'});
  res.end(data);
});

function collect(node, imgs, icons) {
  if (node.type === 'IMG') imgs.add(node.src);
  if (node.type === 'ICON') icons.add(node.icon);
  (node.children || []).forEach(c => collect(c, imgs, icons));
}

async function fetchBin(url, tries) {
  for (let i = 0; i < (tries || 3); i++) {
    try {
      const r = await fetch(url, {redirect: 'follow'});
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
    } catch (e) { /* retry */ }
    await new Promise(rs => setTimeout(rs, 800));
  }
  return null;
}

async function fetchIcon(name) {
  const urls = name.endsWith('-filled')
      ? [`https://unpkg.com/@tabler/icons@${TABLER_VER}/icons/filled/${name.replace(/-filled$/, '')}.svg`,
         `https://unpkg.com/@tabler/icons@${TABLER_VER}/icons/outline/${name}.svg`]
      : [`https://unpkg.com/@tabler/icons@${TABLER_VER}/icons/outline/${name}.svg`,
         `https://unpkg.com/@tabler/icons@${TABLER_VER}/icons/filled/${name}.svg`];
  for (const u of urls) {
    const b = await fetchBin(u);
    if (b) return b.toString('utf8');
  }
  console.warn('  !! icon không tải được:', name);
  return null;
}

async function pool(items, limit, fn) {
  const q = [...items];
  const workers = Array.from({length: limit}, async () => {
    while (q.length) await fn(q.shift());
  });
  await Promise.all(workers);
}

async function main() {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log('Server http://127.0.0.1:' + PORT);

  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--window-size=470,940', '--user-data-dir=/tmp/vh-figma-chrome',
    `http://127.0.0.1:${PORT}/app.dc.html`,
  ], {stdio: 'ignore'});

  const timeout = setTimeout(() => {
    console.error('TIMEOUT: driver không báo /done sau 12 phút');
    doneResolve();
  }, 12 * 60 * 1000);
  await donePromise;
  clearTimeout(timeout);
  chrome.kill();
  console.log(`\nĐã bắt ${screens.length} màn. Tải assets...`);

  const imgs = new Set(), icons = new Set();
  screens.forEach(s => (s.children || []).forEach(c => collect(c, imgs, icons)));
  console.log(`  ${imgs.size} ảnh, ${icons.size} icon`);

  const assets = {};
  let i = 0;
  const imgId = new Map();
  await pool([...imgs], 6, async (url) => {
    const buf = await fetchBin(url, 4);
    const id = 'img' + (++i);
    imgId.set(url, id);
    if (buf) assets[id] = {kind: 'img', b64: buf.toString('base64')};
    else console.warn('  !! ảnh không tải được:', url);
  });
  await pool([...icons], 6, async (name) => {
    const svg = await fetchIcon(name);
    if (svg) assets['icon:' + name] = {kind: 'svg', svg};
  });

  // đổi src -> assetId
  const remap = (node) => {
    if (node.type === 'IMG') { node.asset = imgId.get(node.src); delete node.src; }
    if (node.type === 'ICON') node.asset = 'icon:' + node.icon;
    (node.children || []).forEach(remap);
  };
  screens.forEach(s => (s.children || []).forEach(remap));

  screens.sort((a, b) => a.name.localeCompare(b.name));
  const out = {app: 'V-Heritage', exportedAt: new Date().toISOString(), screens, assets};
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, JSON.stringify(out));
  console.log(`\nĐã ghi ${OUT} (${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB)`);
  server.close();
  process.exit(0);
}

if (process.argv.includes('--serve')) {
  // chỉ chạy server (để screenshot thủ công với ?shot=<id>)
  server.listen(PORT, '127.0.0.1', () => console.log('Serve-only: http://127.0.0.1:' + PORT));
} else {
  main().catch(e => { console.error(e); process.exit(1); });
}
