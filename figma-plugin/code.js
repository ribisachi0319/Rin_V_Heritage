// V-Heritage Importer — dựng lại các màn app từ vh-export.json thành frame Figma.
figma.showUI(__html__, {width: 340, height: 400});

const post = (type, text) => figma.ui.postMessage({type, text});
const yieldUI = () => new Promise(r => setTimeout(r, 0));

// ---------- CSS parsing ----------
function splitTop(s) {
  // tách theo dấu phẩy ở depth 0 (không tách phẩy trong rgba()/gradient())
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseColor(str) {
  if (!str) return null;
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(v => parseFloat(v));
  return {r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p.length === 4 ? p[3] : 1};
}

function solidPaint(str, extraOpacity) {
  const c = parseColor(str);
  if (!c || c.a === 0) return null;
  return {type: 'SOLID', color: {r: c.r, g: c.g, b: c.b}, opacity: c.a * (extraOpacity == null ? 1 : extraOpacity)};
}

function invert2x3(m) {
  const [[a, b, c], [d, e, f]] = m;
  const det = a * e - b * d;
  return [[e / det, -b / det, (b * f - c * e) / det], [-d / det, a / det, (c * d - a * f) / det]];
}

function gradientTransform(p0, p1) {
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return [[1, 0, 0], [0, 1, 0]];
  return invert2x3([[dx, -dy, p0.x], [dy, dx, p0.y]]);
}

function parseStops(args) {
  // args: mảng "rgb(..) 40%" | "rgba(..)" — vị trí thiếu thì chia đều
  const stops = args.map(a => {
    const color = parseColor(a);
    const pm = a.replace(/rgba?\([^)]+\)/, '').match(/(-?[\d.]+)%/);
    return color ? {color, pos: pm ? parseFloat(pm[1]) / 100 : null} : null;
  }).filter(Boolean);
  if (!stops.length) return null;
  if (stops[0].pos == null) stops[0].pos = 0;
  if (stops[stops.length - 1].pos == null) stops[stops.length - 1].pos = 1;
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].pos != null) continue;
    let j = i;
    while (stops[j].pos == null) j++;
    const from = stops[i - 1].pos, to = stops[j].pos, n = j - i + 1;
    for (let k = i; k < j; k++) stops[k].pos = from + (to - from) * (k - i + 1) / n;
  }
  return stops.map(s => ({
    position: Math.min(1, Math.max(0, s.pos)),
    color: {r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a},
  }));
}

function parseGradientLayer(css, w, h) {
  let m = css.match(/^linear-gradient\((.*)\)$/);
  if (m) {
    const args = splitTop(m[1]);
    let angle = 180; // CSS mặc định: to bottom
    if (/^to /.test(args[0])) {
      angle = {'to top': 0, 'to bottom': 180, 'to right': 90, 'to left': 270}[args.shift()] || 180;
    } else if (/^-?[\d.]+deg$/.test(args[0])) {
      angle = parseFloat(args.shift());
    }
    const stops = parseStops(args);
    if (!stops) return null;
    const rad = angle * Math.PI / 180;
    const dir = {x: Math.sin(rad), y: -Math.cos(rad)}; // px space, y hướng xuống
    const L = (Math.abs(w * dir.x) + Math.abs(h * dir.y)) / 2;
    const c = {x: w / 2, y: h / 2};
    const p0 = {x: (c.x - dir.x * L) / w, y: (c.y - dir.y * L) / h};
    const p1 = {x: (c.x + dir.x * L) / w, y: (c.y + dir.y * L) / h};
    return {type: 'GRADIENT_LINEAR', gradientTransform: gradientTransform(p0, p1), gradientStops: stops};
  }
  m = css.match(/^radial-gradient\((.*)\)$/);
  if (m) {
    const args = splitTop(m[1]);
    let cx = 0.5, cy = 0.5;
    if (/^circle|^ellipse|at /.test(args[0]) && !parseColor(args[0])) {
      const posM = args.shift().match(/at\s+([\d.]+)%\s+([\d.]+)%/);
      if (posM) { cx = parseFloat(posM[1]) / 100; cy = parseFloat(posM[2]) / 100; }
    }
    const stops = parseStops(args);
    if (!stops) return null;
    // bán kính = góc xa nhất (farthest-corner, mặc định CSS)
    const rpx = Math.max(
        Math.hypot(cx * w, cy * h), Math.hypot((1 - cx) * w, cy * h),
        Math.hypot(cx * w, (1 - cy) * h), Math.hypot((1 - cx) * w, (1 - cy) * h));
    const rx = rpx / w, ry = rpx / h;
    const M = [[2 * rx, 0, cx - rx], [0, 2 * ry, cy - ry]];
    return {type: 'GRADIENT_RADIAL', gradientTransform: invert2x3(M), gradientStops: stops};
  }
  return null;
}

function buildFills(node) {
  const fills = [];
  if (node.bgColor) {
    const p = solidPaint(node.bgColor);
    if (p) fills.push(p);
  }
  if (node.bgImage) {
    // CSS: layer đầu nằm TRÊN cùng; Figma: fill cuối mảng nằm trên → đảo ngược
    const layers = splitTop(node.bgImage).reverse();
    for (const l of layers) {
      const g = parseGradientLayer(l, node.w, node.h);
      if (g) fills.push(g);
    }
  }
  return fills;
}

