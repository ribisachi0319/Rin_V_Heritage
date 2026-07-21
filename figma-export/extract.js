// Trích vài màn từ bản xuất đầy đủ ra file nhỏ để import Figma cho gọn.
//   node figma-export/extract.js <baseId> [baseId2 ...]
// Mỗi baseId gồm luôn 4 biến thể: <id>, <id>__dark, <id>__vlow, <id>__dark__vlow.
// Ghi 2 file: figma-plugin/vh-<baseId>.json (fit màn hình) + vh-<baseId>-full.json (dài).
// Chỉ đọc/lọc JSON có sẵn — không chạy Chrome, không tải asset lại.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const bases = process.argv.slice(2);
if (!bases.length) { console.error('Cần ít nhất 1 baseId. VD: node figma-export/extract.js article'); process.exit(1); }

const match = (id) => bases.some(b => id === b || id.startsWith(b + '__'));

function collectAssets(node, used) {
  if (node.asset) used.add(node.asset);
  (node.children || []).forEach(c => collectAssets(c, used));
}

function extract(srcPath, outPath) {
  if (!fs.existsSync(srcPath)) { console.warn('  bỏ qua (không có):', path.basename(srcPath)); return; }
  const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  const screens = data.screens.filter(s => match(s.id));
  if (!screens.length) { console.warn('  không màn nào khớp trong', path.basename(srcPath)); return; }
  const used = new Set();
  screens.forEach(s => (s.children || []).forEach(c => collectAssets(c, used)));
  const assets = {};
  used.forEach(id => { if (data.assets[id]) assets[id] = data.assets[id]; });
  const out = {app: data.app, exportedAt: data.exportedAt, extractedFrom: path.basename(srcPath), screens, assets};
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`  ${path.basename(outPath)}: ${screens.length} màn, ${Object.keys(assets).length} asset (${(fs.statSync(outPath).size / 1e6).toFixed(2)} MB)`);
  screens.forEach(s => console.log('     - ' + s.name));
}

const tag = bases.join('-');
console.log('Trích [' + bases.join(', ') + ']:');
extract(path.join(ROOT, 'figma-plugin/vh-export.json'), path.join(ROOT, 'figma-plugin', 'vh-' + tag + '.json'));
extract(path.join(ROOT, 'figma-plugin/vh-export-full.json'), path.join(ROOT, 'figma-plugin', 'vh-' + tag + '-full.json'));
