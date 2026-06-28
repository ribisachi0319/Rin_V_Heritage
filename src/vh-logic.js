window.VH_LOGIC = {
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
    this._splashT = setTimeout(() => this.nav('walkthrough', 'fwd'), 1600);
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
  },
  componentDidUpdate() {
    if (this.state.screen === 'audioplayer' && this._apLyricsEl) {
      const act = this._apLyricsEl.querySelector('[data-lyric-active="true"]');
      if (act) {
        const c = this._apLyricsEl;
        const target = act.offsetTop - c.clientHeight / 2 + act.clientHeight / 2;
        c.scrollTo({top: target, behavior: 'smooth'});
      }
    }
  },
  componentWillUnmount() {
    clearTimeout(this._splashT);
    clearTimeout(this._scanT);
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
    this.setState({screen: s, history: h, navDir: dir || 'fwd', sheet: null, modal: null});
    this.clearAuthToast(s);
    if (s === 'scan') this.beginScan();
    if (s === 'threed') {
      this.setState({threeDPlaying: true});
      this.start3D();
    } else this.stop3D();
  },
  replace(s) {
    this.setState({screen: s, sheet: null, modal: null, navDir: 'fwd'});
    this.clearAuthToast(s);
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
        // chưa cấp quyền camera → hỏi; từ chối thì ở lại tab hiện tại
        this.setState({
          modal: 'generic',
          modalData: {
            icon: 'ti-camera', iconBg: 'rgba(237,137,39,.14)', iconColor: 'var(--cta)',
            title: 'Cần quyền Camera',
            body: 'Quét và xem hiện vật bằng AR cần quyền truy cập camera của thiết bị.',
            primary: 'Cấp quyền', secondary: 'Để sau',
            onPrimary: () => {
              this.setState({permissions: Object.assign({}, this.state.permissions, {camera: 1})});
              this.nav('scan', 'fwd');
            },
          }
        });
        return;
      }
      this.nav('scan', 'fwd');
      return;
    }
    const built = {home: 1, explore: 1, library: 1, profile: 1};
    if (!built[t]) {
      this.stub(t);
      return;
    }
    this.setState({screen: t, history: [], navDir: 'fwd', sheet: null, modal: null});
  },

  // ---- walkthrough ----
  nextWalk() {
    const s = this.state.walkStep;
    if (s < 3) this.setState({walkStep: s + 1}); else this.nav('permissions', 'fwd');
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
    this.nav('permissions', 'fwd');
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
    const bad = [];
    if (p.length < 8) bad.push('ít nhất 8 ký tự');
    if (this.passCharTypes(p) < 2) bad.push('ít nhất 2 trong 3: chữ hoa, chữ thường, chữ số');
    return bad.length ? 'Mật khẩu cần ' + bad.join(' và ') : null;
  },

  // ---- auth actions ----
  doLogin() {
    if (Date.now() < this.state.lockedUntil) return;
    const {liEmail, liPass} = this.state;
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
    this.showToast('Chào mừng trở lại ✦', 'success');
    this.enterApp();
  },
  // sau đăng nhập/đăng ký: nếu đã bật vị trí → gợi ý tải gói AR gần đây, ngược lại vào thẳng Home
  enterApp() {
    if (this.state.permissions && this.state.permissions.location === 1) this.nav('nearby', 'fwd');
    else this.goTab('home');
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
    return this.state.rg.needA11y ? ['age', 'a11y', 'name', 'account'] : ['age', 'name', 'account'];
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
    // rời bước tuổi: tuổi ≥ 45 → chèn bước trợ năng; luôn reset trợ năng về tắt khi rời bước tuổi
    if (step === 'age') {
      const birthStr = (rg.birth || '').trim();
      const birth = parseInt(birthStr, 10);
      const age = (birthStr && birth >= 1900) ? (2026 - birth) : (rg.ageBracket === 'mature' ? 45 : null);
      const need = age != null && age >= 45;
      this.setState({
        a11y: Object.assign({}, this.state.a11y, {visualLow: false}),
        rg: Object.assign({}, rg, {needA11y: need, step: need ? 'a11y' : 'name', err: {}, _dir: 'fwd'}),
      });
      return;
    }
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
    if (bracket === 'young') return {min: cur - 44, max: cur - 18};   // 1982..2008
    if (bracket === 'mature') return {min: 1932, max: cur - 45};      // 1932..1981
    return {min: 1932, max: cur - 18};                                // đầy đủ 1932..2008
  },
  // chọn nhóm tuổi: young → bỏ qua trợ năng (3 bước); mature (45+) → chèn bước trợ năng (4 bước)
  rgPickBracket(b) {
    const rg = this.state.rg;
    const {min, max} = this.rgYearRange(b);
    const n = parseInt(rg.birth, 10);
    const keep = (n >= min && n <= max) ? rg.birth : '';
    const a11yOff = Object.assign({}, this.state.a11y, {visualLow: false});
    if (b === 'mature') {
      this.setState({a11y: a11yOff, rg: Object.assign({}, rg, {ageBracket: b, birth: keep, needA11y: true, step: 'a11y', _dir: 'fwd', err: {}})});
      return;
    }
    this.setState({a11y: a11yOff, rg: Object.assign({}, rg, {ageBracket: b, birth: keep, needA11y: false, step: 'name', _dir: 'fwd', err: {}})});
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
    if (n >= 1900 && s.length === 4) bracket = (2026 - n) >= 45 ? 'mature' : 'young';
    const err = Object.assign({}, rg.err);
    delete err.birth;
    this.setState({rg: Object.assign({}, rg, {birth: s, ageBracket: bracket, err})});
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
    // năm sinh tuỳ chọn: nếu trống thì suy tuổi từ nhóm đã chọn (mặc định là người lớn)
    const birthStr = (rg.birth || '').trim();
    const birth = parseInt(birthStr, 10);
    const age = (birthStr && birth >= 1900) ? (2026 - birth) : (rg.ageBracket === 'mature' ? 45 : 18);
    if (age < 13) {
      this.nav('parental', 'fwd');
      return;
    }
    const fullName = (rg.last.trim() + ' ' + rg.first.trim()).trim();
    this.setState({user: {name: fullName, email: rg.email, isLoggedIn: true, age}});
    this.showToast('Chào mừng đến với V-Heritage ✦', 'success');
    this.nav('language', 'fwd');
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
    if (code === '123456') {
      clearInterval(this._resendT);
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
  postGuestbookTemplate(t) {
    if (this.state.guestbookPosted >= 3) {
      this.gbLimitReached();
      return;
    }
    this.guestbook = [{
      id: Date.now(),
      text: t,
      author: this.state.user.name || 'Bạn',
      likes: 0,
      time: 'vừa xong',
      premium: false
    }, ...this.guestbook];
    this.setState({guestbookPosted: this.state.guestbookPosted + 1});
    this.showToast('Đã gửi lời nhắn ✦');
  },
  postGuestbook() {
    const txt = (this.state._gbText || '').trim().slice(0, 200);
    if (!txt) {
      this.showToast('Hãy viết vài dòng nhé', 'error');
      return;
    }
    if (this.state.guestbookPosted >= 3) {
      this.gbLimitReached();
      return;
    }
    this.guestbook = [{
      id: Date.now(),
      text: txt,
      author: this.state.user.name || 'Bạn',
      likes: 0,
      time: 'vừa xong',
      premium: false
    }, ...this.guestbook];
    this.setState({_gbText: '', guestbookPosted: this.state.guestbookPosted + 1});
    this.showToast('Đã gửi — hiển thị sau khi kiểm duyệt ✦');
  },

  // ---- artifact / venue ----
  // tra cứu venue ở cả danh sách chính lẫn điểm đến Top 10
  findVenue(id) {
    return this.venues.concat(this.destVenues || []).find(v => v.id === id);
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
      _visitVenue: art ? art.venue : this.state._visitVenue
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

  // ---- 3D viewer ----
  start3D() {
    clearInterval(this._threeDT);
    this._threeDT = setInterval(() => {
      if (!this.state.threeDPlaying || this._dragging3D) return;
      this.setState(s => ({threeDRot: (s.threeDRot + 2) % 360}));
    }, 40);
  },
  stop3D() {
    clearInterval(this._threeDT);
    this._threeDT = null;
  },
  toggle3DPlay() {
    this.setState(s => ({threeDPlaying: !s.threeDPlaying}));
  },
  drag3DStart(e) {
    this._dragging3D = true;
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startRot = this.state.threeDRot;
    const move = (ev) => {
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      this.setState({threeDRot: ((startRot + (x - startX) * 0.8) % 360 + 360) % 360});
    };
    const up = () => {
      this._dragging3D = false;
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

  // ---- time travel ----
  pickTimeStage(idx) {
    if (idx === 2 && !(this.state.tiers && this.state.tiers.premium)) {
      this.premiumGate();
      return;
    }
    this.setState({timeIdx: idx});
  },
  changeTimeStage(dir) {
    const next = Math.min(2, Math.max(0, this.state.timeIdx + dir));
    if (next === this.state.timeIdx) return;
    this.pickTimeStage(next);
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