function parseShadows(css, effects) {
  for (const part of splitTop(css)) {
    const color = parseColor(part);
    if (!color) continue;
    const inset = /inset/.test(part);
    const nums = part.replace(/rgba?\([^)]+\)/, '').match(/-?[\d.]+/g) || [];
    const [x, y, blur, spread] = nums.map(parseFloat);
    effects.push({
      type: inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
      color, offset: {x: x || 0, y: y || 0}, radius: blur || 0, spread: spread || 0,
      visible: true, blendMode: 'NORMAL',
    });
  }
}

function parseFilter(css, effects) {
  let m = css.match(/blur\(([\d.]+)px\)/);
  if (m) effects.push({type: 'LAYER_BLUR', radius: parseFloat(m[1]), visible: true});
  m = css.match(/drop-shadow\((rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px\)/);
  if (m) {
    effects.push({
      type: 'DROP_SHADOW', color: parseColor(m[1]),
      offset: {x: parseFloat(m[2]), y: parseFloat(m[3])}, radius: parseFloat(m[4]),
      spread: 0, visible: true, blendMode: 'NORMAL',
    });
  }
}

function buildEffects(node) {
  const effects = [];
  if (node.shadow) parseShadows(node.shadow, effects);
  if (node.filter) parseFilter(node.filter, effects);
  if (node.backdrop) {
    const m = node.backdrop.match(/blur\(([\d.]+)px\)/);
    if (m) effects.push({type: 'BACKGROUND_BLUR', radius: parseFloat(m[1]), visible: true});
  }
  return effects;
}

// ---------- fonts ----------
const WEIGHT_STYLE = {
  100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular',
  500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black',
};
const fontCache = {};

async function resolveFont(family, weight, italic) {
  const key = family + '|' + weight + '|' + (italic ? 1 : 0);
  if (fontCache[key]) return fontCache[key];
  const base = WEIGHT_STYLE[weight] || 'Regular';
  const candidates = [
    {family, style: italic ? (base === 'Regular' ? 'Italic' : base + ' Italic') : base},
    {family, style: base},
    {family, style: 'Regular'},
    {family: 'Inter', style: base === 'SemiBold' ? 'Semi Bold' : base},
    {family: 'Inter', style: 'Regular'},
  ];
  for (const f of candidates) {
    try {
      await figma.loadFontAsync(f);
      fontCache[key] = f;
      return f;
    } catch (e) { /* thử font kế */ }
  }
  throw new Error('Không load được font nào cho ' + family);
}

// ---------- node builders ----------
const imageCache = {};

function isSvgBytes(bytes) {
  let i = 0;
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) i = 3; // BOM
  while (i < bytes.length && bytes[i] <= 32) i++;
  const t = String.fromCharCode(bytes[i], bytes[i+1], bytes[i+2], bytes[i+3]);
  return t === '<svg' || t === '<?xm' || t === '<SVG';
}

function utf8BytesToString(bytes) {
  let s = '', i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) { s += String.fromCharCode(b); }
    else if ((b & 0xE0) === 0xC0) { s += String.fromCharCode(((b & 0x1F) << 6) | (bytes[i++] & 0x3F)); }
    else if ((b & 0xF0) === 0xE0) { s += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F)); }
    else { const cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F); s += String.fromCodePoint(cp); }
  }
  return s;
}

function assetImage(assets, id) {
  if (!id || !assets[id] || !assets[id].b64) return null;
  if (!imageCache[id]) {
    const bytes = figma.base64Decode(assets[id].b64);
    if (isSvgBytes(bytes)) {
      imageCache[id] = {svgText: utf8BytesToString(bytes)};
    } else {
      imageCache[id] = figma.createImage(bytes);
    }
  }
  return imageCache[id];
}

function setRadius(f, radius) {
  if (!radius) return;
  f.topLeftRadius = radius[0];
  f.topRightRadius = radius[1];
  f.bottomRightRadius = radius[2];
  f.bottomLeftRadius = radius[3];
}

function place(fig, node, parent, origin) {
  fig.x = node.x - origin.x;
  fig.y = node.y - origin.y;
  parent.appendChild(fig);
}

