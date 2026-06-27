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
      const id = parseInt(el.getAttribute('data-longpress'), 10);
      this._lpTimer = setTimeout(() => {
        this._lpFired = true;
        this.setState({curArtId: id || this.state.curArtId, sheet: 'context'});
        if (navigator.vibrate) navigator.vibrate(15);
      }, 500);
    };
    this._lpEnd = () => {
      clearTimeout(this._lpTimer);
      setTimeout(() => {
        this._lpFired = false;
      }, 60);
    };
    document.addEventListener('mousedown', this._lpStart, true);
    document.addEventListener('touchstart', this._lpStart, true);
    document.addEventListener('mouseup', this._lpEnd, true);
    document.addEventListener('touchend', this._lpEnd, true);
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
    const h = this.state.history.slice();
    if (this.state.screen && this.state.screen !== s) h.push(this.state.screen);
    this.setState({screen: s, history: h, navDir: dir || 'fwd', sheet: null, modal: null});
    if (s === 'scan') this.beginScan();
    if (s === 'threed') {
      this.setState({threeDPlaying: true});
      this.start3D();
    } else this.stop3D();
  },
  replace(s) {
    this.setState({screen: s, sheet: null, modal: null, navDir: 'fwd'});
  },
  back() {
    const h = this.state.history.slice();
    const prev = h.pop() || 'home';
    this.setState({screen: prev, history: h, navDir: 'back', sheet: null, modal: null});
  },
  goTab(t) {
    if (this._lpFired) return;
    if (t === 'scan') {
      this.nav('scan', 'fwd');
      return;
    }
    if (t === 'explore' && !this._exploreSeen) {
      this._exploreSeen = true;
      this.nav('locperm', 'fwd');
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
    if (s < 3) this.setState({walkStep: s + 1}); else this.nav('authchoice', 'fwd');
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
  skipWalk() {
    this.nav('authchoice', 'fwd');
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
    this.nav('permissions', 'fwd');
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
  doRegister() {
    const rg = this.state.rg;
    const err = {};
    if (!rg.name.trim()) err.name = true;
    if (!this.validEmail(rg.email)) err.email = 'Định dạng email không đúng';
    else if (rg.email.toLowerCase() === this.DEMO_EMAIL) {
      err.email = 'Email này đã có tài khoản.';
      err.emailAction = 'Đăng nhập';
    }
    const birth = parseInt(rg.birth, 10);
    const age = birth > 1900 ? (2026 - birth) : null;
    if (!age || age < 0 || age > 120) err.birth = 'Năm sinh không hợp lệ';
    if (this.passStrength(rg.pass) < 2 || rg.pass.length < 8) err.pass = true;
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
    if (age < 13) {
      this.nav('parental', 'fwd');
      return;
    }
    this.setState({user: {name: rg.name, email: rg.email, isLoggedIn: true, age}});
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
  toggleSave(id) {
    const saved = this.state.saved.slice();
    const i = saved.indexOf(id);
    if (i >= 0) {
      saved.splice(i, 1);
      this.setState({saved});
      this.showToast('Đã gỡ khỏi bộ sưu tập');
    } else {
      saved.push(id);
      this.setState({saved});
      this.showToast('Đã thêm vào bộ sưu tập của bạn ✦');
    }
  },
  createCollection() {
    const name = (this.state._ccName || '').trim();
    if (!name) return;
    const col = {id: 'c' + Date.now(), name, emoji: this.state._ccEmoji || '📁', items: []};
    this.setState({collections: (this.state.collections || []).concat([col]), modal: null, _ccName: '', _ccEmoji: '📁'});
    this.showToast('Đã tạo bộ sưu tập "' + name + '" ✦');
  },
  postGuestbookTemplate(t) {
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
    const txt = (this.state._gbText || '').trim();
    if (!txt) {
      this.showToast('Hãy viết vài dòng nhé', 'error');
      return;
    }
    if (this.state.guestbookPosted >= 3) {
      this.setState({
        modal: 'generic',
        modalData: {
          icon: 'ti-clock-pause',
          iconBg: 'rgba(255,165,0,.14)',
          iconColor: 'var(--warning)',
          title: 'Đã đạt giới hạn',
          body: 'Bạn đã đăng 3 lời nhắn trong phiên này. Quay lại sau nhé!',
          primary: 'Đã hiểu'
        }
      });
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
  openArtifact(id, fromScan) {
    if (this._lpFired) return;
    this.setState({curArtId: id, isPlaying: false, audioProgress: 0, _fromScan: !!fromScan});
    clearInterval(this._audioT);
    this.nav('artifact', 'fwd');
  },
  openVenue(id) {
    if (this._lpFired) return;
    this.setState({curVenueId: id});
    this.nav('place', 'fwd');
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
      this.openArtifact(1, true);
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
        this.openArtifact(1, true);
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
      this.setState({screen: 'profile', history: [], navDir: 'back'});
    }, 2600);
  },
  logout() {
    this.setState({
      user: {name: '', email: '', isLoggedIn: false, age: null},
      tiers: {premium: false, academic: false},
      saved: [],
      history: [],
      screen: 'authchoice'
    });
    this.showToast('Đã đăng xuất');
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
