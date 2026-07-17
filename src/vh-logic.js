window.VH_LOGIC = {
  handleHeroTouchStart(e) {
    this._heroTouchX = e.touches ? e.touches[0].clientX : e.clientX;
  },
  handleHeroTouchEnd(e) {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const dx = endX - (this._heroTouchX || 0);
    if (Math.abs(dx) > 40) {
      const cur = this.state.heroIndex || 0;
      if (dx < 0) {
        this.setState({heroIndex: (cur + 1) % 3});
      } else {
        this.setState({heroIndex: (cur - 1 + 3) % 3});
      }
    }
  },
  setupHeroSwipe() {
    const el = document.querySelector('.vh-hero-card-container');
    if (el && !el._vhSwipeBound) {
      el._vhSwipeBound = true;
      el.addEventListener('touchstart', (e) => this.handleHeroTouchStart(e), { passive: true });
      el.addEventListener('touchend', (e) => this.handleHeroTouchEnd(e), { passive: true });
      el.addEventListener('mousedown', (e) => this.handleHeroTouchStart(e));
      el.addEventListener('mouseup', (e) => this.handleHeroTouchEnd(e));
    }
  },
  deselectPin() {
    this.setState({curVenueId: null, _exploreH: 18});
  },
  exToggleH() {
    if (!(this.state.permissions && this.state.permissions.location === 1)) return;
    const cur = this.state._exploreH || 18;
    let next = 46;
    if (cur >= 32 && cur < 60) next = 80;
    else if (cur >= 60) next = 18;
    this.setState({_exploreH: next});
  },
  exDragStart(e) {
    if (!(this.state.permissions && this.state.permissions.location === 1)) return;
    if (e.button !== undefined && e.button !== 0) return;
    this._exDragged = false;
    const el = document.querySelector('.vh-explore-sheet-container');
    const parentH = (el && el.parentElement && el.parentElement.clientHeight) || 700;
    const sy = e.touches ? e.touches[0].clientY : e.clientY;
    const sh = this.state._exploreH || 18;
    let liveH = sh;
    if (el) el.style.transition = 'none'; // Tắt transition để bám tay khi kéo
    
    const move = (ev) => {
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      if (Math.abs(sy - y) > 4) this._exDragged = true;
      liveH = Math.max(14, Math.min(82, sh + (sy - y) / parentH * 100));
      if (el) el.style.height = liveH + '%';
    };
    
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      if (el) el.style.transition = 'height .25s cubic-bezier(.32,.72,0,1)'; // Bật lại transition
      
      if (this._exDragged) {
        // Đăng ký capturing click listener tạm thời để nuốt gọn click event giả lập ngay sau khi drag
        const blockGhostClick = (clickEv) => {
          clickEv.stopPropagation();
          clickEv.preventDefault();
          document.removeEventListener('click', blockGhostClick, true);
        };
        document.addEventListener('click', blockGhostClick, true);
        this._exDragged = false;
        
        const dy = liveH - sh;
        let snapped = sh;
        if (Math.abs(dy) >= 6) { // Ngưỡng vuốt tối thiểu 6% chiều cao
          if (dy > 0) { // Kéo lên
            if (sh === 18) snapped = 46;
            else if (sh === 46) snapped = 80;
            else snapped = 80;
          } else { // Kéo xuống
            if (sh === 80) snapped = 46;
            else if (sh === 46) snapped = 18;
            else snapped = 18;
          }
        }
        if (el) {
          void el.offsetHeight;
          el.style.height = snapped + '%';
        }
        this.setState({_exploreH: snapped});
      } else {
        if (el) el.style.height = sh + '%';
      }
    };
    
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, {passive: true});
    document.addEventListener('touchend', up);
  },
  setupExploreDrag() {
    const el = document.querySelector('.vh-explore-sheet-header');
    if (el && !el._vhDragBound) {
      el._vhDragBound = true;
      el.addEventListener('touchstart', (e) => this.exDragStart(e), { passive: true });
      el.addEventListener('mousedown', (e) => this.exDragStart(e));
      el.addEventListener('click', () => this.exToggleH());
    }
  },
  // ---- notif ----
  markRead(id) {
    const l = (this.state.notifList || this.NOTIF_SEED).map(n => n.id === id ? {...n, read: true} : n);
    this.setState({notifList: l});
  },
  delNotif(id) {
    const l = (this.state.notifList || this.NOTIF_SEED).filter(n => n.id !== id);
    this.setState({notifList: l});
    this.showToast('Đã xoá thông báo');
  },
  markAllRead() {
    const l = (this.state.notifList || this.NOTIF_SEED).map(n => ({...n, read: true}));
    this.setState({notifList: l});
    this.showToast('Đã đánh dấu tất cả đã đọc');
  },
  clearReadNotifs() {
    const l = (this.state.notifList || this.NOTIF_SEED).filter(n => !n.read);
    this.setState({notifList: l});
    this.showToast('Đã xoá thông báo đã đọc');
  },

  // ---- lifecycle ----
  componentDidMount() {
    // nạp lại ngôn ngữ đã lưu (nếu có) để cấu hình hệ thống ngay từ đầu
    try {
      const sl = localStorage.getItem('vh_lang');
      if (sl && this.langDefs.some(l => l.code === sl)) this.setState({language: sl});
      const sa = localStorage.getItem('vh_a11y');
      if (sa) {
        const a = JSON.parse(sa);
        if (a && typeof a === 'object') this.setState({a11y: Object.assign({}, this.state.a11y, a)});
      }
    } catch (e) {}
    // onboarding: splash → chọn ngôn ngữ (màn cấu hình đầu tiên)
    this._splashT = setTimeout(() => this.nav('language', 'fwd'), 1600);
    const PH = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="#EDE4C4"/><g fill="#cdbf9f"><rect x="70" y="150" width="100" height="40" rx="4"/><polygon points="120,70 160,110 80,110"/><rect x="92" y="110" width="56" height="42"/></g><circle cx="120" cy="92" r="6" fill="#ED8927"/></svg>');
    this._imgErr = (e) => {
      const el = e.target;
      if (el && el.tagName === 'IMG' && el.dataset.vhFb !== '1' && !/^data:/.test(el.getAttribute('src') || '')) {
        el.dataset.vhFb = '1';
        el.src = PH;
      }
    };
    document.addEventListener('error', this._imgErr, true);
    this._onClick = (e) => {
      if (this._lpFired || document._vhDragged) return;
      const el = e.target.closest && e.target.closest('[data-ripple]');
      if (!el || el.disabled) return;
      const r = el.getBoundingClientRect();
      const span = document.createElement('span');
      span.className = 'vh-ripple';
      const size = Math.max(r.width, r.height);
      span.style.width = span.style.height = size + 'px';
      span.style.left = ((e.clientX || (r.left + r.width / 2)) - r.left - size / 2) + 'px';
      span.style.top = ((e.clientY || (r.top + r.height / 2)) - r.top - size / 2) + 'px';
      el.appendChild(span);
      setTimeout(() => span.remove(), 600);
    };
    document.addEventListener('click', this._onClick, true);
    this._lpStart = (e) => {
      const el = e.target.closest && e.target.closest('[data-longpress]');
      if (!el) return;
      this._lpOrigin = {x: (e.touches ? e.touches[0] : e).clientX, y: (e.touches ? e.touches[0] : e).clientY};
      const id = parseInt(el.getAttribute('data-longpress'), 10);
      this._lpTimer = setTimeout(() => {
        this._lpFired = true;
        this.setState({curArtId: id || this.state.curArtId, sheet: 'context'});
        if (navigator.vibrate) navigator.vibrate(15);
      }, 500);
    };
    this._lpMove = (e) => {
      if (!this._lpTimer) return;
      const p = e.touches ? e.touches[0] : e;
      const o = this._lpOrigin || {x: p.clientX, y: p.clientY};
      if (Math.abs(p.clientX - o.x) > 5 || Math.abs(p.clientY - o.y) > 5) clearTimeout(this._lpTimer);
    };
    this._lpEnd = () => {
      clearTimeout(this._lpTimer);
      setTimeout(() => {
        this._lpFired = false;
      }, 60);
    };
    document.addEventListener('mousedown', this._lpStart, true);
    document.addEventListener('touchstart', this._lpStart, true);
    document.addEventListener('mousemove', this._lpMove, true);
    document.addEventListener('touchmove', this._lpMove, true);
    document.addEventListener('mouseup', this._lpEnd, true);
    document.addEventListener('touchend', this._lpEnd, true);
    // swipe ngang giữa các bước đăng ký (nghe ở document để không mất khi thả ngoài khung)
    this._rgDown = (e) => {
      if (this.state.screen !== 'register') return;
      this._rgSwipeOk = ['INPUT', 'TEXTAREA', 'BUTTON'].indexOf(e.target.tagName) === -1;
      this._rgX = e.clientX;
      this._rgY = e.clientY;
    };
    this._rgUp = (e) => {
      if (this.state.screen !== 'register' || !this._rgSwipeOk) return;
      this._rgSwipeOk = false;
      const dx = e.clientX - (this._rgX || 0), dy = e.clientY - (this._rgY || 0);
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) this.rgGoNext(); else this.rgGoPrev();
    };
    document.addEventListener('mousedown', this._rgDown, true);
    document.addEventListener('mouseup', this._rgUp, true);
    // Slideshow Hero Card: tự động chuyển slide sau mỗi 5 giây
    this._heroTimer = setInterval(() => {
      if (this.state.screen === 'home') {
        const cur = this.state.heroIndex || 0;
        this.setState({heroIndex: (cur + 1) % 3});
      }
    }, 5000);
    this.setupHeroSwipe();
    this.setupExploreDrag();
  },
  componentDidUpdate() {
    // pre-permission Thông báo: lần đầu vào Home sau khi tạo tài khoản (chỉ 1 lần)
    if (this.state.screen === 'home' && this._notifPromptPending && !this._notifPromptHandled) {
      this._notifPromptHandled = true;
      this._notifPromptPending = false;
      let asked = false;
      try { asked = localStorage.getItem('vh_notif_prompted') === '1'; } catch (e) {}
      const granted = this.state.permissions && this.state.permissions.notification === 1;
      if (!asked && !granted) {
        try { localStorage.setItem('vh_notif_prompted', '1'); } catch (e) {}
        // chờ Home render xong rồi mới hiện dialog mồi, tránh đột ngột
        clearTimeout(this._notifPromptT);
        this._notifPromptT = setTimeout(() => this.showNotifPrompt(), 650);
      }
    }
    if (this.state.screen === 'audioplayer' && this._apLyricsEl) {
      const act = this._apLyricsEl.querySelector('[data-lyric-active="true"]');
      if (act) {
        const c = this._apLyricsEl;
        const target = act.offsetTop - c.clientHeight / 2 + act.clientHeight / 2;
        c.scrollTo({top: Math.max(0, target), behavior: 'smooth'});
      }
    }
    this.setupHeroSwipe();
    this.setupExploreDrag();
  },
  componentWillUnmount() {
    clearInterval(this._heroTimer);
    clearInterval(this._preDlTimer);
    clearTimeout(this._splashT);
    clearTimeout(this._notifPromptT);
    clearTimeout(this._scanT);
    clearTimeout(this._venueDlT);
    clearTimeout(this._venueDlResetT);
    clearInterval(this._venueDlProgressT);
    clearTimeout(this._lpTimer);
    clearInterval(this._audioT);
    clearInterval(this._lockT);
    clearInterval(this._threeDT);
    clearInterval(this._resendT);
    document.removeEventListener('error', this._imgErr, true);
    document.removeEventListener('click', this._onClick, true);
    document.removeEventListener('mousedown', this._lpStart, true);
    document.removeEventListener('touchstart', this._lpStart, true);
    document.removeEventListener('mouseup', this._lpEnd, true);
    document.removeEventListener('touchend', this._lpEnd, true);
    document.removeEventListener('mousedown', this._rgDown, true);
    document.removeEventListener('mouseup', this._rgUp, true);
  },

  // ---- utility ----
  t(k) {
    return (this.i18n[this.state.language] || this.i18n.vi)[k];
  },
  homeGreeting() {
    const lang = this.state.language;
    const hr = new Date().getHours();
    const slot = hr < 12 ? 0 : hr < 18 ? 1 : 2;
    const g = {
      vi: ['Chào buổi sáng', 'Chào buổi chiều', 'Chào buổi tối'],
      en: ['Good morning', 'Good afternoon', 'Good evening'],
      cn: ['早上好', '下午好', '晚上好'],
    };
    const fallbackName = {vi: 'bạn', en: 'there', cn: '朋友'};
    const name = (this.state.user && this.state.user.name) || fallbackName[lang] || fallbackName.vi;
    return (g[lang] || g.vi)[slot] + ', ' + name;
  },
  vimg(seed, w, h) {
    const key = 'vh' + seed;
    const r = (typeof window !== 'undefined' && window.__resources && window.__resources[key]);
    return r || ('https://picsum.photos/seed/' + key + '/' + w + '/' + h);
  },
  showToast(msg, type) {
    clearTimeout(this._toastT);
    this.setState({toast: msg, toastType: type || 'success'});
    this._toastT = setTimeout(() => this.setState({toast: null}), 2600);
  },

  // ---- navigation ----
  nav(s, dir) {
    if (this._lpFired) return;
    // ghi nhớ màn gốc khi vào paywall → mua xong quay lại đúng màn
    if (s === 'paywall') {
      this._payReturn = this.state.screen;
      this._payReturnHistory = this.state.history.slice();
    }
    const h = this.state.history.slice();
    if (this.state.screen && this.state.screen !== s) h.push(this.state.screen);
    const nextState = {screen: s, history: h, navDir: dir || 'fwd', sheet: null, modal: null};
    if (s === 'explore') {
      nextState.curVenueId = null;
      nextState._exploreH = 18;
    }
    this.setState(nextState);
    this.clearAuthToast(s);
    if (s === 'scan') this.beginScan();
    if (s === 'threed') {
      this.setState({threeDPlaying: true});
      this.start3D();
    } else this.stop3D();
  },
  replace(s) {
    const nextState = {screen: s, sheet: null, modal: null, navDir: 'fwd'};
    if (s === 'explore') {
      nextState.curVenueId = null;
      nextState._exploreH = 18;
    }
    this.setState(nextState);
    this.clearAuthToast(s);
    if (s === 'scan') this.beginScan();
    if (s === 'threed') {
      this.setState({threeDPlaying: true});
      this.start3D();
    } else this.stop3D();
  },
  // xoá toast đang hiện khi vào màn đăng nhập / đăng ký
  clearAuthToast(s) {
    if (s === 'authchoice' || s === 'login' || s === 'register') {
      clearTimeout(this._toastT);
      this.setState({toast: null});
    }
  },
  back() {
    const h = this.state.history.slice();
    const prev = h.pop() || 'home';
    this.setState({screen: prev, history: h, navDir: 'back', sheet: null, modal: null});
    if (prev === 'threed') {
      this.setState({threeDPlaying: true});
      this.start3D();
    } else this.stop3D();
  },
  goTab(t) {
    if (this._lpFired) return;
    if (t === 'scan') {
      if (!(this.state.permissions && this.state.permissions.camera === 1)) {
        // chưa cấp quyền camera → chuyển sang màn hình cameraask dùng chung
        this._camAskReturnTab = 'scan';
        this.nav('cameraask', 'fwd');
        return;
      }
      this.nav('scan', 'fwd');
      return;
    }
    if (t === 'explore') {
      // chưa bật vị trí & chưa hoãn trong hôm nay → sang màn hỏi bật vị trí
      const locOn = this.state.permissions && this.state.permissions.location === 1;
      const snoozed = this.state._locSnoozeDay === new Date().toDateString();
      if (!locOn && !snoozed) {
        this.setState({screen: 'locationask', history: [], navDir: 'fwd', sheet: null, modal: null, _locAskChecked: false});
        return;
      }
    }
    const built = {home: 1, explore: 1, library: 1, profile: 1};
    if (!built[t]) {
      this.stub(t);
      return;
    }
    const nextState = {screen: t, history: [], navDir: 'fwd', sheet: null, modal: null};
    if (t === 'explore') {
      nextState.curVenueId = null;
      nextState._exploreH = 18;
    }
    this.setState(nextState);
  },
  // ---- màn hỏi bật vị trí (trước khi vào Khám phá) ----
  toggleLocAsk() {
    this.setState({_locAskChecked: !this.state._locAskChecked});
  },
  locAskGrant() {
    if (this.state._fromOnboarding) {
      this.setState({
        permissions: Object.assign({}, this.state.permissions, {location: 1}),
        screen: 'home', history: [], navDir: 'fwd', sheet: 'preDownloadPack', modal: null, _fromOnboarding: false
      });
    } else {
      // bật vị trí → vào thẳng Explore (bản đồ), history rỗng nên không lui về màn hỏi được
      this.setState({
        permissions: Object.assign({}, this.state.permissions, {location: 1}),
        curVenueId: null,
        _exploreH: 18, screen: 'explore', history: [], navDir: 'fwd', sheet: null, modal: null
      });
    }
  },
  locAskSkip() {
    if (this.state._fromOnboarding) {
      this.setState({
        screen: 'home', history: [], navDir: 'fwd', sheet: null, modal: null, _fromOnboarding: false
      });
    } else {
      if (this.state._locAskChecked) {
        // không nhắc lại trong hôm nay → hoãn cả ngày, vào Explore (Hà Nội), không lui về màn hỏi
        this.setState({
          _locSnoozeDay: new Date().toDateString(),
          curVenueId: null,
          screen: 'explore', history: [], navDir: 'fwd', sheet: null, modal: null
        });
      } else {
        // không bật, không hoãn → đẩy Explore lên trên màn hỏi (từ Explore lui về được)
        this.nav('explore', 'fwd');
      }
    }
  },

  // ---- walkthrough ----
  nextWalk() {
    const s = this.state.walkStep;
    if (s < 3) this.setState({walkStep: s + 1}); else this.nav('onboardloc', 'fwd');
  },
  prevWalk() {
    const s = this.state.walkStep;
    if (s > 0) this.setState({walkStep: s - 1});
  },
  goWalkStep(i) {
    this.setState({walkStep: i});
  },
  onWalkTouchStart(e) {
    this._walkTouchX = e.touches[0].clientX;
  },
  onWalkTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - (this._walkTouchX || 0);
    if (Math.abs(dx) < 50) return;
    if (dx < 0) this.nextWalk(); else this.prevWalk();
  },
  onWalkMouseDown(e) {
    this._walkMouseX = e.clientX;
  },
  onWalkMouseUp(e) {
    const dx = e.clientX - (this._walkMouseX || 0);
    if (Math.abs(dx) < 50) return;
    if (dx < 0) this.nextWalk(); else this.prevWalk();
  },
  skipWalk() {
    this.nav('onboardloc', 'fwd');
  },
  exitWalkToLanguage() {
    this.setState({
      screen: 'language',
      history: [],
      navDir: 'back',
      sheet: null,
      modal: null,
      walkStep: 0
    });
    this.clearAuthToast('language');
    this.stop3D();
  },

  // ---- auth helpers ----
  validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  },
  passStrength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s = Math.min(3, s + 1);
    return Math.min(3, s);
  },
  // Quy tắc hợp lệ: tối thiểu 8 ký tự + đạt ít nhất 2/3 (chữ hoa, chữ thường, chữ số)
  passCharTypes(p) {
    return [/[A-Z]/.test(p), /[a-z]/.test(p), /[0-9]/.test(p)].filter(Boolean).length;
  },
  passOk(p) {
    return p.length >= 8 && this.passCharTypes(p) >= 2;
  },
  passErr(p) {
    if (!p) return null;
    if (p.length < 8) return 'Mật khẩu cần ít nhất 8 ký tự.';
    if (this.passCharTypes(p) < 2) return 'Mật khẩu cần kết hợp chữ hoa, chữ thường hoặc chữ số.';
    return null;
  },

  // ---- auth actions ----
  doLogin() {
    if (Date.now() < this.state.lockedUntil) return;
    const {liEmail, liPass} = this.state;
    if (!liEmail || !liPass) return;
    const err = {email: null, pass: null};
    if (this.state.isOffline) {
      this.showToast('Không có kết nối mạng. Vui lòng kiểm tra và thử lại.', 'error');
      return;
    }
    if (!this.validEmail(liEmail)) {
      err.email = 'Định dạng email không đúng';
      this.setState({liErr: err});
      return;
    }
    if (liEmail.toLowerCase() !== this.DEMO_EMAIL) {
      err.email = 'Email này chưa có tài khoản.';
      err.emailAction = 'Đăng ký';
      this.setState({liErr: err});
      return;
    }
    if (liPass !== this.DEMO_PASS) {
      const fc = this.state.failedLogin + 1;
      if (fc >= 5) {
        this.lockLogin();
        err.pass = 'Sai quá 5 lần — đã tạm khoá';
        this.setState({liErr: err, failedLogin: fc});
        return;
      }
      err.pass = 'Mật khẩu không đúng. Thử lại hoặc Quên mật khẩu? (còn ' + (5 - fc) + ' lần)';
      this.setState({liErr: err, failedLogin: fc});
      return;
    }
    this.setState({
      liErr: {email: null, pass: null},
      failedLogin: 0,
      user: {name: 'Minh Anh', email: liEmail, isLoggedIn: true, age: 31}
    });
    this.enterApp();
  },
  // sau đăng nhập/đăng ký: đưa qua màn bật vị trí locationask nếu chưa có quyền vị trí
  enterApp() {
    const locOn = this.state.permissions && this.state.permissions.location === 1;
    if (!locOn) {
      this.setState({screen: 'locationask', history: [], navDir: 'fwd', sheet: null, modal: null, _locAskChecked: false, _fromOnboarding: true});
    } else {
      this.goTab('home');
    }
  },
  // ---- màn "Hỗ trợ đặc biệt" (tuỳ chọn) ----
  finishSpecial() {
    // lưu cấu hình trợ năng rồi vào app
    try { localStorage.setItem('vh_a11y', JSON.stringify(this.state.a11y)); } catch (e) {}
    this.enterApp();
  },
  startPreDownload() {
    if (this.state._preDlLoading) return;
    this.setState({_preDlLoading: true, _preDlProgress: 0});
    clearInterval(this._preDlTimer);
    this._preDlTimer = setInterval(() => {
      const cur = this.state._preDlProgress || 0;
      const next = Math.min(100, cur + 10);
      this.setState({_preDlProgress: next});
      if (next >= 100) {
        clearInterval(this._preDlTimer);
        this.downloadVenueDataPack(2); // Bảo tàng Mỹ thuật Việt Nam (venue id = 2)
        this.setState({_preDlLoading: false});
      }
    }, 150);
  },
  finishPreDownload() {
    clearInterval(this._preDlTimer);
    const success = (this.state._preDlProgress || 0) === 100;
    this.setState({
      sheet: null,
      _preDlLoading: false,
      _preDlProgress: 0
    });
    if (success) {
      this.openVenue(2); // Bảo tàng Mỹ thuật Việt Nam
    } else {
      this.showToast('Chào mừng bạn đến với V-Heritage ✦', 'success');
    }
  },
  // ---- pre-permission Thông báo: chỉ hiện 1 lần đầu khi user mới vào Home ----
  showNotifPrompt() {
    this.setState({
      modal: 'generic',
      modalData: {
        icon: 'ti-bell-ringing', iconBg: 'rgba(237,137,39,.14)', iconColor: 'var(--cta)',
        title: 'Bật thông báo hành trình',
        body: 'Cho phép V-Heritage gửi thông báo để bạn không bỏ lỡ các sự kiện văn hóa di sản và bài thuyết minh đặc sắc xung quanh nhé.',
        primary: 'Nhận thông báo', secondary: 'Để sau',
        onPrimary: () => this.requestNotif(),
      },
    });
  },
  requestNotif() {
    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      try {
        Promise.resolve(Notification.requestPermission()).then((res) => {
          if (res === 'granted') {
            this.setState({permissions: Object.assign({}, this.state.permissions, {notification: 1})});
            this.showToast('Đã bật thông báo hành trình ✦');
          } else {
            this.showToast('Bạn có thể bật lại trong Cài đặt');
          }
        });
      } catch (e) {}
    } else {
      this.showToast('Trình duyệt không hỗ trợ thông báo', 'error');
    }
  },
  // ============== MÀN QUYỀN TRUY CẬP (đồng bộ quyền hệ thống) ==============
  _permLabel(kind) {
    return {notification: 'Thông báo', camera: 'Camera', location: 'Vị trí'}[kind] || kind;
  },
  _setPermFlag(key, val) {
    this.setState({permissions: Object.assign({}, this.state.permissions, {[key]: val})});
  },
  _setDevicePerm(key, val) {
    this.setState({devicePerm: Object.assign({}, this.state.devicePerm, {[key]: val})});
  },
  // trạng thái quyền THẬT ở thiết bị → Promise<'granted'|'denied'|'prompt'|'unsupported'>
  _devicePermState(kind) {
    if (kind === 'notification') {
      if (typeof Notification === 'undefined') return Promise.resolve('unsupported');
      return Promise.resolve(Notification.permission === 'default' ? 'prompt' : Notification.permission);
    }
    const name = kind === 'camera' ? 'camera' : 'geolocation';
    if (navigator.permissions && navigator.permissions.query) {
      try {
        return Promise.resolve(navigator.permissions.query({name: name})).then((r) => r.state).catch(() => 'prompt');
      } catch (e) {
        return Promise.resolve('prompt');
      }
    }
    return Promise.resolve('prompt');
  },
  // gọi pop-up xin quyền GỐC của thiết bị → Promise<boolean granted>
  _requestDevicePerm(kind) {
    if (kind === 'notification') {
      if (typeof Notification === 'undefined') return Promise.resolve(false);
      return Promise.resolve(Notification.requestPermission()).then((r) => r === 'granted');
    }
    if (kind === 'camera') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({video: true}).then((s) => {
          s.getTracks().forEach((t) => t.stop());
          return true;
        }).catch(() => false);
      }
      return Promise.resolve(false);
    }
    if (kind === 'location') {
      if (navigator.geolocation) {
        return new Promise((res) => navigator.geolocation.getCurrentPosition(() => res(true), () => res(false), {timeout: 8000}));
      }
      return Promise.resolve(false);
    }
    return Promise.resolve(false);
  },
  // vào màn → gọi API kiểm tra trạng thái quyền thật của thiết bị (3 quyền)
  refreshDevicePerms() {
    ['notification', 'location', 'camera'].forEach((kind) => {
      this._devicePermState(kind).then((state) => {
        const patch = {[kind]: state};
        const next = Object.assign({}, this.state.devicePerm, patch);
        // quyền bị thu hồi ngoài hệ thống → đồng bộ tắt cờ nhận nội bộ
        const perms = Object.assign({}, this.state.permissions);
        if (state !== 'granted') perms[kind] = 0;
        this.setState({devicePerm: next, permissions: perms});
      });
    });
  },
  openAppPermissions() {
    this.refreshDevicePerms();
    this.nav('apppermissions', 'fwd');
  },
  // bộ xử lý đồng bộ chính cho toggle 3 quyền
  handlePermissionToggle(kind) {
    const dev = (this.state.devicePerm || {})[kind] || 'prompt';
    if (dev === 'unsupported') {
      this.showToast('Thiết bị không hỗ trợ ' + this._permLabel(kind), 'error');
      return;
    }
    // BỊ KHÓA ở hệ thống ('denied') → dialog mời mở Cài đặt máy
    if (dev === 'denied') {
      this.showSystemSettingsDialog(kind);
      return;
    }
    // ĐÃ CẤP ('granted') → tự do bật/tắt nhận dữ liệu nội bộ
    if (dev === 'granted') {
      const on = this.state.permissions[kind] === 1;
      this._setPermFlag(kind, on ? 0 : 1);
      this.showToast(on ? 'Đã tắt nhận ' + this._permLabel(kind) : 'Đã bật ' + this._permLabel(kind) + ' ✦');
      return;
    }
    // CHƯA HỎI ('prompt') → gọi pop-up xin quyền gốc; từ chối thì hướng dẫn vào Cài đặt
    this._requestDevicePerm(kind).then((ok) => {
      this._setDevicePerm(kind, ok ? 'granted' : 'denied');
      if (ok) {
        this._setPermFlag(kind, 1);
        this.showToast('Đã bật ' + this._permLabel(kind) + ' ✦');
      } else {
        this.showSystemSettingsDialog(kind);
      }
    });
  },
  showSystemSettingsDialog(kind) {
    const label = this._permLabel(kind);
    this.setState({
      modal: 'generic',
      modalData: {
        icon: 'ti-settings-exclamation', iconBg: 'rgba(221,14,14,.12)', iconColor: 'var(--error)',
        title: 'Quyền đang bị tắt',
        body: 'Quyền ' + label + ' đã bị tắt trong cài đặt hệ thống. Bạn có muốn mở Cài đặt máy để bật lại không?',
        primary: 'Mở Cài đặt máy', secondary: 'Để sau',
        onPrimary: () => this.openSystemSettings(kind),
      },
    });
  },
  openSystemSettings(kind) {
    if (typeof Linking !== 'undefined' && Linking.openSettings) { Linking.openSettings(); return; }
    this.showToast('Mở Cài đặt thiết bị → Ứng dụng → V-Heritage → bật lại quyền ' + this._permLabel(kind));
  },
  openPhotoCapture() {
    const camOn = this.state.permissions && this.state.permissions.camera === 1;
    const snoozed = this.state._camSnoozeDay === new Date().toDateString();
    if (!camOn) {
      if (snoozed) {
        this.showToast('Bạn cần cấp quyền camera trong cài đặt máy để chụp hình AR.', 'error');
      } else {
        this.nav('cameraask', 'fwd');
      }
    } else {
      this.nav('camerashot', 'fwd');
    }
  },
  camAskGrant() {
    this._requestDevicePerm('camera').then((ok) => {
      this._setDevicePerm('camera', ok ? 'granted' : 'denied');
      if (ok) {
        this._setPermFlag('camera', 1);
        this.showToast('Đã cấp quyền camera ✦', 'success');
        if (this._camAskReturnTab === 'scan') {
          this._camAskReturnTab = null;
          this.replace('scan');
        } else {
          this.replace('camerashot');
        }
      } else {
        this.showSystemSettingsDialog('camera');
      }
    });
  },
  camAskSkip() {
    if (this.state._camAskChecked) {
      this.setState({_camSnoozeDay: new Date().toDateString()});
    }
    const isScan = this._camAskReturnTab === 'scan';
    this._camAskReturnTab = null;
    this.showToast(isScan ? 'Bạn cần cấp quyền camera để quét hiện vật.' : 'Bạn cần cấp quyền camera để chụp hình AR.');
    this.back();
  },
  camAskBack() {
    this._camAskReturnTab = null;
    this.back();
  },
  toggleCamAsk() {
    this.setState({_camAskChecked: !this.state._camAskChecked});
  },
  // ---- chuỗi hỏi quyền ngay sau Walkthrough: Vị trí → Camera → Thông báo → AuthChoice ----
  onboardPermGrant() {
    const kind = {onboardloc: 'location', onboardcam: 'camera', onboardnotif: 'notification'}[this.state.screen];
    this._requestDevicePerm(kind).then((ok) => {
      this._setDevicePerm(kind, ok ? 'granted' : 'denied');
      if (ok) {
        this._setPermFlag(kind, 1);
        this.showToast('Đã cấp quyền ' + this._permLabel(kind) + ' ✦', 'success');
        this._onboardPermNext();
      } else {
        this.showSystemSettingsDialog(kind);
      }
    });
  },
  onboardPermSkip() {
    this._onboardPermNext();
  },
  _onboardPermNext() {
    const next = {onboardloc: 'onboardcam', onboardcam: 'onboardnotif', onboardnotif: 'authchoice'}[this.state.screen];
    this.nav(next, 'fwd');
  },
  takePhoto() {
    if (this.state._shutterFlash) return;
    this.setState({_shutterFlash: true});
    if (navigator.vibrate) navigator.vibrate(40);
    setTimeout(() => {
      this.setState({_shutterFlash: false});
      this.replace('photo');
      this.showToast('Đã lưu ảnh AR vào Bộ sưu tập ✦', 'success');
    }, 180);
  },
  // ---- Switch Mode AR (toggle in-place, không nav) ----
  switchARMode() {
    const next = this.state._arMode === 'camera' ? 'guestbook' : 'camera';
    this.setState({_arMode: next, _arGbBubble: null, _arGbText: ''});
  },
  setARModeCamera() {
    if (this.state._arMode === 'camera') return;
    this.setState({_arMode: 'camera', _arGbBubble: null, _arGbText: ''});
  },
  setARModeGuestbook() {
    if (this.state._arMode === 'guestbook') return;
    this.setState({_arMode: 'guestbook', _arGbBubble: null, _arGbText: ''});
  },
  selectARBubble(id) {
    this.setState({_arGbBubble: this.state._arGbBubble === id ? null : id});
  },
  closeARBubble() {
    this.setState({_arGbBubble: null});
  },
  handleSendGbAR() {
    const isPremium = !!(this.state.tiers && this.state.tiers.premium);
    let text = '';
    if (isPremium) {
      text = (this.state._arGbText || '').trim().slice(0, 200);
    } else {
      text = this.state._arGbSelectedTemplateText || '';
    }
    
    if (!text) return;
    
    this.guestbook = [{
      id: Date.now(),
      text: text,
      author: this.state.user.name || 'Bạn',
      likes: 0,
      time: 'vừa xong',
      premium: isPremium
    }, ...this.guestbook];
    
    this.setState({
      _arGbText: '',
      _arGbSelectedTemplateText: '',
      guestbookPosted: this.state.guestbookPosted + 1,
      _arGbBubble: null
    });
    
    this.showToast('Đã gửi lời nhắn.');
  },
  downloadNearby() {
    const packs = this.state.packs || [];
    if (!packs.some(p => p.id === 'pnear')) {
      this.setState({
        packs: [{
          id: 'pnear',
          name: 'Bảo tàng Mỹ thuật Việt Nam',
          size: 0.4,
          note: 'Vừa tải',
          fav: false
        }, ...packs]
      });
    }
    this.showToast('Đã tải gói AR — Bảo tàng Mỹ thuật Việt Nam ✦');
    this.goTab('home');
  },
  downloadVenueDataPack(venueId) {
    if (this.state._venueDownloadLoading) return;
    const ven = this.findVenue(venueId || this.state.curVenueId);
    if (!ven) {
      this.setState({_venueDownloadError: 'Không tìm thấy gói dữ liệu của địa điểm này.'});
      this.showToast('Không tìm thấy gói dữ liệu', 'error');
      return;
    }
    clearTimeout(this._venueDlT);
    clearTimeout(this._venueDlResetT);
    clearInterval(this._venueDlProgressT);
    this.setState({_venueDownloadLoading: true, _venueDownloadProgress: 0, _venueDownloadError: null});
    this._venueDlProgressT = setInterval(() => {
      const next = Math.min(95, (this.state._venueDownloadProgress || 0) + 12);
      this.setState({_venueDownloadProgress: next});
      if (next >= 95) clearInterval(this._venueDlProgressT);
    }, 120);
    this._venueDlT = setTimeout(() => {
      try {
        if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof document === 'undefined') {
          throw new Error('download-unavailable');
        }
        const pack = {
          app: 'V-Heritage',
          type: 'venue-data-pack',
          venue: {
            id: ven.id,
            name: ven.name,
            city: ven.city,
            artifactCount: ven.count,
            distance: ven.dist,
          },
          accessibility: {
            wheelchair: !!ven.wheelchair,
            status: ven.wheelchair ? 'Có lối tiếp cận' : 'Khó tiếp cận',
            guide: ven.floor,
          },
          downloadedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(pack, null, 2)], {type: 'application/json;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'v-heritage-dia-diem-' + ven.id + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 800);
        clearInterval(this._venueDlProgressT);
        this.setState({_venueDownloadLoading: false, _venueDownloadProgress: 100, _venueDownloadError: null});
        this._venueDlResetT = setTimeout(() => this.setState({_venueDownloadProgress: 0}), 700);
        this.showToast('Đã tải gói dữ liệu địa điểm ✦');
      } catch (e) {
        clearInterval(this._venueDlProgressT);
        this.setState({
          _venueDownloadLoading: false,
          _venueDownloadProgress: 0,
          _venueDownloadError: 'Không thể tải gói dữ liệu. Vui lòng thử lại.'
        });
        this.showToast('Không thể tải gói dữ liệu', 'error');
      }
    }, 600);
  },
  lockLogin() {
    this.setState({lockedUntil: Date.now() + 60000, lockCountdown: 60});
    clearInterval(this._lockT);
    this._lockT = setInterval(() => {
      const left = Math.ceil((this.state.lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(this._lockT);
        this.setState({lockCountdown: 0, failedLogin: 0, liErr: {email: null, pass: null}});
      } else this.setState({lockCountdown: left});
    }, 500);
  },
  // thứ tự bước đăng ký; chèn bước 'a11y' khi chọn 45+ (needA11y)
  rgOrder() {
    return this.state.rg.needA11y ? ['age', 'a11y', 'name', 'account', 'otp'] : ['age', 'name', 'account', 'otp'];
  },
  rgValidateStep(step) {
    const rg = this.state.rg;
    const err = {};
    if (step === 'age') {
      // năm sinh tuỳ chọn: chọn nhóm tuổi là đủ; nếu có nhập năm thì phải hợp lệ
      const birthStr = (rg.birth || '').trim();
      if (birthStr) {
        const birth = parseInt(birthStr, 10);
        const age = birth >= 1900 ? (2026 - birth) : null;
        if (!age || age < 0 || age > 130) err.birth = 'Năm sinh không hợp lệ';
      } else if (!rg.ageBracket) {
        err.birth = 'Chọn nhóm tuổi hoặc nhập năm sinh';
      }
    } else if (step === 'name') {
      if (!rg.first.trim()) err.first = true;
    }
    return err;
  },
  rgGoNext() {
    const rg = this.state.rg;
    const step = rg.step || 'age';
    const err = this.rgValidateStep(step);
    if (Object.keys(err).length) {
      this.setState({rg: Object.assign({}, rg, {err})});
      return;
    }
    // rời bước tuổi → sang nhập tên; trợ năng nay thiết lập ở màn riêng sau đăng ký
    if (step === 'age') {
      this.setState({
        rg: Object.assign({}, rg, {needA11y: false, step: 'name', err: {}, _dir: 'fwd'}),
      });
      return;
    }
    // account → otp chỉ đi qua nút "Tạo tài khoản" (doRegister: validate + gửi OTP), không cho vuốt nhảy
    if (step === 'account') return;
    const order = this.rgOrder();
    const idx = order.indexOf(step);
    if (idx < 0 || idx >= order.length - 1) return;
    this.setState({rg: Object.assign({}, rg, {step: order[idx + 1], err: {}, _dir: 'fwd'})});
  },
  rgGoPrev() {
    const rg = this.state.rg;
    const order = this.rgOrder();
    const idx = order.indexOf(rg.step || 'age');
    if (idx <= 0) return;
    const target = order[idx - 1];
    const patch = {rg: Object.assign({}, rg, {step: target, err: {}, _dir: 'back'})};
    // về lại bước tuổi → tắt xem-trước trợ năng
    if (target === 'age') patch.a11y = Object.assign({}, this.state.a11y, {visualLow: false});
    this.setState(patch);
  },
  // năm sinh: khoảng năm theo nhóm tuổi (18+ = 18..44 tuổi, 45+ = 45 tuổi trở lên)
  rgYearRange(bracket) {
    const cur = 2026;
    if (bracket === 'minor') return {min: cur - 17, max: cur};       // 2009..2026 (dưới 18)
    if (bracket === 'young') return {min: cur - 44, max: cur - 18};   // 1982..2008
    if (bracket === 'mature') return {min: 1932, max: cur - 45};      // 1932..1981
    return {min: 1932, max: cur};                                     // đầy đủ 1932..2026
  },
  // chọn nhóm tuổi: CHỈ đổi trạng thái select (bấm lại để bỏ chọn), KHÔNG tự chuyển bước — phải bấm "Tiếp tục"
  rgPickBracket(b) {
    const rg = this.state.rg;
    if (rg.ageBracket === b) {
      // bỏ chọn → ẩn khối trợ năng, tắt visualLow
      this.setState({
        rg: Object.assign({}, rg, {ageBracket: null, err: {}}),
        a11y: Object.assign({}, this.state.a11y, {visualLow: false}),
      });
      return;
    }
    const {min, max} = this.rgYearRange(b);
    const n = parseInt(rg.birth, 10);
    const keep = (n >= min && n <= max) ? rg.birth : '';
    // chọn nhóm 45+ → tự bật sẵn trợ năng "Người cao tuổi / mắt yếu"; nhóm khác → tắt
    this.setState({
      rg: Object.assign({}, rg, {ageBracket: b, birth: keep, err: {}}),
      a11y: Object.assign({}, this.state.a11y, {visualLow: b === 'mature'}),
    });
  },
  // gạt toggle ở bước trợ năng → đổi trực tiếp (xem trước ngay trên màn)
  toggleA11yAsk() {
    this.setState({a11y: Object.assign({}, this.state.a11y, {visualLow: !this.state.a11y.visualLow})});
  },
  // gõ/chọn năm sinh; nếu đã đủ 4 số thì tự suy ra nhóm tuổi cho khớp highlight + dropdown
  rgSetBirth(val) {
    const rg = this.state.rg;
    const s = String(val);
    const n = parseInt(s, 10);
    let bracket = rg.ageBracket;
    let recomputed = false;
    if (n >= 1900 && s.length === 4) {
      const a = 2026 - n;
      bracket = a >= 45 ? 'mature' : (a < 18 ? 'minor' : 'young');
      recomputed = true;
    }
    const err = Object.assign({}, rg.err);
    delete err.birth;
    const patch = {rg: Object.assign({}, rg, {birth: s, ageBracket: bracket, err})};
    // năm sinh đủ 4 số → 45+ tự bật trợ năng, ngược lại tắt
    if (recomputed) patch.a11y = Object.assign({}, this.state.a11y, {visualLow: bracket === 'mature'});
    this.setState(patch);
  },
  rgPickYear(y) {
    this.rgSetBirth(y);
    this.setState({sheet: null});
  },
  onRgTouchStart(e) {
    this._rgTSwipeOk = ['INPUT', 'TEXTAREA', 'BUTTON'].indexOf(e.target.tagName) === -1;
    this._rgTX = e.touches[0].clientX;
    this._rgTY = e.touches[0].clientY;
  },
  onRgTouchEnd(e) {
    if (!this._rgTSwipeOk) return;
    const dx = e.changedTouches[0].clientX - (this._rgTX || 0);
    const dy = e.changedTouches[0].clientY - (this._rgTY || 0);
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) this.rgGoNext(); else this.rgGoPrev();
  },
  doRegister() {
    const rg = this.state.rg;
    const err = {};
    if (!this.validEmail(rg.email)) err.email = 'Định dạng email không đúng';
    else if (rg.email.toLowerCase() === this.DEMO_EMAIL) {
      err.email = 'Email này đã có tài khoản.';
      err.emailAction = 'Đăng nhập';
    }
    if (!this.passOk(rg.pass)) err.pass = true;
    if (rg.confirm !== rg.pass || !rg.confirm) err.confirm = 'Mật khẩu xác nhận không khớp';
    if (!rg.terms) {
      this.setState({rgTermsShake: Date.now()});
      err.terms = true;
    }
    this.setState({rg: Object.assign({}, rg, {err})});
    if (Object.keys(err).length) {
      if (err.terms && Object.keys(err).length === 1) this.showToast('Vui lòng đồng ý điều khoản để tiếp tục', 'error');
      return;
    }
    // hợp lệ → gửi OTP về email, sang màn Xác thực Email (bước 'otp')
    this.setState({
      rg: Object.assign({}, this.state.rg, {step: 'otp', err: {}, _dir: 'fwd'}),
      otpArr: ['', '', '', '', '', ''], fpOtpErr: null, _otpTries: 0,
    });
    this.startResend();
    this.showToast('Đã gửi mã OTP đến email — demo: 123456');
    setTimeout(() => {
      if (this._otpRefs && this._otpRefs[0]) this._otpRefs[0].focus();
    }, 120);
  },
  // hoàn tất đăng ký sau khi xác thực OTP thành công
  completeRegister() {
    const rg = this.state.rg;
    clearInterval(this._resendT);
    // năm sinh tuỳ chọn: nếu trống thì suy tuổi từ nhóm đã chọn (mặc định là người lớn)
    const birthStr = (rg.birth || '').trim();
    const birth = parseInt(birthStr, 10);
    const age = (birthStr && birth >= 1900) ? (2026 - birth) : (rg.ageBracket === 'mature' ? 45 : rg.ageBracket === 'minor' ? 16 : 18);
    if (age < 13) {
      this.setState({parentalSent: false, parentEmail: ''});
      this.nav('parental', 'fwd');
      return;
    }
    const fullName = (rg.last.trim() + ' ' + rg.first.trim()).trim();
    this.setState({user: {name: fullName, email: rg.email, isLoggedIn: true, age}});
    this.showToast('Chào mừng đến với V-Heritage ✦', 'success');
    // user mới → cần nhắc bật thông báo lần đầu vào Home (xử lý ở componentDidUpdate)
    this._notifPromptPending = true;
    // reset visualBlind + motor về mặc định trước màn Hỗ trợ đặc biệt (tránh kế thừa localStorage cũ)
    this.setState({a11y: Object.assign({}, this.state.a11y, {visualBlind: false, motor: false})});
    this.nav('special', 'fwd');
  },
  socialLogin(name, icon, color) {
    this.setState({modal: 'social', modalData: {name, icon, color}});
  },

  // ---- OTP / forgot ----
  startResend() {
    clearInterval(this._resendT);
    this.setState({fpResendCd: 60});
    this._resendT = setInterval(() => {
      const c = this.state.fpResendCd - 1;
      if (c <= 0) {
        clearInterval(this._resendT);
        this.setState({fpResendCd: 0});
      } else this.setState({fpResendCd: c});
    }, 1000);
  },
  verifyOtp() {
    const code = (this.state.otpArr || []).join('');
    const tries = (this.state._otpTries || 0) + 1;
    const isReg = this.state.screen === 'register' && this.state.rg.step === 'otp';
    if (code === '123456') {
      clearInterval(this._resendT);
      if (isReg) {
        this.completeRegister();
        return;
      }
      this.setState({fpStep: 'reset', fpNewPass: '', fpResendCd: 0, fpOtpErr: null});
      return;
    }
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    if (tries >= 3) this.setState({
      fpOtpErr: 'Sai quá 3 lần — hãy bấm Gửi lại mã',
      _otpTries: 0,
      otpArr: ['', '', '', '', '', '']
    });
    else this.setState({fpOtpErr: 'Mã không đúng, còn ' + (3 - tries) + ' lần thử', _otpTries: tries});
  },
  otpInput(i, raw) {
    const d = (raw || '').replace(/\D/g, '');
    const arr = (this.state.otpArr || ['', '', '', '', '', '']).slice();
    if (d.length > 1) {
      const chars = d.slice(0, 6).split('');
      for (let k = 0; k < 6; k++) arr[k] = chars[k] || '';
      this.setState({otpArr: arr, fpOtpErr: null});
      const last = Math.min(chars.length, 6) - 1;
      setTimeout(() => {
        if (this._otpRefs && this._otpRefs[last]) this._otpRefs[last].focus();
      }, 0);
      if (arr.join('').length === 6) setTimeout(() => this.verifyOtp(), 150);
      return;
    }
    arr[i] = d;
    this.setState({otpArr: arr, fpOtpErr: null});
    if (d && i < 5) setTimeout(() => {
      if (this._otpRefs && this._otpRefs[i + 1]) this._otpRefs[i + 1].focus();
    }, 0);
    if (arr.join('').length === 6) setTimeout(() => this.verifyOtp(), 150);
  },
  otpKey(i, e) {
    if (e.key === 'Backspace') {
      const arr = (this.state.otpArr || ['', '', '', '', '', '']).slice();
      if (!arr[i] && i > 0) {
        arr[i - 1] = '';
        this.setState({otpArr: arr});
        setTimeout(() => {
          if (this._otpRefs && this._otpRefs[i - 1]) this._otpRefs[i - 1].focus();
        }, 0);
      } else {
        arr[i] = '';
        this.setState({otpArr: arr});
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      if (this._otpRefs && this._otpRefs[i - 1]) this._otpRefs[i - 1].focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      if (this._otpRefs && this._otpRefs[i + 1]) this._otpRefs[i + 1].focus();
    }
  },
  upRg(field, val, clearErrs) {
    const rg = this.state.rg;
    const err = Object.assign({}, rg.err);
    (clearErrs || [field]).forEach(k => {
      delete err[k];
      if (k === 'email') delete err.emailAction;
    });
    this.setState({rg: Object.assign({}, rg, {[field]: val, err})});
  },

  // ---- collections / guestbook ----
  toggleSave(id, quiet) {
    const saved = this.state.saved.slice();
    const i = saved.indexOf(id);
    if (i >= 0) {
      saved.splice(i, 1);
      this.setState({saved});
      if (!quiet) this.showToast('Đã gỡ khỏi bộ sưu tập');
    } else {
      saved.push(id);
      this.setState({saved});
      if (!quiet) this.showToast('Đã thêm vào bộ sưu tập của bạn ✦');
    }
  },
  toggleArtInCollection(colId) {
    const id = this.state.curArtId;
    const cols = (this.state.collections || []).map(c => {
      if (c.id !== colId) return c;
      const items = (c.items || []).slice();
      const j = items.indexOf(id);
      if (j >= 0) items.splice(j, 1); else items.push(id);
      return {...c, items};
    });
    this.setState({collections: cols});
  },
  createCollection() {
    const name = (this.state._ccName || '').trim();
    if (!name) return;
    const addId = this.state._ccAddArt;
    const col = {id: 'c' + Date.now(), name, emoji: this.state._ccEmoji || '📁', items: addId ? [addId] : []};
    this.setState({
      collections: (this.state.collections || []).concat([col]),
      modal: null, _ccName: '', _ccEmoji: '📁', _ccAddArt: null,
      sheet: addId ? 'savecollection' : this.state.sheet,
    });
    this.showToast('Đã tạo bộ sưu tập "' + name + '" ✦');
  },
  gbLimitReached() {
    this.setState({
      modal: 'generic',
      modalData: {
        icon: 'ti-clock-pause',
        iconBg: 'rgba(255,165,0,.14)',
        iconColor: 'var(--warning)',
        title: 'Đã đạt giới hạn',
        body: 'Bạn đã đăng 3 lời nhắn hôm nay. Quay lại ngày mai nhé!',
        primary: 'Đã hiểu'
      }
    });
  },
  toggleGbLike(id) {
    const liked = Object.assign({}, this.state.liked);
    liked[id] = !liked[id];
    this.setState({liked});
  },

  // ---- artifact / venue ----
  // tra cứu venue ở cả danh sách chính lẫn điểm đến Top 10
  findVenue(id) {
    return this.venues.concat(this.destVenues || []).find(v => v.id === id);
  },
  openGoogleMaps(venueId) {
    const ven = this.findVenue(venueId);
    if (!ven) return;
    const info = this.venueInfos[ven.id] || { address: ven.city };
    let query = ven.name + ' ' + info.address;
    if (info.latitude && info.longitude) {
      query = info.latitude + ',' + info.longitude;
    }
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query), '_blank');
  },
  copyToClipboard(text, type = 'địa chỉ') {
    const msg = `Đã sao chép ${type} di tích ✦`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(msg, 'success');
      }).catch(() => {
        this.showToast('Không thể sao chép ' + type);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.showToast(msg, 'success');
    }
  },
  // hiện vật hiển thị của một nơi (điểm đến Top 10 không có hiện vật riêng → mẫu)
  venueArtifacts(venId) {
    let arr = this.artifacts.filter(a => a.venue === venId);
    if (arr.length === 0) {
      const start = (venId * 3) % this.artifacts.length;
      arr = [0, 1, 2].map(k => this.artifacts[(start + k) % this.artifacts.length]);
    }
    return arr;
  },
  // các tầng tham quan của một nơi (demo) + trạng thái tiếp cận và độ khám phá theo tầng
  venueFloors(venId) {
    const ven = this.findVenue(venId) || {};
    const arts = this.venueArtifacts(venId);
    const visited = this.state._visited || [];
    const t3ok = !!ven.wheelchair && ven.id % 2 === 1;
    const defs = [
      {name: 'Tầng 1', ok: true, note: 'Lối phẳng, cửa rộng — vào thẳng từ sảnh chính'},
      {name: 'Tầng 2', ok: !!ven.wheelchair, note: ven.wheelchair ? 'Có thang máy bên sảnh phải' : 'Chỉ có cầu thang — cần người hỗ trợ'},
      {name: 'Tầng 3', ok: t3ok, note: t3ok ? 'Thang máy và dốc thoải nối hai khu trưng bày' : 'Lối hẹp, có bậc cao — khó tiếp cận'},
    ];
    return defs.map((d, i) => {
      const fArts = arts.filter((a, k) => k % defs.length === i);
      const seen = fArts.filter(a => visited.includes(a.id)).length;
      return {
        ...d, idx: i, total: fArts.length, seen,
        pct: fArts.length ? Math.round(seen / fArts.length * 100) : 0,
      };
    });
  },
  // chỉ ghi nhận hiện vật đã mở xem (cho tiến độ card "Tiếp tục tham quan")
  recordVisit(id) {
    const visited = this.state._visited || [];
    if (visited.includes(id)) return;
    this.setState({_visited: visited.concat([id])});
  },
  openArtifact(id, fromScan) {
    if (this._lpFired) return;
    this.setState({curArtId: id, isPlaying: false, audioProgress: 0, _fromScan: !!fromScan});
    clearInterval(this._audioT);
    this.recordVisit(id);
    this.nav('artifact', 'fwd');
  },
  // Mở thẳng Màn 1 (mô hình 3D) cho card "Đang chờ khám phá" → nơi đang tham quan = venue của hiện vật
  openArtifactModel(id) {
    if (this._lpFired) return;
    const art = this.artifacts.find(a => a.id === id);
    this.setState({
      curArtId: id,
      isPlaying: false,
      audioProgress: 0,
      _fromScan: false,
      _visitVenue: art ? art.venue : this.state._visitVenue,
      _arMode: 'camera',
      _arGbBubble: null,
      _arGbText: '',
      _arGbSelectedTemplateText: '',
      _arGbDropdownOpen: false,
      threeDPanelY: 80
    });
    clearInterval(this._audioT);
    this.recordVisit(id);
    this.nav('threed', 'fwd');
  },
  // Sau khi quét/QR nhận diện: hiện Màn 1, thay scanner trong history (back về nguồn vào)
  revealArtifact(id) {
    const art = this.artifacts.find(a => a.id === id);
    this.setState({
      curArtId: id, isPlaying: false, audioProgress: 0, _fromScan: true,
      _visitVenue: art ? art.venue : this.state._visitVenue,
      _arMode: 'camera',
      _arGbBubble: null,
      _arGbText: '',
      _arGbSelectedTemplateText: '',
      _arGbDropdownOpen: false,
      threeDPanelY: 80,
      screen: 'threed', navDir: 'fwd', sheet: null, modal: null, threeDPlaying: true,
      history: this.state.history.filter(s => s !== 'scan' && s !== 'qrscanner')
    });
    clearInterval(this._audioT);
    this.recordVisit(id);
    this.start3D();
  },
  openVenue(id) {
    if (this._lpFired) return;
    this.setState({curVenueId: id, _visitVenue: id});
    this.nav('place', 'fwd');
  },
  selectPin(id) {
    this.setState({curVenueId: id, _exploreH: 46});
    clearTimeout(this._exScrollT);
    this._exScrollT = setTimeout(() => {
      const el = document.querySelector('[data-venue-card="' + id + '"]');
      if (el) el.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, 320);
  },
  stub(name) {
    this.setState({_stubName: name});
    this.nav('stub', 'fwd');
  },

  // ---- scan / AR ----
  beginScan() {
    clearTimeout(this._scanT);
    this.setState({scanState: 'scanning', scanFailReason: null, _forceFail: false});
    this._scanT = setTimeout(() => {
      if (this.state._forceFail) {
        this.setState({scanState: 'failed'});
        if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
      } else this.scanSuccess();
    }, 2600);
  },
  scanSuccess() {
    this.setState({scanState: 'flash'});
    if (navigator.vibrate) navigator.vibrate(15);
    setTimeout(() => {
      this.setState({scanState: 'idle'});
      this.revealArtifact(1);
      this.showToast('✦ Đã nhận diện — Trống đồng Đông Sơn');
    }, 480);
  },
  scanFail(reason) {
    clearTimeout(this._scanT);
    this.setState({_forceFail: true, scanFailReason: reason});
    this._scanT = setTimeout(() => this.setState({scanState: 'failed'}), 700);
  },
  retryScan() {
    this.setState({scanState: 'scanning', _forceFail: false, scanFailReason: null});
    clearTimeout(this._scanT);
    this._scanT = setTimeout(() => this.scanSuccess(), 1800);
  },
  exitScan() {
    clearTimeout(this._scanT);
    this.setState({scanState: 'idle'});
    this.back();
  },
  startQR() {
    clearTimeout(this._qrT);
    this.setState({
      screen: 'qrscanner',
      qrState: 'scanning',
      history: this.state.history.concat([this.state.screen]),
      navDir: 'fwd',
      sheet: null,
      modal: null
    });
    this._qrT = setTimeout(() => {
      this.setState({qrState: 'flash'});
      if (navigator.vibrate) navigator.vibrate(15);
      setTimeout(() => {
        this.setState({qrState: 'idle'});
        this.revealArtifact(1);
        this.showToast('✦ Mã QR hợp lệ — Trống đồng Đông Sơn');
      }, 460);
    }, 2200);
  },
  exitQR() {
    clearTimeout(this._qrT);
    this.setState({qrState: 'idle'});
    this.back();
  },

  // ---- audio ----
  startAudio(hd) {
    clearInterval(this._audioT);
    this.setState({isPlaying: true});
    this._audioT = setInterval(() => {
      this.setState(s => {
        const p = s.audioProgress + 1.4;
        if (p >= 100) {
          clearInterval(this._audioT);
          return {audioProgress: 100, isPlaying: false};
        }
        return {audioProgress: p};
      });
    }, 170);
  },
  toggleAudio() {
    if (this.state.isPlaying) {
      clearInterval(this._audioT);
      this.setState({isPlaying: false});
    } else {
      if (this.state.audioProgress >= 100) this.setState({audioProgress: 0});
      this.startAudio();
    }
  },
  fmtTime(p) {
    const total = 222;
    const cur = Math.floor(total * p / 100);
    const m = Math.floor(cur / 60);
    const s = cur % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  },
  // kéo tua trên thanh tiến trình (click + drag)
  audioScrubStart(e) {
    const bar = e.currentTarget;
    const seek = (clientX) => {
      const r = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, (clientX - r.left) / r.width * 100));
      this.setState({audioProgress: pct});
    };
    seek(e.touches ? e.touches[0].clientX : e.clientX);
    const move = (ev) => seek(ev.touches ? ev.touches[0].clientX : ev.clientX);
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, {passive: true});
    document.addEventListener('touchend', up);
  },

  selectHotspot(id) {
    if (this.state.activeHotspot === id) {
      this.setState({activeHotspot: null});
    } else {
      const nextState = {activeHotspot: id};
      if ((this.state.threeDPanelY !== undefined ? this.state.threeDPanelY : 80) > 150) {
        nextState.threeDPanelY = 80; // Trượt nhẹ panel lên để hiển thị thông tin hotspot
      }
      this.setState(nextState);
    }
  },
  openReportArtifact() {
    this.nav('report_screen');
    this.setState({
      _reportTypes: [],
      _reportText: '',
      _reportImage: null
    });
  },
  selectReportType(type) {
    let list = this.state._reportTypes || [];
    if (list.includes(type)) {
      list = list.filter(x => x !== type);
    } else {
      list = [...list, type];
    }
    this.setState({_reportTypes: list});
  },
  simulateUploadImage() {
    this.setState({_reportImage: 'https://picsum.photos/seed/reportimg/300/200'});
    this.showToast('Đã tải lên ảnh minh chứng thành công!', 'success');
  },
  removeReportImage() {
    this.setState({_reportImage: null});
  },
  submitReportScreen() {
    if (!this.state._reportTypes || this.state._reportTypes.length === 0) {
      this.showToast('Vui lòng chọn loại báo cáo sai sót!', 'error');
      return;
    }
    this.back();
    this.showToast('Đã gửi báo cáo! Ban Nghiên cứu di sản sẽ xác minh trong 24h tới ✦', 'success');
  },
  // ---- 3D viewer ----
  record3DInteraction() {
    this._last3DInteract = Date.now();
  },
  start3D() {
    clearInterval(this._threeDT);
    this._threeDT = setInterval(() => {
      if (!this.state.threeDPlaying || this._dragging3D || (this._last3DInteract && Date.now() - this._last3DInteract < 4000)) return;
      this.setState(s => ({threeDRot: (s.threeDRot + 0.6) % 360}));
    }, 40);
  },
  stop3D() {
    clearInterval(this._threeDT);
    this._threeDT = null;
  },
  toggle3DPlay() {
    this.record3DInteraction();
    this.setState(s => ({threeDPlaying: !s.threeDPlaying}));
  },
  zoom3DIn() {
    this.record3DInteraction();
    this.setState(s => ({threeDZoom: Math.min(1.8, s.threeDZoom + 0.2)}));
  },
  zoom3DOut() {
    this.record3DInteraction();
    this.setState(s => ({threeDZoom: Math.max(0.6, s.threeDZoom - 0.2)}));
  },
  reset3D() {
    this.record3DInteraction();
    this.setState({threeDRot: 0, threeDZoom: 1});
  },
  drag3DStart(e) {
    this._dragging3D = true;
    this._3dHasDragged = false;
    this.record3DInteraction();
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startRot = this.state.threeDRot;
    const move = (ev) => {
      this.record3DInteraction();
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      if (Math.abs(x - startX) > 5) this._3dHasDragged = true;
      this.setState({threeDRot: ((startRot + (x - startX) * 0.8) % 360 + 360) % 360});
    };
    const up = () => {
      this._dragging3D = false;
      // reset cờ sau 100ms để onTouchEnd/onMouseUp trên tap-catcher kịp đọc
      setTimeout(() => { this._3dHasDragged = false; }, 100);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, {passive: true});
    document.addEventListener('touchend', up);
  },
  dragPanelStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (this._draggingPanel) return; // Chặn phiên kéo chồng nhau (vd ngón tay thứ 2 chạm vào giữa lúc kéo)
    if (e.touches) this._lastPanelTouch = Date.now();
    // Sau tap trên mobile, browser bắn thêm mousedown giả lập (sau touchend) → toggle chạy 2 lần
    else if (Date.now() - (this._lastPanelTouch || 0) < 800) return;
    this._draggingPanel = true;
    this._panelDragged = false;
    const bottomSnap = 270;
    const middleSnap = 80;
    const topSnap = 0;
    const el = document.querySelector('[key^="hotspot-content-"]')?.parentElement; // Tìm element panel
    const sy = e.touches ? e.touches[0].clientY : e.clientY;
    const startPanelY = this.state.threeDPanelY !== undefined ? this.state.threeDPanelY : middleSnap;
    let liveY = startPanelY;
    
    // Tắt transition để panel bám tay ngay lập tức
    const panelEl = el || document.querySelector('[style*="translateY"]');
    if (panelEl) panelEl.style.transition = 'none';

    const move = (ev) => {
      if (ev.cancelable) ev.preventDefault(); // Ngăn browser scroll đè lên kéo panel
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const dy = y - sy;
      if (Math.abs(dy) > 4) this._panelDragged = true;
      let rawY = startPanelY + dy;
      
      // Khi kéo quá mốc trên cùng, giữ đáy panel dính sát đáy màn hình
      // và chỉ nới chiều cao ở phía trên để không lộ nền đen phía sau.
      if (rawY < topSnap) {
        liveY = topSnap;
        this.setState({
          threeDPanelY: topSnap,
          threeDPanelStretch: Math.round(Math.abs(rawY - topSnap) * 0.35)
        });
      } else if (rawY > bottomSnap) {
        liveY = bottomSnap + (rawY - bottomSnap) * 0.35; // Lực cản lò xo khi kéo quá mốc thấp nhất
        this.setState({threeDPanelY: liveY, threeDPanelStretch: 0});
      } else {
        liveY = rawY;
        this.setState({threeDPanelY: liveY, threeDPanelStretch: 0});
      }
    };

    const up = () => {
      this._draggingPanel = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      
      // Bật lại transition mượt mà
      if (panelEl) panelEl.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      
      let snappedY = startPanelY;
      
      if (this._panelDragged) {
        // Chặn click event giả lập sau khi drag
        const blockClick = (clickEv) => {
          clickEv.stopPropagation();
          clickEv.preventDefault();
          document.removeEventListener('click', blockClick, true);
        };
        document.addEventListener('click', blockClick, true);
        this._panelDragged = false;

        // Snap về mốc gần nhất trong 3 mốc (top: 0, middle: 80, bottom: 270)
        if (liveY < (topSnap + middleSnap) / 2) snappedY = topSnap;
        else if (liveY < (middleSnap + bottomSnap) / 2) snappedY = middleSnap;
        else snappedY = bottomSnap;
      } else {
        // Click nhẹ -> Toggle xoay vòng các mốc hiện tại
        if (startPanelY === middleSnap) snappedY = topSnap;
        else if (startPanelY === topSnap) snappedY = bottomSnap;
        else snappedY = middleSnap;
      }
      
      this.setState({threeDPanelY: snappedY, threeDPanelStretch: 0});
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move);
    document.addEventListener('touchend', up);
  },
  // ---- time travel (2 mốc) ----
  pickTimeStage(idx) {
    this.setState({
      timeIdx: idx,
      _timeTravelPct: idx === 0 ? 0 : 100
    });
  },
  changeTimeStage(dir) {
    const next = Math.min(1, Math.max(0, this.state.timeIdx + dir));
    if (next === this.state.timeIdx) return;
    this.pickTimeStage(next);
  },
  timeSliderStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this._draggingTimeSlider = true;
    
    const track = document.getElementById('time-travel-track');
    if (!track) return;
    
    const rect = track.getBoundingClientRect();
    const width = rect.width;
    const startX = rect.left;
    
    const update = (clientX) => {
      const relativeX = clientX - startX;
      // Thumb di chuyển trong vùng 25% → 75% của chiều rộng track
      const startPx = width * 0.25;
      const usableWidth = width * 0.5;
      let pct = ((relativeX - startPx) / usableWidth) * 100;
      pct = Math.max(0, Math.min(100, pct));
      
      // 2 mốc: ngưỡng snap tại 50%
      const nextIdx = pct < 50 ? 0 : 1;
      
      const nextState = {_timeTravelPct: pct};
      if (nextIdx !== this.state.timeIdx) {
        nextState.timeIdx = nextIdx;
      }
      this.setState(nextState);
    };
    
    const initialX = e.touches ? e.touches[0].clientX : e.clientX;
    update(initialX);
    
    const move = (ev) => {
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      update(x);
    };
    
    const up = () => {
      this._draggingTimeSlider = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      
      // Snap về mốc gần nhất (2 mốc: ngưỡng 50%)
      const pct = this.state._timeTravelPct !== undefined ? this.state._timeTravelPct : 0;
      let snappedIdx, snappedPct;
      if (pct < 50) {
        snappedIdx = 0;
        snappedPct = 0;
      } else {
        snappedIdx = 1;
        snappedPct = 100;
      }
      
      this.setState({
        timeIdx: snappedIdx,
        _timeTravelPct: snappedPct
      });
    };
    
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, {passive: true});
    document.addEventListener('touchend', up);
  },
  timeSwipeStart(e) {
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    let done = false;
    const move = (ev) => {
      if (done) return;
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const dx = x - startX;
      if (Math.abs(dx) > 45) {
        done = true;
        this.changeTimeStage(dx < 0 ? 1 : -1);
        cleanup();
      }
    };
    const cleanup = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', cleanup);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', move, {passive: true});
    document.addEventListener('touchend', cleanup);
  },

  // ---- payment / profile ----
  processPayment() {
    if (this.state.isOffline) {
      this.showToast('Mất kết nối — giao dịch chưa hoàn tất.', 'error');
      return;
    }
    this._confetti = Array.from({length: 24}, (_, i) => ({
      left: (i * 4.1) % 100 + '%',
      delay: (i % 8) * 0.12 + 's',
      color: ['#ED8927', '#304574', '#5F8AEC', '#3DBA6A'][i % 4],
      dur: (1.2 + (i % 5) * 0.25) + 's'
    }));
    const tiers = this.state.tiers || {};
    tiers[this.state.paymentTier] = true;
    this.setState({tiers: Object.assign({}, tiers), screen: 'paymentsuccess', navDir: 'fwd'});
    this._payT = setTimeout(() => {
      // quay lại màn gốc đã mở paywall (nếu có), khôi phục history; mặc định về Hồ sơ
      const ret = this._payReturn || 'profile';
      const retH = (ret === 'profile') ? [] : (this._payReturnHistory || []);
      this.setState({screen: ret, history: retH, navDir: 'back'});
      if (ret === 'threed') {
        this.setState({threeDPlaying: true});
        this.start3D();
      }
      this._payReturn = null;
      this._payReturnHistory = null;
    }, 2600);
  },
  logout() {
    clearTimeout(this._toastT);
    this.setState({
      user: {name: '', email: '', isLoggedIn: false, age: null},
      tiers: {premium: false, academic: false},
      saved: [],
      history: [],
      screen: 'authchoice',
      toast: null
    });
  },
  premiumGate() {
    this.setState({
      modal: 'generic', modalData: {
        icon: 'ti-crown', iconBg: 'rgba(237,137,39,.14)', iconColor: 'var(--cta)',
        title: 'Tính năng gói Nhà nghiên cứu',
        body: 'Tính năng này thuộc gói Nhà nghiên cứu. Bạn có thể kích hoạt thêm gói này song song với gói hiện tại của mình.',
        primary: 'Thêm gói Nhà nghiên cứu', secondary: 'Để sau',
        onPrimary: () => {
          this.setState({paymentTier: 'premium'});
          this.nav('paywall', 'fwd');
        },
      }
    });
  },
  academicGate() {
    this.setState({
      modal: 'generic', modalData: {
        icon: 'ti-school', iconBg: 'rgba(95,138,236,.14)', iconColor: 'var(--info)',
        title: 'Tính năng gói Học giả',
        body: 'Thông tin học thuật chi tiết thuộc gói Học giả. Bạn có thể kích hoạt thêm gói này song song với gói hiện tại của mình.',
        primary: 'Thêm gói Học giả', secondary: 'Để sau',
        onPrimary: () => {
          this.setState({paymentTier: 'academic'});
          this.nav('paywall', 'fwd');
        },
      }
    });
  },
  toggleA11y(key) {
    const a = Object.assign({}, this.state.a11y, {[key]: !this.state.a11y[key]});
    this.setState({a11y: a});
    const names = {
      visualLow: 'Người cao tuổi / mắt yếu',
      visualBlind: 'Khiếm thị / screen reader',
      motor: 'Vận động khó khăn'
    };
    this.showToast((a[key] ? 'Đã bật: ' : 'Đã tắt: ') + names[key]);
  },
  sw(on) {
    return {track: on ? 'var(--cta)' : 'var(--bg-tertiary)', knob: on ? '19px' : '0px'};
  },

  // ---- badge modal helper ----
  badgeModalVals(md) {
    const a = this.achievements.find(x => x.id === (md && md.id)) || this.achievements[0];
    const pct = Math.round(100 * (a.progress || 0) / (a.target || 1));
    return {
      badgeName: a.name,
      badgeBlurb: a.blurb || '',
      badgeCond: a.cond || '',
      badgeIcon: a.icon,
      badgeBg: a.earned ? 'var(--cta)' : 'var(--bg-tertiary)',
      badgeIconColor: a.earned ? '#fff' : 'var(--text-tertiary)',
      badgeFilter: a.earned ? 'none' : 'grayscale(1)',
      badgeEarnedM: !!a.earned,
      badgeLockedM: !a.earned,
      badgeDate: a.date || '',
      badgePct: pct + '%',
      badgeProgressMsg: 'Bạn đã đạt ' + (a.progress || 0) + '/' + (a.target || 0) + (pct >= 70 ? ' — sắp đạt rồi!' : ''),
      badgeShare: () => {
        this.setState({modal: null});
        this.showToast('Đang lan toả thành tích...');
      },
    };
  },
};
