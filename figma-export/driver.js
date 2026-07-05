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
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map(s => parseFloat(cs['border' + s + 'Width']) || 0);
    if (bw.some(w => w > 0) && alpha(cs.borderTopColor || cs.borderLeftColor) > 0) {
      p.border = {widths: bw, color: cs.borderTopColor};
    }
    const rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
        .map(v => parseFloat(v) || 0);
    if (rad.some(v => v > 0)) p.radius = rad;
    if (cs.boxShadow && cs.boxShadow !== 'none') p.shadow = cs.boxShadow;
    const bf = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bf && bf !== 'none') p.backdrop = bf;
    if (cs.filter && cs.filter !== 'none') p.filter = cs.filter;
    if (parseFloat(cs.opacity) < 1) p.opacity = parseFloat(cs.opacity);
    return p;
  }

  function isVisual(p) {
    return !!(p.bgColor || p.bgImage || p.border || p.shadow || p.backdrop || p.opacity != null);
  }

  function textNodesOf(el, cs, out) {
    for (const n of el.childNodes) {
      if (n.nodeType !== 3) continue;
      let chars = n.textContent.replace(/\s+/g, ' ').trim();
      if (!chars) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) continue;
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
        size: parseFloat(cs.fontSize),
        lineHeight: cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.2 : parseFloat(cs.lineHeight),
        letterSpacing: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
        color: cs.color,
        align: cs.textAlign,
        decoration: cs.textDecorationLine !== 'none' ? cs.textDecorationLine : null,
      });
    }
  }

  function ser(el, out) {
    if (el.nodeType !== 1) return;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
    const rect = rectOf(el);

    // Icon font Tabler
    if (tag === 'I') {
      const ic = iconName(el);
      if (ic) {
        out.push({
          type: 'ICON', name: 'icon/' + ic, ...rect,
          icon: ic, color: cs.color, size: parseFloat(cs.fontSize),
        });
        return;
      }
    }
    if (tag === 'svg' || tag === 'SVG') {
      const clone = el.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', rect.w);
      clone.setAttribute('height', rect.h);
      out.push({type: 'SVG', name: 'svg', ...rect, svg: clone.outerHTML});
      return;
    }
    if (tag === 'IMG') {
      const src = el.currentSrc || el.src;
      if (!src) return;
      const node = {
        type: 'IMG', name: 'img', ...rect, src,
        fit: cs.objectFit === 'contain' ? 'FIT' : 'FILL',
      };
      const rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
          .map(v => parseFloat(v) || 0);
      if (rad.some(v => v > 0)) node.radius = rad;
      if (cs.filter && cs.filter !== 'none') node.filter = cs.filter;
      if (parseFloat(cs.opacity) < 1) node.opacity = parseFloat(cs.opacity);
      out.push(node);
      return;
    }

    if (rect.w < 0.5 || rect.h < 0.5) return;

    const p = frameProps(el, cs);
    const overflowing = /(hidden|auto|scroll)/.test(cs.overflow + cs.overflowY + cs.overflowX)
        && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2);
    const emit = isVisual(p) || overflowing || (p.radius && /hidden/.test(cs.overflow));

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
      out.push(node);
      target = node.children;
    }

    // input/textarea: vẽ chữ value/placeholder
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const val = el.value || el.placeholder || '';
      if (val && el.type !== 'checkbox' && el.type !== 'radio') {
        const padL = parseFloat(cs.paddingLeft) || 0;
        const size = parseFloat(cs.fontSize);
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
      return;
    }

    textNodesOf(el, cs, target);
    for (const child of el.children) ser(child, target);

    // frame rỗng không nền → bỏ (đỡ rác layer)
    if (node && !isVisual(p) && node.children.length === 0) out.pop();
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

    // chế độ chụp thử 1 màn: ?shot=<id>[&theme=dark] — set state rồi đứng yên để chrome --screenshot
    const params = new URLSearchParams(location.search);
    const shot = params.get('shot');
    if (shot) {
      log('shot mode: ' + shot);
      const fx = window.VH_FIXTURES.find(f => f.id === shot);
      if (fx) {
        const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
        inst.setState({...initial, ...fx.state, theme, screen: fx.id, navDir: 'fwd', toast: null});
        await raf2();
        await waitImages(document, 8000);
        log('shot applied: ' + shot + ' screen=' + inst.state.screen);
      } else {
        log('shot KHÔNG tìm thấy fixture: ' + shot);
      }
      return;
    }

    for (const fx of window.VH_FIXTURES) {
      for (const theme of ['light', 'dark']) {
        const label = fx.id + (theme === 'dark' ? '/dark' : '');
        try {
          inst.setState({...initial, ...fx.state, theme, screen: fx.id, navDir: 'fwd', toast: null});
          await raf2();
          await sleep(350);
          const app = document.querySelector('.vh-app');
          if (!app) { log('SKIP ' + label + ': không thấy .vh-app'); continue; }
          await waitImages(app, 8000);
          await raf2();
          const r = app.getBoundingClientRect();
          ORIGIN = {x: r.left, y: r.top};
          const kids = [];
          const cs = getComputedStyle(app);
          for (const child of app.children) ser(child, kids);
          const screen = {
            id: fx.id + (theme === 'dark' ? '__dark' : ''),
            name: fx.name + (theme === 'dark' ? ' (Dark)' : ''),
            w: +r.width.toFixed(2), h: +r.height.toFixed(2),
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
    await fetch('/done', {method: 'POST'});
  }

  main();
})();
