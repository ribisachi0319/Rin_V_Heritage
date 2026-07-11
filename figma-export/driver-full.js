// Chạy TRONG trang (được server inject). Chờ app boot, lần lượt set state từng màn
// theo fixtures, đo toàn bộ DOM của .vh-app rồi POST cây layer về server.
(function () {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  function log(msg) {
    try { fetch('/log', {method: 'POST', body: String(msg)}); } catch (e) {}
  }

  // ---------- helpers ----------
  function alpha(cssColor) {
    if (!cssColor || cssColor === 'transparent') return 0;
    const m = cssColor.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    const parts = m[1].split(',');
    return parts.length === 4 ? parseFloat(parts[3]) : 1;
  }

  function firstFamily(ff) {
    return (ff || '').split(',')[0].replace(/["']/g, '').trim();
  }

  function iconName(el) {
    for (const c of el.classList) {
      if (c !== 'ti' && c.startsWith('ti-')) return c.slice(3);
    }
    return null;
  }

  // ---------- serializer ----------
  let ORIGIN = {x: 0, y: 0};
  // Chế độ trợ năng "Người cao tuổi/mắt yếu" phóng to .vh-content bằng CSS transform:scale.
  // getBoundingClientRect() đã tự phản ánh transform (đúng vị trí/kích thước), nhưng
  // getComputedStyle() trả giá trị TRƯỚC transform (font-size, radius, shadow, padding...).
  // SCALE bù lại phần đó để hình dựng ra không bị lệch tỷ lệ so với khung đã phóng to.
  let SCALE = 1;

  function currentScale() {
    const el = document.querySelector('.vh-content');
    if (!el) return 1;
    const t = getComputedStyle(el).transform;
    const m = t && t.match(/matrix\(([^)]+)\)/);
    if (!m) return 1;
    const a = parseFloat(m[1].split(',')[0]);
    return a || 1;
  }

  function scalePx(str) {
    if (SCALE === 1 || !str) return str;
    return str.replace(/(-?[\d.]+)px/g, (_, n) => (parseFloat(n) * SCALE) + 'px');
  }

  function rectOf(el) {
    const r = el.getBoundingClientRect();
    return {
      x: +(r.left - ORIGIN.x).toFixed(2), y: +(r.top - ORIGIN.y).toFixed(2),
      w: +r.width.toFixed(2), h: +r.height.toFixed(2),
    };
  }

  function frameProps(el, cs) {
    const p = {};
    if (alpha(cs.backgroundColor) > 0) p.bgColor = cs.backgroundColor;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') p.bgImage = cs.backgroundImage;
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map(s => (parseFloat(cs['border' + s + 'Width']) || 0) * SCALE);
    if (bw.some(w => w > 0) && alpha(cs.borderTopColor || cs.borderLeftColor) > 0) {
      p.border = {widths: bw, color: cs.borderTopColor};
    }
    const rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
        .map(v => (parseFloat(v) || 0) * SCALE);
    if (rad.some(v => v > 0)) p.radius = rad;
    if (cs.boxShadow && cs.boxShadow !== 'none') p.shadow = scalePx(cs.boxShadow);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bf && bf !== 'none') p.backdrop = scalePx(bf);
    if (cs.filter && cs.filter !== 'none') p.filter = scalePx(cs.filter);
    if (parseFloat(cs.opacity) < 1) p.opacity = parseFloat(cs.opacity);
    return p;
  }

  function isVisual(p) {
    return !!(p.bgColor || p.bgImage || p.border || p.shadow || p.backdrop || p.opacity != null);
  }

  // Một text node (vd phần chữ thường trước/sau 1 đoạn <b>) có thể trải qua NHIỀU dòng
  // khi đoạn cha bị word-wrap. range.getBoundingClientRect() khi đó trả về 1 hình chữ nhật
  // bao trọn tất cả các dòng đó (mép trái = dòng lệch trái nhất, thường là dòng sau bắt đầu
  // từ lề đoạn văn) — SAI vị trí thật của phần chữ nằm giữa dòng đầu (ngay sau 1 đoạn in đậm
  // đứng trước chẳng hạn). Phải tách theo TỪNG DÒNG THẬT (getClientRects) rồi dùng
  // caretRangeFromPoint để dò đúng ký tự nào thuộc dòng nào.
  function lineRuns(n) {
    const range = document.createRange();
    range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5);
    const full = n.textContent;
    if (rects.length <= 1) return [{rect: rects[0], text: full}];
    const out = [];
    let offset = 0;
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      let endOffset = full.length;
      if (i < rects.length - 1 && document.caretRangeFromPoint) {
        const cr = document.caretRangeFromPoint(rect.right - 1, rect.top + rect.height / 2);
        if (cr && cr.startContainer === n && cr.startOffset > offset) endOffset = cr.startOffset;
      }
      out.push({rect, text: full.slice(offset, endOffset)});
      offset = endOffset;
      if (offset >= full.length) break;
    }
    return out;
  }

  function textNodesOf(el, cs, out) {
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent || !n.textContent.trim()) continue;
      const lineHeight = (cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.2 : parseFloat(cs.lineHeight)) * SCALE;
      for (const {rect: r, text: rawChars} of lineRuns(n)) {
        if (!r || r.width < 0.5 || r.height < 0.5) continue;
        let chars = rawChars.replace(/\s+/g, ' ').trim();
        if (!chars) continue;
        if (cs.textTransform === 'uppercase') chars = chars.toUpperCase();
        else if (cs.textTransform === 'lowercase') chars = chars.toLowerCase();
        out.push({
          type: 'TEXT', name: chars.slice(0, 28),
          x: +(r.left - ORIGIN.x).toFixed(2), y: +(r.top - ORIGIN.y).toFixed(2),
          w: +r.width.toFixed(2), h: +r.height.toFixed(2),
          chars,
          family: firstFamily(cs.fontFamily),
          weight: parseInt(cs.fontWeight, 10) || 400,
          italic: cs.fontStyle === 'italic',
          size: parseFloat(cs.fontSize) * SCALE,
          lineHeight,
          letterSpacing: (cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing)) * SCALE,
          color: cs.color,
          align: cs.textAlign,
          decoration: cs.textDecorationLine !== 'none' ? cs.textDecorationLine : null,
          // Đã tách theo dòng thật (getClientRects) nên luôn là 1 dòng — để Figma tự co khung
          // theo font thực tế dùng để render (tránh font thay thế rộng hơn ép tràn dòng).
          singleLine: true,
        });
      }
    }
  }

  // Trả về extraH: phần chiều cao (px, đã nhân SCALE) mà subtree này cần cộng thêm
  // lên khung cha để chứa trọn nội dung cuộn dọc (không bị Figma clip mất phần dưới fold).
  function ser(el, out) {
    if (el.nodeType !== 1) return 0;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return 0;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return 0;
    const rect = rectOf(el);

    // Icon font Tabler
    if (tag === 'I') {
      const ic = iconName(el);
      if (ic) {
        out.push({
          type: 'ICON', name: 'icon/' + ic, ...rect,
          icon: ic, color: cs.color, size: parseFloat(cs.fontSize) * SCALE,
        });
        return 0;
      }
    }
    if (tag === 'svg' || tag === 'SVG') {
      const clone = el.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', rect.w);
      clone.setAttribute('height', rect.h);
      out.push({type: 'SVG', name: 'svg', ...rect, svg: clone.outerHTML});
      return 0;
    }
    if (tag === 'IMG') {
      const src = el.currentSrc || el.src;
      if (!src) return 0;
      const node = {
        type: 'IMG', name: 'img', ...rect, src,
        fit: cs.objectFit === 'contain' ? 'FIT' : 'FILL',
      };
      const rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
          .map(v => (parseFloat(v) || 0) * SCALE);
      if (rad.some(v => v > 0)) node.radius = rad;
      if (cs.filter && cs.filter !== 'none') node.filter = scalePx(cs.filter);
      if (parseFloat(cs.opacity) < 1) node.opacity = parseFloat(cs.opacity);
      out.push(node);
      return 0;
    }

    if (rect.w < 0.5 || rect.h < 0.5) return 0;

    const p = frameProps(el, cs);
    const overflowing = /(hidden|auto|scroll)/.test(cs.overflow + cs.overflowY + cs.overflowX)
        && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2);
    const emit = isVisual(p) || overflowing || (p.radius && /hidden/.test(cs.overflow));

    // Tràn DỌC (không tính carousel ngang overflow-x) — mở khung ra hết chiều cao thật
    // thay vì cắt theo khung nhìn 844px, vì getBoundingClientRect() của các con vẫn
    // đúng vị trí thật (browser không "cắt" layout, chỉ cắt phần vẽ ra).
    const vOverflow = /(hidden|auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2;
    const selfExtra = vOverflow ? (el.scrollHeight - el.clientHeight) * SCALE : 0;

    let target = out;
    let node = null;
    if (emit) {
      node = {
        type: 'FRAME',
        name: el.dataset.screenLabel || labelFor(el),
        ...rect, ...p,
        clip: /(hidden|auto|scroll)/.test(cs.overflow + cs.overflowY),
        children: [],
      };
      if (selfExtra > 0) { node.h += selfExtra; node.clip = false; }
      out.push(node);
      target = node.children;
    }

    // input/textarea: vẽ chữ value/placeholder
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const val = el.value || el.placeholder || '';
      if (val && el.type !== 'checkbox' && el.type !== 'radio') {
        const padL = (parseFloat(cs.paddingLeft) || 0) * SCALE;
        const size = parseFloat(cs.fontSize) * SCALE;
        const chars = el.type === 'password' ? '••••••'.slice(0, Math.min(6, val.length)) : val;
        target.push({
          type: 'TEXT', name: chars.slice(0, 28),
          x: rect.x + padL, y: rect.y + rect.h / 2 - size * 0.7, w: rect.w - padL * 2, h: size * 1.4,
          chars, family: firstFamily(cs.fontFamily),
          weight: parseInt(cs.fontWeight, 10) || 400, italic: false,
          size, lineHeight: size * 1.4, letterSpacing: 0,
          color: el.value ? cs.color : 'rgba(120,128,145,0.8)',
          align: cs.textAlign === 'start' ? 'left' : cs.textAlign, decoration: null,
        });
      }
      return 0;
    }

    textNodesOf(el, cs, target);
    let childExtra = 0;
    for (const child of el.children) childExtra = Math.max(childExtra, ser(child, target));
    const totalExtra = Math.max(selfExtra, childExtra);
    if (node && totalExtra > selfExtra) node.h += totalExtra - selfExtra;

    // frame rỗng không nền → bỏ (đỡ rác layer)
    if (node && !isVisual(p) && node.children.length === 0) out.pop();
    return totalExtra;
  }

  function labelFor(el) {
    if (el.tagName === 'BUTTON') return 'button';
    if (el.classList.contains('vh-scroll')) return 'scroll';
    if (el.classList.contains('vh-content')) return 'content';
    return el.tagName.toLowerCase();
  }

  async function waitImages(root, timeout) {
    const imgs = [...root.querySelectorAll('img')];
    const t0 = Date.now();
    await Promise.all(imgs.map(img => img.complete ? null : new Promise(res => {
      img.addEventListener('load', res, {once: true});
      img.addEventListener('error', res, {once: true});
      setTimeout(res, timeout);
    })));
    return Date.now() - t0;
  }

  // ---------- main ----------
  async function main() {
    let tries = 0;
    while (!window.__vh && tries++ < 300) await sleep(100);
    if (!window.__vh) { log('FATAL: không bắt được instance'); return; }
    const inst = window.__vh;
    await sleep(1200);
    await document.fonts.ready;
    // đợi timer splash nổ xong (nav sang màn kế) — nếu không nó sẽ đè state mình set
    let w = 0;
    while (inst.state.screen === 'splash' && w++ < 80) await sleep(100);
    await sleep(300);
    const initial = JSON.parse(JSON.stringify(inst.state));

    // chế độ chụp thử 1 màn: ?shot=<id>[&theme=dark][&vlow=1] — set state rồi đứng yên để chrome --screenshot
    const params = new URLSearchParams(location.search);
    const shot = params.get('shot');
    if (shot) {
      log('shot mode: ' + shot);
      const fx = window.VH_FIXTURES.find(f => f.id === shot);
      if (fx) {
        const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
        const vlow = params.get('vlow') === '1';
        const a11y = Object.assign({}, initial.a11y, fx.state.a11y || {}, {visualLow: vlow});
        inst.setState({...initial, ...fx.state, theme, a11y, screen: fx.screen || fx.id, navDir: 'fwd', toast: null});
        await raf2();
        await waitImages(document, 8000);
        log('shot applied: ' + shot + ' screen=' + inst.state.screen);
      } else {
        log('shot KHÔNG tìm thấy fixture: ' + shot);
      }
      return;
    }

    // ?only=<id1>,<id2> — chỉ chạy vài fixture (debug nhanh, không phải export hết)
    const onlyParam = params.get('only');
    const onlyIds = onlyParam ? new Set(onlyParam.split(',')) : null;
    const fixtures = onlyIds ? window.VH_FIXTURES.filter(f => onlyIds.has(f.id)) : window.VH_FIXTURES;

    for (const fx of fixtures) {
      for (const theme of ['light', 'dark']) {
        for (const vlow of [false, true]) {
          const label = fx.id + (theme === 'dark' ? '/dark' : '') + (vlow ? '/vlow' : '');
          try {
            const a11y = Object.assign({}, initial.a11y, fx.state.a11y || {}, {visualLow: vlow});
            inst.setState({...initial, ...fx.state, theme, a11y, screen: fx.screen || fx.id, navDir: 'fwd', toast: null});
            await raf2();
            await sleep(350);
            const app = document.querySelector('.vh-app');
            if (!app) { log('SKIP ' + label + ': không thấy .vh-app'); continue; }
            await waitImages(app, 8000);
            await raf2();
            SCALE = currentScale();
            const r = app.getBoundingClientRect();
            ORIGIN = {x: r.left, y: r.top};
            const kids = [];
            const cs = getComputedStyle(app);
            let extraH = 0;
            for (const child of app.children) extraH = Math.max(extraH, ser(child, kids));
            const idSuffix = (theme === 'dark' ? '__dark' : '') + (vlow ? '__vlow' : '');
            const nameSuffix = (theme === 'dark' ? ' (Dark)' : '') + (vlow ? ' (Vlow)' : '');
            const screen = {
              id: fx.id + idSuffix,
              name: fx.name + nameSuffix,
              w: +r.width.toFixed(2), h: +(r.height + extraH).toFixed(2),
              bgColor: cs.backgroundColor,
              radius: parseFloat(cs.borderTopLeftRadius) || 0,
              children: kids,
            };
            await fetch('/save', {
              method: 'POST', headers: {'content-type': 'application/json'},
              body: JSON.stringify(screen),
            });
            log('OK ' + label + ' (' + JSON.stringify(kids).length + ' bytes)');
          } catch (e) {
            log('ERR ' + label + ': ' + (e && e.message));
          }
        }
      }
    }
    await fetch('/done', {method: 'POST'});
  }

  main();
})();