async function build(node, parent, origin, assets) {
  const w = Math.max(node.w, 0.01), h = Math.max(node.h, 0.01);
  if (node.type === 'FRAME') {
    const f = figma.createFrame();
    f.name = node.name || 'frame';
    f.resize(w, h);
    f.fills = buildFills(node);
    setRadius(f, node.radius);
    if (node.border) {
      const p = solidPaint(node.border.color);
      if (p) {
        f.strokes = [p];
        f.strokeAlign = 'INSIDE';
        const [t, r, b, l] = node.border.widths;
        if (t === r && r === b && b === l) f.strokeWeight = t;
        else {
          f.strokeTopWeight = t; f.strokeRightWeight = r;
          f.strokeBottomWeight = b; f.strokeLeftWeight = l;
        }
      }
    }
    f.effects = buildEffects(node);
    f.clipsContent = !!node.clip;
    if (node.opacity != null) f.opacity = node.opacity;
    place(f, node, parent, origin);
    for (const c of node.children || []) await build(c, f, {x: node.x, y: node.y}, assets);
    return;
  }
  if (node.type === 'TEXT') {
    const font = await resolveFont(node.family, node.weight, node.italic);
    const t = figma.createText();
    t.fontName = font;
    t.characters = node.chars;
    t.fontSize = node.size;
    t.lineHeight = {value: node.lineHeight, unit: 'PIXELS'};
    t.letterSpacing = {value: node.letterSpacing || 0, unit: 'PIXELS'};
    const fill = solidPaint(node.color);
    if (fill) t.fills = [fill];
    t.textAlignHorizontal = {left: 'LEFT', start: 'LEFT', center: 'CENTER', right: 'RIGHT', end: 'RIGHT', justify: 'JUSTIFIED'}[node.align] || 'LEFT';
    if (node.decoration === 'underline') t.textDecoration = 'UNDERLINE';
    t.textAutoResize = 'HEIGHT';
    t.resize(w + 2, h);
    t.name = node.name || node.chars.slice(0, 28);
    place(t, node, parent, origin);
    return;
  }
  if (node.type === 'IMG') {
    const asset = assetImage(assets, node.asset);
    if (asset && asset.svgText) {
      try {
        const f = figma.createNodeFromSvg(asset.svgText);
        f.name = 'img';
        f.resize(w, h);
        if (node.opacity != null) f.opacity = node.opacity;
        place(f, node, parent, origin);
      } catch (e) {
        const r = figma.createRectangle();
        r.name = 'img (svg err)';
        r.resize(w, h);
        r.fills = [{type: 'SOLID', color: {r: 0.85, g: 0.85, b: 0.85}}];
        place(r, node, parent, origin);
      }
      return;
    }
    const r = figma.createRectangle();
    r.name = 'img';
    r.resize(w, h);
    r.fills = asset
        ? [{type: 'IMAGE', imageHash: asset.hash, scaleMode: node.fit === 'FIT' ? 'FIT' : 'FILL'}]
        : [{type: 'SOLID', color: {r: 0.85, g: 0.85, b: 0.85}}];
    setRadius(r, node.radius);
    r.effects = buildEffects(node);
    if (node.opacity != null) r.opacity = node.opacity;
    place(r, node, parent, origin);
    return;
  }
  if (node.type === 'ICON') {
    const asset = assets[node.asset];
    const s = Math.min(node.size || Math.min(w, h), Math.max(w, h));
    if (asset && asset.svg) {
      const c = parseColor(node.color) || {r: 0, g: 0, b: 0, a: 1};
      const hex = 'rgb(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ')';
      const svg = asset.svg.replace(/currentColor/g, hex);
      const f = figma.createNodeFromSvg(svg);
      f.name = node.name;
      f.resize(s, s);
      if (c.a < 1) f.opacity = c.a;
      f.x = node.x - origin.x + (w - s) / 2;
      f.y = node.y - origin.y + (h - s) / 2;
      parent.appendChild(f);
    } else {
      const e = figma.createEllipse();
      e.name = (node.name || 'icon') + ' (thiếu)';
      e.resize(s, s);
      const p = solidPaint(node.color);
      e.fills = p ? [p] : [];
      place(e, node, parent, origin);
    }
    return;
  }
  if (node.type === 'SVG') {
    try {
      const f = figma.createNodeFromSvg(node.svg);
      f.name = 'svg';
      f.resize(w, h);
      place(f, node, parent, origin);
    } catch (e) { /* svg hỏng thì bỏ qua */ }
  }
}

// ---------- main ----------
async function run(data) {
  const page = figma.createPage();
  page.name = 'V-Heritage (' + new Date().toLocaleDateString('vi') + ')';
  figma.currentPage = page;

  const COLS = 8, GAP_X = 90, GAP_Y = 140;
  const frames = [];
  for (let i = 0; i < data.screens.length; i++) {
    const s = data.screens[i];
    post('progress', (i + 1) + '/' + data.screens.length + ' ' + s.name);
    await yieldUI();
    const f = figma.createFrame();
    f.name = s.name;
    f.resize(s.w, s.h);
    f.x = (i % COLS) * (s.w + GAP_X);
    f.y = Math.floor(i / COLS) * (s.h + GAP_Y);
    const bg = solidPaint(s.bgColor);
    f.fills = bg ? [bg] : [];
    f.cornerRadius = s.radius || 0;
    f.clipsContent = true;
    page.appendChild(f);
    for (const c of s.children || []) await build(c, f, {x: 0, y: 0}, assetsRef(data));
    frames.push(f);
  }
  figma.viewport.scrollAndZoomIntoView(frames);
  post('done', frames.length + ' màn hình đã dựng.');
}

function assetsRef(data) { return data.assets || {}; }

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'import') return;
  try {
    await run(msg.data);
  } catch (e) {
    post('error', (e && e.message) || String(e));
  }
};
