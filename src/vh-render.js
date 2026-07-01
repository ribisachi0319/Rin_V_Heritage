window.VH_RENDER = {
  renderVals() {
    return Object.assign({}, this.globalVals(), this.authVals(),
        (this.mainVals ? this.mainVals() : {}),
        (this.placeVals ? this.placeVals() : {}),
        (this.arVals ? this.arVals() : {}),
        (this.libVals ? this.libVals() : {}),
        (this.profileVals ? this.profileVals() : {}),
        (this.settingsVals ? this.settingsVals() : {}),
        (this.errorVals ? this.errorVals() : {}));
  },

  globalVals() {
    const st = this.state;
    const mainTabs = ['home', 'explore', 'library', 'profile'];
    const navDef = [
      {key: 'home', icon: 'ti-home', label: this.t('home')},
      {key: 'explore', icon: 'ti-map-2', label: this.t('explore')},
      {key: 'scan', isScan: true},
      {key: 'library', icon: 'ti-bookmark', label: this.t('library')},
      {key: 'profile', icon: 'ti-user', label: this.t('profile')},
    ];
    const navItems = navDef.map(n => {
      const active = st.screen === n.key;
      return {
        ...n,
        normal: !n.isScan,
        go: () => this.goTab(n.key),
        color: active ? 'var(--cta)' : 'var(--text-tertiary)',
        underline: active ? 'var(--cta)' : 'transparent',
        labelDisp: (active || st.a11y.visualLow) ? 'block' : 'none'
      };
    });
    const langs = this.langDefs.map(l => ({
      ...l,
      flagUrl: 'https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/' + l.iso + '.svg',
      active: st.language === l.code,
      border: st.language === l.code ? 'var(--cta)' : 'var(--border)',
      pickScreen: () => this.setState({language: l.code}),
      pickSheet: () => {
        this.setState({language: l.code, sheet: null});
        this.showToast('Đã đổi ngôn ngữ');
      },
      pickInline: () => this.setState({language: l.code})
    }));
    const cur = this.artifacts.find(a => a.id === st.curArtId) || this.artifacts[0];
    const md = st.modalData || {};
    const shareTargets = [
      {name: 'Zalo', icon: 'ti-brand-zalo', bg: '#0068FF'}, {
        name: 'Messenger',
        icon: 'ti-brand-messenger',
        bg: '#0084FF'
      },
      {name: 'Facebook', icon: 'ti-brand-facebook', bg: '#1877F2'}, {
        name: 'Instagram',
        icon: 'ti-brand-instagram',
        bg: '#E1306C'
      },
      {name: 'TikTok', icon: 'ti-brand-tiktok', bg: '#111'}, {
        name: 'Lưu máy',
        icon: 'ti-download',
        bg: 'var(--primary)'
      },
    ].map(s => ({
      ...s, tap: () => {
        this.setState({sheet: null});
        this.showToast('Đang lan tỏa di sản...');
      }
    }));

    const mainTabsSet = mainTabs.includes(st.screen);
    return {
      theme: st.theme,
      vlow: st.a11y.visualLow ? '1' : '0',
      vblind: st.a11y.visualBlind ? '1' : '0',
      vmotor: st.a11y.motor ? '1' : '0',
      navAnim: st.navDir === 'back' ? 'vhPopIn' : 'vhPushIn',
      screen: st.screen,
      isSplash: st.screen === 'splash',
      isWalk: st.screen === 'walkthrough',
      isAuthChoice: st.screen === 'authchoice',
      isLogin: st.screen === 'login',
      isRegister: st.screen === 'register',
      isForgot: st.screen === 'forgot',
      isParental: st.screen === 'parental',
      isLangScreen: st.screen === 'language',
      isSpecial: st.screen === 'special',
      isPermissionAsk: st.screen === 'locationask' || st.screen === 'cameraask',
      permIcon: st.screen === 'cameraask' ? 'ti-camera' : 'ti-map-pin',
      permTitle: st.screen === 'cameraask' ? 'Cấp quyền Camera?' : 'Bật vị trí của bạn?',
      permDesc: st.screen === 'cameraask' 
        ? (this._camAskReturnTab === 'scan'
          ? 'V-Heritage cần quyền truy cập camera để quét nhận diện hiện vật và trải nghiệm các tính năng AR.'
          : 'V-Heritage cần quyền truy cập camera để đưa mô hình hiện vật 3D hiển thị ngay trong không gian thực và cho phép bạn chụp hình lưu niệm.')
        : 'Cho phép truy cập vị trí để xem bản đồ di tích quanh bạn và gợi ý điểm đến gần nhất. Nếu bỏ qua, bản đồ sẽ mặc định ở Hà Nội.',
      permCta: st.screen === 'cameraask' ? 'Cấp quyền Camera' : 'Bật vị trí',
      permBoxBorder: st.screen === 'cameraask' 
        ? (st._camAskChecked ? 'var(--cta)' : 'var(--border)') 
        : (st._locAskChecked ? 'var(--cta)' : 'var(--border-2)'),
      permBoxBg: st.screen === 'cameraask' 
        ? (st._camAskChecked ? 'var(--cta)' : 'transparent') 
        : (st._locAskChecked ? 'var(--cta)' : 'transparent'),
      permCheckDisp: st.screen === 'cameraask' 
        ? (st._camAskChecked ? 'block' : 'none') 
        : (st._locAskChecked ? 'block' : 'none'),
      permBack: () => st.screen === 'cameraask' ? this.camAskBack() : this.back(),
      permGrant: () => st.screen === 'cameraask' ? this.camAskGrant() : this.locAskGrant(),
      permSkip: () => st.screen === 'cameraask' ? this.camAskSkip() : this.locAskSkip(),
      togglePermAsk: () => st.screen === 'cameraask' ? this.toggleCamAsk() : this.toggleLocAsk(),
      offlineBanner: st.isOffline && st.hasPacks && mainTabsSet,
      t_offlineBanner: this.t('offlineBanner'),
      toggleOffline: () => {
        this.setState({isOffline: false});
        this.showToast('Đã bật lại kết nối mạng');
      },
      showNav: mainTabsSet,
      navItems,
      langs,
      showAvatar: false,
      toast: st.toast,
      toastBg: st.toastType === 'error' ? 'var(--error)' : 'var(--primary)',
      toastColor: st.toastType === 'error' ? '#fff' : 'var(--on-primary)',
      toastIcon: st.toastType === 'error' ? 'ti-alert-triangle' : 'ti-circle-check-filled',
      // overlays
      anyOverlay: (!!st.sheet || !!st.modal),
      dismissOverlay: () => this.setState({sheet: null, modal: null, _delMode: null}),
      sheetLang: st.sheet === 'lang',
      sheetShare: st.sheet === 'share',
      sheetContext: st.sheet === 'context',
      sheetGuestbook: st.sheet === 'guestbook',
      sheetPreDownloadPack: st.sheet === 'preDownloadPack',
      preDlLoading: !!st._preDlLoading,
      preDlProgressW: (st._preDlProgress || 0) + '%',
      preDlPercent: (st._preDlProgress || 0) + '%',
      preDlSuccess: (st._preDlProgress || 0) === 100,
      startPreDownload: () => this.startPreDownload(),
      finishPreDownload: () => this.finishPreDownload(),
      gbSheetH: (st._gbSheetH || 60) + '%',
      gbSheetRef: (el) => {
        this._gbSheetEl = el;
      },
      gbToggleH: () => this.setState({_gbSheetH: (st._gbSheetH || 60) >= 85 ? 60 : 90}),
      gbDragStart: (e) => {
        const sy = e.touches ? e.touches[0].clientY : e.clientY;
        const sh = st._gbSheetH || 60;
        const move = (ev) => {
          const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
          const vh = (this._gbSheetEl ? this._gbSheetEl.parentElement.clientHeight : 700);
          let nh = sh + (sy - y) / vh * 100;
          nh = Math.max(35, Math.min(92, nh));
          this.setState({_gbSheetH: nh});
        };
        const up = () => {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
          document.removeEventListener('touchmove', move);
          document.removeEventListener('touchend', up);
          const cur = this.state._gbSheetH || 60;
          if (cur < 45) this.setState({sheet: null}); else this.setState({_gbSheetH: cur > 75 ? 90 : 60});
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        document.addEventListener('touchmove', move, {passive: true});
        document.addEventListener('touchend', up);
      },
      gbCount: this.guestbook.length,
      gbUnlock: () => this.premiumGate(),
      shareTargets,
      shareSubtitle: cur.name,
      ctxSave: () => {
        this.toggleSave(st.curArtId);
        this.setState({sheet: null});
      },
      ctxShare: () => this.setState({sheet: 'share'}),
      ctxOpen: () => {
        this.setState({sheet: null});
        this.openArtifact(st.curArtId);
      },
      // social modal
      modalSocial: st.modal === 'social',
      socialName: md.name,
      socialIcon: md.icon,
      socialColor: md.color,
      socialContinue: () => {
        this.setState({modal: null, user: {name: 'Minh Anh', email: 'minhanh@gmail.com', isLoggedIn: true, age: 31}});
        this.enterApp();
      },
      socialCancel: () => {
        this.setState({modal: null});
        this.showToast('Đã huỷ đăng nhập', 'error');
      },
      // generic modal
      modalGeneric: st.modal === 'generic',
      mTitle: md.title,
      mBody: md.body,
      mPrimary: md.primary,
      mSecondary: md.secondary,
      mIcon: md.icon || 'ti-info-circle',
      mIconBg: md.iconBg || 'rgba(237,137,39,.14)',
      mIconColor: md.iconColor || 'var(--cta)',
      mPrimaryTap: () => {
        const f = md.onPrimary;
        this.setState({modal: null});
        if (f) f();
      },
      mSecondaryTap: () => {
        const f = md.onSecondary;
        this.setState({modal: null});
        if (f) f();
      },
      // delete-pack modal (radio chọn rồi xác nhận)
      modalDelPack: st.modal === 'delpack',
      delPackName: md.name,
      delPackSize: md.size,
      stopProp: (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
      },
      delMode: st._delMode || null,
      delCacheBorder: st._delMode === 'cache' ? 'var(--cta)' : 'var(--border)',
      delCacheBg: st._delMode === 'cache' ? 'rgba(237,137,39,.1)' : 'transparent',
      delAllBorder: st._delMode === 'all' ? 'var(--error)' : 'var(--border)',
      delAllBg: st._delMode === 'all' ? 'rgba(221,14,14,.08)' : 'transparent',
      delCacheDot: st._delMode === 'cache' ? 'var(--cta)' : 'transparent',
      delAllDot: st._delMode === 'all' ? 'var(--error)' : 'transparent',
      pickDelCache: () => this.setState({_delMode: 'cache'}),
      pickDelAll: () => this.setState({_delMode: 'all'}),
      delConfirmDisabled: !st._delMode,
      delConfirmOpacity: st._delMode ? '1' : '.4',
      delConfirmCursor: st._delMode ? 'pointer' : 'not-allowed',
      confirmDelPack: () => {
        if (!st._delMode) return;
        if (st._delMode === 'cache') {
          this.setState({modal: null, _delMode: null});
          this.showToast('Đã xoá cache · giữ lại hiện vật sưu tầm ✦');
        } else {
          const id = md.id;
          this.setState({modal: null, _delMode: null, packs: (st.packs || []).filter(p => p.id !== id)});
          this.showToast('Đã xoá toàn bộ gói ' + (md.name || ''));
        }
      },
      cancelDelPack: () => this.setState({modal: null, _delMode: null}),
      // create collection modal
      modalCreateCollection: st.modal === 'createcollection',
      ccName: st._ccName || '',
      onCcName: (e) => this.setState({_ccName: e.target.value}),
      ccEmoji: st._ccEmoji || '📁',
      ccEmojis: ['📁', '🏛️', '🗿', '🏮', '⚔️', '🎨', '👑', '🪕'].map(ch => ({
        ch,
        border: (st._ccEmoji === ch) ? 'var(--cta)' : 'var(--border)',
        pick: () => this.setState({_ccEmoji: ch})
      })),
      ccDisabled: !(st._ccName || '').trim(),
      ccOpacity: (st._ccName || '').trim() ? '1' : '0.5',
      doCreateCollection: () => this.createCollection(),
      // badge detail modal
      modalBadge: st.modal === 'badge',
      ...this.badgeModalVals(md),
      toggleSave: (id) => this.toggleSave(id),
    };
  },

  authVals() {
    const st = this.state;
    const lastWalk = this.walkSlides.length - 1;
    const ws = this.walkSlides[Math.min(st.walkStep, lastWalk)];
    const isLastWalk = st.walkStep >= lastWalk;
    const social = [
      {
        name: 'Google', icon: '', paths: [
          {
            d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
            fill: '#4285F4'
          },
          {
            d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z',
            fill: '#34A853'
          },
          {
            d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z',
            fill: '#FBBC05'
          },
          {
            d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
            fill: '#EA4335'
          },
        ], color: ''
      },
      {
        name: 'Apple',
        icon: '',
        svgPath: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
        color: 'var(--text-primary)'
      },
      {
        name: 'Zalo',
        icon: '',
        badge: true,
        color: '#0068FF'
      },
      {
        name: 'Facebook',
        icon: '',
        svgPath: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
        color: '#1877F2'
      },
    ].map(s => ({...s, tap: () => this.socialLogin(s.name, s.icon, s.color)}));

    const rg = st.rg;
    const rerr = rg.err || {};
    // năm sinh hợp lệ (4 chữ số, tuổi 0–130) → bật nút "Tiếp tục"
    const rgYearStr = (rg.birth || '').trim();
    const rgYearNum = parseInt(rgYearStr, 10);
    const rgYearOk = /^\d{4}$/.test(rgYearStr) && rgYearNum >= 1900 && (2026 - rgYearNum) >= 0 && (2026 - rgYearNum) <= 130;
    // nút "Tiếp tục" bật khi: có nhập năm thì năm phải hợp lệ; nếu năm trống thì phải đã chọn nhóm tuổi
    const rgAgeStepOk = rgYearStr ? rgYearOk : !!rg.ageBracket;
    const strength = this.passStrength(rg.pass);
    const strengthColors = ['var(--cta)', 'var(--cta)', '#F2C21A', 'var(--success)'];
    const strengthLabels = ['Yếu — cần ít nhất 8 ký tự, 1 chữ hoa, 1 số', 'Trung bình', 'Khá', 'Mạnh'];
    const strengthBars = [0, 1, 2].map(i => i < strength ? strengthColors[strength] : 'var(--bar-track)');
    const locked = Date.now() < st.lockedUntil;

    // màn "Hỗ trợ đặc biệt" (tuỳ chọn): chỉ 2 trợ năng đặc thù
    const specialItems = [
      {icon: 'ti-ear', iconBg: 'rgba(95,138,236,.14)', iconColor: 'var(--info)', title: 'Khiếm thị / Screen reader', sub: 'Mô tả bằng giọng nói, điều hướng giọng, focus ring rõ ràng', on: st.a11y.visualBlind, toggle: () => this.toggleA11y('visualBlind')},
      {icon: 'ti-wheelchair', iconBg: 'rgba(0,128,0,.12)', iconColor: 'var(--success)', title: 'Vận động khó khăn / xe lăn', sub: 'Lộ trình & marker thân thiện xe lăn, lọc nơi có lối tiếp cận', on: st.a11y.motor, toggle: () => this.toggleA11y('motor')},
    ].map(it => {
      const s = this.sw(it.on);
      return Object.assign({}, it, {track: s.track, knob: s.knob, rowBorder: it.on ? 'var(--cta)' : 'var(--border)'});
    });

    return {
      walkStep: st.walkStep,
      walkIcon: ws.icon,
      walkTitle: this.t(ws.key),
      t_skipWalk: this.t('skip'),
      walkDots: this.walkSlides.map((s, i) => ({
        w: i === st.walkStep ? '22px' : '7px',
        c: i === st.walkStep ? 'var(--cta)' : 'var(--border-2)',
        tap: () => this.goWalkStep(i),
      })),
      walkBtn: st.walkStep === 3 ? 'Bắt đầu' : 'Tiếp theo',
      isLastWalk,
      isFirstWalk: st.walkStep === 0,
      t_walkStart: this.t('walkStart'),
      walkBack: () => this.exitWalkToLanguage(),
      showPrevArrow: st.walkStep > 0,
      showNextArrow: !isLastWalk,
      showPrevWalk: st.walkStep > 0,
      nextWalk: () => this.nextWalk(),
      prevWalk: () => this.prevWalk(),
      skipWalk: () => this.skipWalk(),
      onWalkTouchStart: (e) => this.onWalkTouchStart(e),
      onWalkTouchEnd: (e) => this.onWalkTouchEnd(e),
      onWalkMouseDown: (e) => this.onWalkMouseDown(e),
      onWalkMouseUp: (e) => this.onWalkMouseUp(e),
      goLogin: () => this.nav('login', 'fwd'),
      goRegister: () => {
        this.setState({rg: Object.assign({}, rg, {step: 'age', needA11y: false, err: {}, _dir: 'fwd'})});
        this.nav('register', 'fwd');
      },
      guestEnter: () => {
        this.setState({user: {name: 'Khách', email: '', isLoggedIn: false, age: null}});
        this.enterApp();
      },
      back: () => this.back(),
      // login
      liEmail: st.liEmail,
      liPass: st.liPass,
      liPassType: st.liPassShow ? 'text' : 'password',
      liPassEye: st.liPassShow ? 'ti-eye-off' : 'ti-eye',
      liEmailBorder: st.liErr.email ? 'var(--error)' : 'var(--border)',
      liPassBorder: st.liErr.pass ? 'var(--error)' : 'var(--border)',
      liEmailErr: st.liErr.email,
      liEmailErrAction: st.liErr.emailAction,
      liPassErr: st.liErr.pass,
      liEmailErrTap: () => {
        this.setState({rg: Object.assign({}, st.rg, {email: st.liEmail})});
        this.nav('register', 'fwd');
      },
      onLiEmail: (e) => this.setState({
        liEmail: e.target.value,
        liErr: Object.assign({}, st.liErr, {email: null, emailAction: null})
      }),
      onLiEmailBlur: () => {
        if (st.liEmail && !this.validEmail(st.liEmail)) this.setState({liErr: Object.assign({}, st.liErr, {email: 'Định dạng email không đúng'})});
      },
      onLiPass: (e) => this.setState({liPass: e.target.value, liErr: Object.assign({}, st.liErr, {pass: null})}),
      toggleLiPass: () => this.setState({liPassShow: !st.liPassShow}),
      doLogin: () => this.doLogin(),
      loginLocked: locked,
      lockCountdown: st.lockCountdown,
      loginDisabled: locked || !(st.liEmail || '').trim() || !(st.liPass || '').trim(),
      loginBtnBg: locked ? 'var(--text-tertiary)' : ((st.liEmail || '').trim() && (st.liPass || '').trim() ? 'var(--cta)' : 'var(--disabled-bg)'),
      loginBtnFg: locked ? '#fff' : ((st.liEmail || '').trim() && (st.liPass || '').trim() ? '#fff' : 'var(--disabled-fg)'),
      loginBtnCursor: locked || !(st.liEmail || '').trim() || !(st.liPass || '').trim() ? 'not-allowed' : 'pointer',
      loginBtnPointerEvents: locked || !(st.liEmail || '').trim() || !(st.liPass || '').trim() ? 'none' : 'auto',
      loginBtnOpacity: '1',
      loginBtnLabel: locked ? 'Đã khoá (' + st.lockCountdown + 's)' : 'Đăng nhập',
      socialBtns: social,
      goForgot: () => {
        this.setState({fpEmail: st.liEmail, fpStep: 'email', fpErr: null, fpOtp: '', fpOtpErr: null, fpNewPass: ''});
        this.nav('forgot', 'fwd');
      },
      // register
      rgStepAge: (rg.step || 'age') === 'age',
      rgStepName: rg.step === 'name',
      rgStepAccount: rg.step === 'account',
      rgStepOtp: rg.step === 'otp',
      rgOtpEmail: rg.email,
      rgResendLabel: st.fpResendCd > 0 ? ('Gửi lại mã sau (' + st.fpResendCd + 's)') : 'Gửi lại mã',
      ...((() => {
        const order = this.rgOrder();
        const idx = Math.max(0, order.indexOf(rg.step || 'age'));
        const pct = 100 / order.length;
        return {
          rgThumbWidth: pct + '%',
          rgThumbLeft: (idx * pct) + '%',
        };
      })()),
      rgStepKey: 'rgstep-' + (rg.step || 'age'),
      rgPanelAnim: rg._dir === 'back' ? 'vhPopIn' : 'vhPushIn',
      rgGoNext: () => this.rgGoNext(),
      rgGoPrev: () => this.rgGoPrev(),
      rgBackTap: () => {
        const order = this.rgOrder();
        if (order.indexOf(rg.step || 'age') <= 0) this.back(); else this.rgGoPrev();
      },
      onRgTouchStart: (e) => this.onRgTouchStart(e),
      onRgTouchEnd: (e) => this.onRgTouchEnd(e),
      rgFirst: rg.first,
      rgLast: rg.last,
      rgFirstBorder: rerr.first ? 'var(--error)' : 'var(--border)',
      rgFirstErr: rerr.first ? 'Vui lòng nhập tên của bạn' : null,
      onRgFirst: (e) => this.upRg('first', e.target.value),
      onRgLast: (e) => this.upRg('last', e.target.value),
      rgEmail: rg.email,
      rgBirth: rg.birth,
      rgPass: rg.pass,
      rgConfirm: rg.confirm,
      rgPassType: rg.show ? 'text' : 'password',
      rgPassEye: rg.show ? 'ti-eye-off' : 'ti-eye',
      rgConfirmType: rg.showConfirm ? 'text' : 'password',
      rgConfirmEye: rg.showConfirm ? 'ti-eye-off' : 'ti-eye',
      rgEmailBorder: rerr.email ? 'var(--error)' : 'var(--border)',
      rgBirthBorder: rerr.birth ? 'var(--error)' : 'var(--border)',
      rgEmailErr: rerr.email,
      rgEmailErrAction: rerr.emailAction,
      rgBirthErr: rerr.birth,
      // năm sinh: nhóm tuổi + dropdown chọn năm
      rgBirthVal: rg.birth || '',
      // nút "Tiếp tục" bước tuổi: disabled tới khi chọn nhóm tuổi hoặc nhập năm hợp lệ
      rgYearDisabled: !rgAgeStepOk,
      rgYearBtnBg: rgAgeStepOk ? 'var(--cta)' : 'var(--disabled-bg)',
      rgYearBtnColor: rgAgeStepOk ? '#fff' : 'var(--disabled-fg)',
      rgYearBtnCursor: rgAgeStepOk ? 'pointer' : 'not-allowed',
      rgYearContinue: () => { if (rgAgeStepOk) this.rgGoNext(); },
      // ---- trạng thái disabled cho các nút bước đăng ký ----
      // bước họ tên: bật khi đã nhập tên (bắt buộc)
      ...((() => {
        const nameOk = (rg.first || '').trim().length > 0;
        const accOk = this.validEmail(rg.email) && this.passOk(rg.pass) && rg.pass.length > 0 && rg.confirm === rg.pass && !!rg.terms;
        const otpOk = (st.otpArr || ['', '', '', '', '', '']).every(x => x !== '' && x != null);
        const dim = (ok) => ({
          bg: ok ? 'var(--cta)' : 'var(--disabled-bg)',
          color: ok ? '#fff' : 'var(--disabled-fg)',
          cursor: ok ? 'pointer' : 'not-allowed',
        });
        const n = dim(nameOk), a = dim(accOk), o = dim(otpOk);
        return {
          rgNameDisabled: !nameOk, rgNameBtnBg: n.bg, rgNameBtnColor: n.color, rgNameBtnCursor: n.cursor,
          rgNameContinue: () => { if (nameOk) this.rgGoNext(); },
          rgAccDisabled: !accOk, rgAccBtnBg: a.bg, rgAccBtnColor: a.color, rgAccBtnCursor: a.cursor,
          otpDisabled: !otpOk, otpBtnBg: o.bg, otpBtnColor: o.color, otpBtnCursor: o.cursor,
        };
      })()),
      // khối trợ năng inline: chỉ hiện khi chọn nhóm 45+ (mature)
      rgShow45A11y: rg.ageBracket === 'mature',
      rgMinorBorder: rg.ageBracket === 'minor' ? 'var(--cta)' : 'var(--border)',
      rgMinorBg: rg.ageBracket === 'minor' ? 'rgba(237,137,39,.10)' : 'var(--bg-card)',
      rgYoungBorder: rg.ageBracket === 'young' ? 'var(--cta)' : 'var(--border)',
      rgYoungBg: rg.ageBracket === 'young' ? 'rgba(237,137,39,.10)' : 'var(--bg-card)',
      rgMatureBorder: rg.ageBracket === 'mature' ? 'var(--cta)' : 'var(--border)',
      rgMatureBg: rg.ageBracket === 'mature' ? 'rgba(237,137,39,.10)' : 'var(--bg-card)',
      pickMinor: () => this.rgPickBracket('minor'),
      pickYoung: () => this.rgPickBracket('young'),
      pickMature: () => this.rgPickBracket('mature'),
      onRgBirthYear: (e) => this.rgSetBirth(e.target.value),
      // bước trợ năng (chỉ khi 45+) — xem trước trực tiếp, toggle màu cam
      a11yAskStateLabel: st.a11y.visualLow ? 'Đang bật' : 'Đang tắt',
      a11yAskTrack: st.a11y.visualLow ? 'var(--cta)' : 'var(--border-2)',
      a11yAskKnob: st.a11y.visualLow ? '25px' : '3px',
      a11yAskRowBorder: st.a11y.visualLow ? 'var(--cta)' : 'var(--border)',
      toggleA11yAsk: () => this.toggleA11yAsk(),
      openYearSheet: () => this.setState({sheet: 'yearpick'}),
      sheetYearPick: st.sheet === 'yearpick',
      closeYearPick: () => this.setState({sheet: null}),
      yearSheetTitle: rg.ageBracket === 'mature' ? 'Chọn năm sinh (45+)' : rg.ageBracket === 'young' ? 'Chọn năm sinh (18+)' : rg.ageBracket === 'minor' ? 'Chọn năm sinh (Dưới 18)' : 'Chọn năm sinh',
      yearRows: (() => {
        const {min, max} = this.rgYearRange(rg.ageBracket);
        const rows = [];
        for (let y = max; y >= min; y--) {
          const sel = String(y) === String(rg.birth);
          rows.push({
            year: y,
            border: sel ? 'var(--cta)' : 'transparent',
            bg: sel ? 'rgba(237,137,39,.10)' : 'transparent',
            check: sel ? 'inline' : 'none',
            pick: () => this.rgPickYear(y),
          });
        }
        return rows;
      })(),
      rgPassShow: rg.pass.length > 0,
      strengthBars,
      strengthColor: strengthColors[strength],
      strengthLabel: strengthLabels[strength],
      // live password criteria validation
      ...((() => {
        const passErrMsg = rg.pass.length > 0 ? this.passErr(rg.pass) : null;
        const passInvalid = !!passErrMsg;
        const confirmLiveErr = rg.confirm.length > 0 && rg.confirm !== rg.pass ? 'Mật khẩu xác nhận không khớp' : null;
        const rgBirthNum = parseInt(rg.birth, 10);
        const rgBirthAge = rgBirthNum >= 1900 ? (2026 - rgBirthNum) : null;
        return {
          rgPassBorder: (rerr.pass || passInvalid) ? 'var(--error)' : 'var(--border)',
          rgPassErr: passErrMsg,
          rgConfirmBorder: (rerr.confirm || !!confirmLiveErr) ? 'var(--error)' : 'var(--border)',
          rgConfirmErr: rerr.confirm || confirmLiveErr,
          rgShowA11ySuggest: !!(rgBirthAge && rgBirthAge >= 45 && !rerr.birth),
          rgA11yOn: st.a11y.visualLow,
          toggleRgA11y: () => this.toggleA11y('visualLow'),
          rgA11yBtnBg: st.a11y.visualLow ? 'var(--bg-secondary)' : 'var(--cta)',
          rgA11yBtnColor: st.a11y.visualLow ? 'var(--text-primary)' : '#fff',
          rgA11yBtnBorder: st.a11y.visualLow ? '1.5px solid var(--border)' : '1.5px solid transparent',
          rgA11yBtnIcon: st.a11y.visualLow ? 'ti-check' : 'ti-accessibility',
          rgA11yBtnLabel: st.a11y.visualLow ? 'Đã bật trợ năng' : 'Bật ngay',
        };
      })()),
      onRgEmail: (e) => this.upRg('email', e.target.value, ['email']),
      onRgEmailBlur: () => {
        if (rg.email && !this.validEmail(rg.email)) this.setState({rg: Object.assign({}, rg, {err: Object.assign({}, rerr, {email: 'Định dạng email không đúng'})})});
      },
      onRgBirth: (e) => this.upRg('birth', e.target.value, ['birth']),
      onRgPass: (e) => this.upRg('pass', e.target.value, ['pass']),
      onRgConfirm: (e) => this.upRg('confirm', e.target.value, ['confirm']),
      toggleRgPass: () => this.setState({rg: Object.assign({}, rg, {show: !rg.show})}),
      toggleRgConfirm: () => this.setState({rg: Object.assign({}, rg, {showConfirm: !rg.showConfirm})}),
      toggleTerms: () => this.setState({
        rg: Object.assign({}, rg, {
          terms: !rg.terms,
          err: Object.assign({}, rerr, {terms: null})
        })
      }),
      termsBorder: rg.terms ? 'var(--cta)' : (rerr.terms ? 'var(--error)' : 'var(--border-2)'),
      termsBg: rg.terms ? 'var(--cta)' : 'transparent',
      termsCheckDisp: rg.terms ? 'block' : 'none',
      termsShakeAnim: rerr.terms ? 'animation:vhShake .5s;' : '',
      doRegister: () => this.doRegister(),
      // forgot (multi-step OTP)
      fpStepEmail: st.fpStep === 'email',
      fpStepOtp: st.fpStep === 'otp',
      fpStepReset: st.fpStep === 'reset',
      fpStepDone: st.fpStep === 'done',
      fpEmail: st.fpEmail,
      fpErr: st.fpErr,
      fpBorder: st.fpErr ? 'var(--error)' : 'var(--border)',
      onFp: (e) => this.setState({fpEmail: e.target.value, fpErr: null}),
      sendOtp: () => {
        if (!this.validEmail(st.fpEmail)) {
          this.setState({fpErr: 'Định dạng email không đúng'});
          return;
        }
        this.setState({fpStep: 'otp', fpOtp: '', fpOtpErr: null, _otpTries: 0, otpArr: ['', '', '', '', '', '']});
        this.startResend();
        this.showToast('Đã gửi mã OTP — demo: 123456');
        setTimeout(() => {
          if (this._otpRefs && this._otpRefs[0]) this._otpRefs[0].focus();
        }, 120);
      },
      fpOtp: st.fpOtp,
      fpOtpErr: st.fpOtpErr,
      fpOtpBorder: st.fpOtpErr ? 'var(--error)' : 'var(--border-2)',
      fpOtpShake: st.fpOtpErr ? 'animation:vhShake .5s;' : '',
      otpBoxes: (st.otpArr || ['', '', '', '', '', '']).map((v, i) => ({
        val: v, ref: (el) => {
          this._otpRefs = this._otpRefs || [];
          this._otpRefs[i] = el;
        },
        border: st.fpOtpErr ? 'var(--error)' : (v ? 'var(--cta)' : 'var(--border-2)'),
        focus: (e) => {
          try {
            e.target.select();
          } catch (x) {
          }
        },
        input: (e) => this.otpInput(i, e.target.value),
        keydown: (e) => this.otpKey(i, e),
      })),
      verifyOtp: () => this.verifyOtp(),
      resendLabel: st.fpResendCd > 0 ? ('Gửi lại mã sau (' + st.fpResendCd + 's)') : 'Gửi lại mã',
      resendColor: st.fpResendCd > 0 ? 'var(--text-tertiary)' : 'var(--cta)',
      resendOtp: () => {
        if (st.fpResendCd > 0) return;
        this.startResend();
        this.setState({_otpTries: 0, fpOtpErr: null, otpArr: ['', '', '', '', '', '']});
        this.showToast('Đã gửi lại mã OTP — demo: 123456');
        setTimeout(() => {
          if (this._otpRefs && this._otpRefs[0]) this._otpRefs[0].focus();
        }, 120);
      },
      fpNewPass: st.fpNewPass,
      onNewPass: (e) => this.setState({fpNewPass: e.target.value}),
      fpNewBars: [0, 1, 2].map(i => i < this.passStrength(st.fpNewPass) ? ['var(--cta)', 'var(--cta)', '#F2C21A', 'var(--success)'][this.passStrength(st.fpNewPass)] : 'var(--bar-track)'),
      fpNewType: st._fpShowNew ? 'text' : 'password',
      fpNewEye: st._fpShowNew ? 'ti-eye-off' : 'ti-eye',
      toggleFpNew: () => this.setState({_fpShowNew: !st._fpShowNew}),
      fpConfirm: st._fpConfirm || '',
      onFpConfirm: (e) => this.setState({_fpConfirm: e.target.value}),
      fpConfirmType: st._fpShowConfirm ? 'text' : 'password',
      fpConfirmEye: st._fpShowConfirm ? 'ti-eye-off' : 'ti-eye',
      toggleFpConfirm: () => this.setState({_fpShowConfirm: !st._fpShowConfirm}),
      fpConfirmBorder: (st._fpConfirm && st._fpConfirm !== st.fpNewPass) ? 'var(--error)' : 'var(--border)',
      fpConfirmErr: (st._fpConfirm && st._fpConfirm !== st.fpNewPass) ? 'Mật khẩu xác nhận không khớp' : null,
      fpNewBorder: this.passErr(st.fpNewPass) ? 'var(--error)' : 'var(--border)',
      fpNewErr: this.passErr(st.fpNewPass),
      submitNewPass: () => {
        if (!this.passOk(st.fpNewPass)) {
          this.showToast(this.passErr(st.fpNewPass) || 'Mật khẩu chưa hợp lệ', 'error');
          return;
        }
        if (st.fpNewPass !== (st._fpConfirm || '')) {
          this.showToast('Mật khẩu xác nhận không khớp', 'error');
          return;
        }
        this.setState({fpStep: 'done', _fpConfirm: '', _fpShowNew: false, _fpShowConfirm: false});
      },
      backToLogin: () => {
        this.setState({fpStep: 'email'});
        this.back();
      },
      // parental
      parentEmail: st.parentEmail,
      onParent: (e) => this.setState({parentEmail: e.target.value}),
      ...((() => {
        const ok = this.validEmail(st.parentEmail);
        return {
          parentDisabled: !ok,
          parentBtnBg: ok ? 'var(--cta)' : 'var(--disabled-bg)',
          parentBtnColor: ok ? '#fff' : 'var(--disabled-fg)',
          parentBtnCursor: ok ? 'pointer' : 'not-allowed',
        };
      })()),
      sendParental: () => {
        if (!this.validEmail(st.parentEmail)) {
          this.showToast('Nhập email phụ huynh hợp lệ', 'error');
          return;
        }
        this.setState({parentalSent: true});
        this.showToast('Đã gửi link xác nhận đến phụ huynh ✦');
      },
      isParentalSent: !!st.parentalSent,
      backToAuthChoice: () => { this.setState({parentalSent: false, parentEmail: ''}); this.nav('authchoice', 'back'); },
      // language + permissions
      langContinue: () => {
        // lưu cấu hình ngôn ngữ vào localStorage rồi sang Tutorial
        try { localStorage.setItem('vh_lang', this.state.language); } catch (e) {}
        this.setState({walkStep: 0});
        this.nav('walkthrough', 'fwd');
      },
      // NEARBY (gợi ý tải gói AR gần đây sau đăng nhập, khi đã bật vị trí)
      isNearby: st.screen === 'nearby',
      nearbyImg: this.vimg(this.venues[1].seed, 200, 200),
      nearbyName: this.venues[1].name,
      nearbyLoc: 'Ba Đình, Hà Nội · cách 320 m',
      nearbyPackInfo: '32 hiện vật · 0,4 GB',
      downloadNearby: () => this.downloadNearby(),
      skipNearby: () => this.goTab('home'),
      specialItems,
      finishSpecial: () => this.finishSpecial(),
    };
  },

  errorVals() {
    const st = this.state;
    return {
      isError: st.screen === 'error',
      isMaintenance: st.screen === 'maintenance',
      isLocked: st.screen === 'locked',
      isOfflineScreen: st.screen === 'offline',
      errRetry: () => this.back(),
      offlineRetry: () => {
        this.setState({isOffline: false});
        this.goTab('home');
        this.showToast('Đã kết nối lại');
      },
      offlineGoLib: () => this.goTab('library'),
      lockedSupport: () => this.nav('help', 'fwd'),
      reportSend: () => {
        this.showToast('Đã gửi báo cáo — cảm ơn bạn');
        this.back();
      },
      isReport: st.screen === 'report',
      reportText: st._reportText || '',
      onReportText: (e) => this.setState({_reportText: e.target.value}),
    };
  },


  arVals() {
    const st = this.state;
    const ss = st.scanState;
    const arMode = st._arMode || 'camera';
    const isARGbMode = arMode === 'guestbook';

    // Dữ liệu bubble AR (lấy từ guestbook, tối đa 5 cái)
    // Vị trí không che model (center ~44% top) + không che thanh dưới (~200px)
    const arBubbles = this.guestbook.slice(0, 5).map((g, i) => {
      const positions = [
        {left: '6%',  top: '18%'},
        {left: '54%', top: '12%'},
        {left: '8%',  top: '48%'},
        {left: '56%', top: '40%'},
        {left: '10%', top: '66%'},
      ];
      const pos = positions[i] || positions[0];
      const isSelected = st._arGbBubble === g.id;
      const delays = ['0s', '0.7s', '1.4s', '0.35s', '1.05s'];
      return {
        ...g,
        initial: (g.author || 'B')[0],
        preview: g.text.length > 28 ? g.text.slice(0, 28) + '…' : g.text,
        isSelected,
        bubbleClass: isSelected ? 'vh-ar-bubble vh-ar-bubble--selected' : 'vh-ar-bubble',
        // animation-delay: bubble-in delay, float delay (float bắt đầu sau khi in xong)
        bubbleStyle: 'left:' + pos.left + ';top:' + pos.top + ';animation-delay:' + delays[i] + ',' + delays[i] + ';',
        heartIcon: (st.liked && st.liked[g.id]) ? 'ti-heart-filled' : 'ti-heart',
        heartColor: (st.liked && st.liked[g.id]) ? 'var(--error)' : 'var(--text-tertiary)',
        likeCount: (g.likes || 0) + ((st.liked && st.liked[g.id]) ? 1 : 0),
        tap: () => this.selectARBubble(g.id),
        toggleLike: () => this.toggleGbLike(g.id),
      };
    });

    const selectedBubble = isARGbMode ? (arBubbles.find(b => b.id === st._arGbBubble) || null) : null;
    const hasSelectedBubble = !!selectedBubble;

    const arGbList = this.guestbook
      .filter(g => {
        if (g.id > 1000000000000) {
          return g.id >= (Date.now() - 60 * 24 * 60 * 60 * 1000);
        }
        return true;
      })
      .map(g => {
        return {
          ...g,
          initial: (g.author || 'B')[0],
          heartIcon: (st.liked && st.liked[g.id]) ? 'ti-heart-filled' : 'ti-heart',
          heartColor: (st.liked && st.liked[g.id]) ? 'var(--error)' : 'var(--text-tertiary)',
          likeCount: (g.likes || 0) + ((st.liked && st.liked[g.id]) ? 1 : 0),
          toggleLike: () => this.toggleGbLike(g.id),
        };
      });

    return {
      isScan: st.screen === 'scan',
      isQR: st.screen === 'qrscanner',
      qrScanning: st.qrState === 'scanning',
      qrFlashDisp: st.qrState === 'flash' ? 'block' : 'none',
      exitQR: () => this.exitQR(),
      scanning: ss === 'scanning',
      scanFailed: ss === 'failed',
      flashDisp: ss === 'flash' ? 'block' : 'none',
      scanHint: ss === 'scanning' ? (st.scanFailReason === 'lowlight' ? 'Ánh sáng yếu — di chuyển đến chỗ sáng hơn' : st.scanFailReason === 'covered' ? 'Camera có thể bị che — kiểm tra ống kính' : 'Hướng camera vào hiện vật') : '',
      vfColor: ss === 'failed' ? 'var(--error)' : 'var(--cta)',
      vfAnim: ss === 'failed' ? 'animation:vhShake .5s;' : '',
      exitScan: () => this.exitScan(),
      retryScan: () => this.retryScan(),
      simLowLight: () => this.scanFail('lowlight'),
      simCovered: () => this.scanFail('covered'),
      simNoMatch: () => this.scanFail('nomatch'),
      scanBrowseQR: () => this.startQR(),
      scanBrowseList: () => {
        this.exitScan();
        this.nav('search', 'fwd');
      },
      openAIWrong: () => this.nav('aiwrong', 'fwd'),
      isAIWrong: st.screen === 'aiwrong',
      aiWrongList: this.artifacts.slice(0, 5).map(a => ({
        ...a, img: this.vimg(a.seed, 100, 100), pick: () => {
          this.showToast('Cảm ơn — đã ghi nhận để cải thiện AI');
          this.setState({curArtId: a.id});
          this.nav('artifact', 'back');
        }
      })),
      // Segmented AR Mode Toggle
      setARModeCamera: () => this.setARModeCamera(),
      setARModeGuestbook: () => this.setARModeGuestbook(),
      isARGbMode,
      isARScanMode: !isARGbMode,
      arTabActiveBg: st.theme === 'dark' ? '#1A2540' : '#304574',
      arSlidingTransform: !isARGbMode ? 'translateX(0)' : 'translateX(100%)',
      arCamTabFg: !isARGbMode ? '#fff' : 'rgba(255,255,255,0.6)',
      arCamTabFw: !isARGbMode ? '600' : '500',
      arGbTabFg: isARGbMode ? '#fff' : 'rgba(255,255,255,0.6)',
      arGbTabFw: isARGbMode ? '600' : '500',
      switchARMode: () => this.switchARMode(),
      // Overlay bubble guestbook
      arBubbles,
      hasARBubbles: isARGbMode && arBubbles.length > 0,
      // Opacity overlay — fade in/out khi toggle
      arGbOverlayDisp: isARGbMode ? 'block' : 'none',
      hasSelectedBubble,
      selectedBubbleAuthor: selectedBubble ? selectedBubble.author : '',
      selectedBubbleTime: selectedBubble ? selectedBubble.time : '',
      selectedBubbleText: selectedBubble ? selectedBubble.text : '',
      selectedBubbleInitial: selectedBubble ? selectedBubble.initial : '',
      selectedBubbleHeartIcon: selectedBubble ? selectedBubble.heartIcon : 'ti-heart',
      selectedBubbleHeartColor: selectedBubble ? selectedBubble.heartColor : 'var(--text-tertiary)',
      selectedBubbleLikeCount: selectedBubble ? selectedBubble.likeCount : 0,
      selectedBubbleToggleLike: selectedBubble ? selectedBubble.toggleLike : () => {},
      closeARBubble: () => this.closeARBubble(),
      // Compose lời nhắn AR
      arGbText: st._arGbText || '',
      arGbCharCount: (st._arGbText || '').length,
      onARGbText: (e) => this.setState({_arGbText: e.target.value.slice(0, 200)}),
      arGbCharCountColor: (() => {
        const count = (st._arGbText || '').length;
        if (count >= 200) return 'var(--error)';
        if (count >= 180) return 'var(--cta)';
        return 'var(--text-secondary)';
      })(),
      onARGbFocus: () => this.setState({_arGbTextareaFocused: true}),
      onARGbBlur: () => this.setState({_arGbTextareaFocused: false}),
      arGbTextareaBorder: st._arGbTextareaFocused ? 'var(--primary)' : 'var(--border)',
      arGbTextareaShadow: st._arGbTextareaFocused ? '0 0 0 3px rgba(18, 53, 91, 0.12)' : 'none',
      arGbIsPremium: !!(st.tiers && st.tiers.premium),
      arGbNotPremium: !(st.tiers && st.tiers.premium),
      arGbList,
      gbCount: this.guestbook.length,
      gbUnlock: () => this.premiumGate(),
      handleSendGbAR: () => this.handleSendGbAR(),
      arGbDropdownOpen: !!st._arGbDropdownOpen,
      toggleArGbDropdown: () => this.setState({_arGbDropdownOpen: !st._arGbDropdownOpen}),
      arGbSelectedTemplateText: st._arGbSelectedTemplateText || '',
      arGbSelectedTemplateLabel: st._arGbSelectedTemplateText || 'Chọn một lời nhắn mẫu...',
      arGbSelectedTemplateColor: st._arGbSelectedTemplateText ? 'var(--text-primary)' : 'var(--text-tertiary)',
      arGbDropdownArrowTransform: st._arGbDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
      arGbTemplatesV3: [
        '❤️ Thật tuyệt vời!',
        '👏 Di sản rất đẹp.',
        '📖 Hôm nay học được nhiều điều.',
        '✨ Trải nghiệm đáng nhớ.',
        '🏛 Sẽ quay lại lần sau.'
      ].map(t => ({
        text: t,
        isSelected: st._arGbSelectedTemplateText === t,
        select: () => this.setState({_arGbSelectedTemplateText: t, _arGbDropdownOpen: false})
      })),
      arGbSendDisabled: (() => {
        const isPremium = !!(st.tiers && st.tiers.premium);
        if (isPremium) {
          return !(st._arGbText && st._arGbText.trim().length > 0);
        } else {
          return !st._arGbSelectedTemplateText;
        }
      })(),
      arGbSendBtnBg: (() => {
        const isPremium = !!(st.tiers && st.tiers.premium);
        const disabled = isPremium ? !(st._arGbText && st._arGbText.trim().length > 0) : !st._arGbSelectedTemplateText;
        return disabled ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--cta), #FF9F43)';
      })(),
      arGbSendBtnFg: (() => {
        const isPremium = !!(st.tiers && st.tiers.premium);
        const disabled = isPremium ? !(st._arGbText && st._arGbText.trim().length > 0) : !st._arGbSelectedTemplateText;
        return disabled ? 'var(--text-tertiary)' : '#fff';
      })(),
      arGbSendBtnOpacity: (() => {
        const isPremium = !!(st.tiers && st.tiers.premium);
        const disabled = isPremium ? !(st._arGbText && st._arGbText.trim().length > 0) : !st._arGbSelectedTemplateText;
        return disabled ? '0.6' : '1';
      })(),
      arGbSendBtnCursor: (() => {
        const isPremium = !!(st.tiers && st.tiers.premium);
        const disabled = isPremium ? !(st._arGbText && st._arGbText.trim().length > 0) : !st._arGbSelectedTemplateText;
        return disabled ? 'not-allowed' : 'pointer';
      })(),
      arGbSendBtnScale: (() => {
        const isPremium = !!(st.tiers && st.tiers.premium);
        const disabled = isPremium ? !(st._arGbText && st._arGbText.trim().length > 0) : !st._arGbSelectedTemplateText;
        return disabled ? 'scale(0.97)' : 'scale(1)';
      })(),
    };
  },


  mainVals() {
    const st = this.state;
    const isARGbMode = (st._arMode || 'camera') === 'guestbook';
    const mainTabs = ['home', 'explore', 'library', 'profile'];
    const artifactsView = this.artifacts.map(a => ({
      ...a,
      img: this.vimg(a.seed, 320, 240),
      open: () => this.openArtifactModel(a.id)
    }));
    const venuesTop = this.venues.slice(0, 2).map(v => ({
      ...v,
      img: this.vimg(v.seed, 220, 200),
      open: () => this.openVenue(v.id)
    }));
    const articlesView = this.articles.map(a => ({
      ...a, img: this.vimg(a.seed, 360, 200), open: () => {
        this.setState({_curArticle: a.id});
        this.nav('articledetail', 'fwd');
      }
    }));
    const topDestinations = this.destinations.map((d, i) => ({
      ...d,
      rank: i + 1,
      rankColor: i < 3 ? 'var(--cta)' : 'var(--text-tertiary)',
      img: this.vimg(d.seed, 130, 130),
      open: () => this.openVenue(d.venueId || 1)
    }));
    // card "Tiếp tục tham quan" — nơi đang tham quan dở (x hiện vật đã mở < tổng y)
    const visitVen = st._visitVenue ? this.findVenue(st._visitVenue) : null;
    let showContinue = false, contX = 0, contY = 0;
    if (visitVen) {
      const arts = this.venueArtifacts(visitVen.id);
      contY = arts.length;
      contX = arts.filter(a => (st._visited || []).includes(a.id)).length;
      showContinue = contY > 0 && contX < contY;
    }
    // ---- Home: feed chỉ Địa điểm + Bài viết (không có Hiện vật) ----
    const VTYPE = {1: 'Bảo tàng', 2: 'Bảo tàng', 3: 'Di tích', 4: 'Khu di tích', 5: 'Khu di tích', 6: 'Phố cổ', 11: 'Di sản', 12: 'Di sản', 13: 'Thánh địa', 14: 'Thắng cảnh', 15: 'Di sản', 16: 'Di tích', 17: 'Khu di tích', 18: 'Di sản'};
    const posterCard = (id) => {
      const v = this.findVenue(id) || {};
      const name = v.name || '';
      let displayName = name;
      if (name === 'Hoàng thành Thăng Long' && window.React) {
        displayName = window.React.createElement('span', null,
          'Hoàng thành',
          window.React.createElement('br', {key: 'br'}),
          'Thăng Long'
        );
      }
      return {
        id, name, displayName, city: v.city || '',
        badge: 'Địa điểm nổi bật',
        locationBadge: v.city || '',
        contextLabel: 'Khám phá di sản tại ' + (v.city || ''),
        badgeBg: 'var(--chip-badge-bg)', badgeColor: 'var(--chip-badge-fg)',
        subtitle: v.city || '',
        type: VTYPE[id] || 'Di tích',
        dist: v.dist || '',
        accIcon: v.wheelchair ? 'ti-wheelchair' : 'ti-stairs',
        accColor: v.wheelchair ? '#74D99F' : 'rgba(255,255,255,.7)',
        accText: v.floor || '',
        img: this.vimg(v.seed, 360, 440),
        open: () => this.openVenue(id),
      };
    };
    const placesMain = [11, 6, 12, 1, 14, 13, 3, 16, 15, 18, 2, 17].map(posterCard);
    const grpHanoi = [1, 2, 4, 11, 16].map(posterCard);
    const grpHcm = [3, 17].map(posterCard);
    const grpMuseum = [1, 2].map(posterCard);
    const grpNature = [14, 18, 13, 6].map(posterCard);
    // homeFeed: xen kẽ Địa điểm & Bài viết, KHÔNG có Hiện vật
    const homeFeedVenues = [11, 6, 1, 14, 3, 12].map(posterCard);
    const homeFeedArticles = this.articles.slice(0, 4).map(a => ({
      id: 'art_' + a.id, name: a.title,
      badge: 'Bài viết',
      badgeBg: 'var(--chip-badge-bg)', badgeColor: 'var(--chip-badge-fg)',
      subtitle: a.tag + ' · ' + a.read,
      img: this.vimg(a.seed, 360, 440),
      open: () => { this.setState({_curArticle: a.id}); this.nav('articledetail', 'fwd'); },
    }));
    // xen kẽ: venue, article, venue, article...
    const homeFeed = homeFeedVenues.reduce((acc, v, i) => {
      acc.push(v);
      if (homeFeedArticles[i]) acc.push(homeFeedArticles[i]);
      return acc;
    }, []);
    return {
      placesMain, grpHanoi, grpHcm, grpMuseum, grpNature, homeFeed,
      heroIndex: st.heroIndex || 0,
      handleHeroTouchStart: (e) => this.handleHeroTouchStart(e),
      handleHeroTouchEnd: (e) => this.handleHeroTouchEnd(e),
      homeFeatVenue: Object.assign({}, placesMain[st.heroIndex || 0] || placesMain[0], {
        dots: [0, 1, 2].map(i => ({
          width: i === (st.heroIndex || 0) ? '12px' : '6px',
          opacity: i === (st.heroIndex || 0) ? '1' : '0.4',
          go: () => {
            // Khi người dùng click chọn dot thủ công, reset/clear timer slideshow cũ để tránh bị trôi nhanh
            if (this._heroTimer) {
              clearInterval(this._heroTimer);
              this._heroTimer = setInterval(() => {
                if (this.state.screen === 'home') {
                  const cur = this.state.heroIndex || 0;
                  this.setState({heroIndex: (cur + 1) % 3});
                }
              }, 5000);
            }
            this.setState({heroIndex: i});
          }
        }))
      }),
      homeFeatArticle: articlesView[0],
      showContinueCard: showContinue,
      contVenName: visitVen ? visitVen.name : '',
      contImg: visitVen ? this.vimg(visitVen.seed, 160, 160) : '',
      contX: contX,
      contY: contY,
      contPct: contY > 0 ? Math.round(contX / contY * 100) + '%' : '0%',
      contContinue: () => {
        if (visitVen) this.openVenue(visitVen.id);
      },
      isHome: st.screen === 'home',
      isStub: st.screen === 'stub', stubName: st._stubName || '',
      t_greet: this.homeGreeting(), t_homeTitle: this.t('homeSubtitle'),
      t_secDiscover: this.t('secDiscover'), t_secFeatured: this.t('secFeatured'),
      themeIcon: st.theme === 'light' ? 'ti-moon' : 'ti-sun',
      toggleTheme: () => this.setState({theme: st.theme === 'light' ? 'dark' : 'light'}),
      openNotifs: () => this.nav('notifications', 'fwd'),
      openSearch: () => this.nav('search', 'fwd'),
      heroImg: this.vimg('congchieng', 600, 420), heroOpen: () => this.openArtifact(7),
      heroDur: this.fmtTime(100),
      featImg: this.vimg('trongdong', 800, 600), featOpen: () => this.openArtifactModel(1),
      goExplore: () => this.goTab('explore'),
      artifactsView, venuesTop, articlesView, topDestinations,
      goArticles: () => this.nav('articles', 'fwd'),
      isArticles: st.screen === 'articles',
      articlesList: this.articles.map(a => ({
        ...a, img: this.vimg(a.seed, 400, 200), open: () => {
          this.setState({_curArticle: a.id});
          this.nav('articledetail', 'fwd');
        }
      })),
      isArticleDetail: st.screen === 'articledetail',
      adImg: this.vimg((this.articles.find(a => a.id === st._curArticle) || this.articles[0]).seed, 600, 420),
      adTag: (this.articles.find(a => a.id === st._curArticle) || this.articles[0]).tag,
      adTitle: (this.articles.find(a => a.id === st._curArticle) || this.articles[0]).title,
      adAuthor: (this.articles.find(a => a.id === st._curArticle) || this.articles[0]).author,
      adRead: (this.articles.find(a => a.id === st._curArticle) || this.articles[0]).read,
      adBody: (this.articles.find(a => a.id === st._curArticle) || this.articles[0]).body,
    };
  },
  libVals() {
    const st = this.state;
    const savedArts = this.artifacts.filter(a => st.saved.includes(a.id));
    const tabs = [{k: 'art', l: 'Hiện vật'}, {k: 'collections', l: 'Bộ sưu tập'}, {
      k: 'photo',
      l: 'Ảnh AR'
    }, {k: 'badge', l: 'Huy hiệu'}];
    const cols = st.collections || [];
    const badgeCards = this.achievements.map(a => {
      const pct = Math.round(100 * (a.progress || 0) / (a.target || 1));
      return {
        ...a,
        locked: !a.earned,
        border: a.earned ? 'var(--cta)' : 'var(--border)',
        bg: a.earned ? 'var(--cta)' : 'var(--bg-tertiary)',
        iconColor: a.earned ? 'var(--on-cta)' : 'var(--text-tertiary)',
        filter: a.earned ? 'none' : 'grayscale(1)',
        pct: pct + '%',
        progressText: (a.progress || 0) + '/' + (a.target || 0),
        show: () => this.setState({modal: 'badge', modalData: {id: a.id}})
      };
    });
    return {
      isLibrary: st.screen === 'library',
      libTab: st.libTab,
      libTabs: tabs.map(t => ({
        ...t,
        pick: () => this.setState({libTab: t.k}),
        border: st.libTab === t.k ? 'var(--cta)' : 'var(--border)',
        bg: st.libTab === t.k ? 'var(--cta)' : 'transparent',
        color: st.libTab === t.k ? 'var(--on-cta)' : 'var(--text-secondary)'
      })),
      libArtTab: st.libTab === 'art',
      libPhotoTab: st.libTab === 'photo',
      libCollectionsTab: st.libTab === 'collections',
      libBadgeTab: st.libTab === 'badge',
      libEmpty: st.libTab === 'art' && savedArts.length === 0,
      libHasItems: st.libTab === 'art' && savedArts.length > 0,
      collectionsEmpty: cols.length === 0,
      collectionsView: cols.map(c => {
        const first = this.artifacts.find(a => (c.items || []).includes(a.id));
        return {
          ...c,
          count: (c.items || []).length,
          hasImg: !!first,
          img: first ? this.vimg(first.seed, 240, 180) : '',
          emoji: first ? '' : (c.emoji || '📁'),
          open: () => {
            this.setState({_curCollection: c.id});
            this.nav('collectiondetail', 'fwd');
          }
        };
      }),
      badgeCards,
      openCreateCollection: () => this.setState({modal: 'createcollection', _ccName: '', _ccEmoji: '📁'}),
      isCollectionDetail: st.screen === 'collectiondetail',
      colDetailName: (cols.find(c => c.id === st._curCollection) || {}).name || 'Bộ sưu tập',
      colDetailCount: ((cols.find(c => c.id === st._curCollection) || {}).items || []).length,
      colDetailEmpty: ((cols.find(c => c.id === st._curCollection) || {}).items || []).length === 0,
      colDetailItems: this.artifacts.filter(a => ((cols.find(c => c.id === st._curCollection) || {}).items || []).includes(a.id)).map(a => ({
        ...a,
        img: this.vimg(a.seed, 300, 260),
        open: () => this.openArtifact(a.id)
      })),
      colDetailMenu: () => this.setState({
        modal: 'generic',
        modalData: {
          icon: 'ti-trash',
          iconBg: 'rgba(221,14,14,.12)',
          iconColor: 'var(--error)',
          title: 'Xoá bộ sưu tập?',
          body: 'Hiện vật vẫn ở trong Thư viện của bạn.',
          primary: 'Xoá bộ sưu tập',
          secondary: 'Huỷ',
          onPrimary: () => {
            this.setState({collections: (st.collections || []).filter(c => c.id !== st._curCollection)});
            this.showToast('Đã xoá bộ sưu tập');
            this.back();
          }
        }
      }),
      savedView: savedArts.map(a => ({...a, img: this.vimg(a.seed, 300, 260), open: () => this.openArtifact(a.id)})),
      libSubtitle: savedArts.length + ' hiện vật · 23 đã quét',
      goExploreLib: () => this.goTab('explore'),
      photoGrid: this.artifacts.slice(0, 4).map(a => ({
        ...a, img: this.vimg(a.seed, 240, 280), open: () => {
          this.setState({curArtId: a.id});
          this.nav('photo', 'fwd');
        }
      })),
      openDownloadMgr: () => this.nav('downloads', 'fwd'),
      isDownloads: st.screen === 'downloads',
      autoCleanLabel: st.autoClean === 0 ? 'Tắt' : st.autoClean + ' ngày',
      openAutoClean: () => this.setState({sheet: 'autoclean'}),
      sheetAutoClean: st.sheet === 'autoclean',
      autoCleanOptions: [0, 7, 14, 30, 60, 90].map(d => ({
        label: d === 0 ? 'Tắt tự động dọn' : 'Sau ' + d + ' ngày không dùng',
        sel: st.autoClean === d,
        pick: () => {
          this.setState({autoClean: d, sheet: null});
          this.showToast(d === 0 ? 'Đã tắt tự động dọn' : 'Tự động dọn gói không dùng sau ' + d + ' ngày');
        }
      })),
      dataPacks: (st.packs || []).map(d => ({
        ...d,
        sizeText: String(d.size).replace('.', ',') + ' GB',
        star: d.fav ? 'ti-star-filled' : 'ti-star',
        starColor: d.fav ? 'var(--cta)' : 'var(--text-tertiary)',
        toggleFav: (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          this.setState({packs: st.packs.map(p => p.id === d.id ? {...p, fav: !p.fav} : p)});
        },
        del: () => this.setState({
          modal: 'delpack',
          _delMode: null,
          modalData: {name: d.name, size: String(d.size).replace('.', ',') + ' GB', id: d.id}
        })
      })),
      storagePct: Math.min(100, Math.round((st.packs || []).reduce((s, p) => s + p.size, 0) / 8 * 100)) + '%',
      storageText: 'Đã dùng ' + String((st.packs || []).reduce((s, p) => s + p.size, 0).toFixed(1)).replace('.', ',') + ' / 8 GB',
    };
  },

  profileVals() {
    const st = this.state;
    const T = st.tiers || {};
    const hasPremium = !!T.premium;
    const hasAcademic = !!T.academic;
    const isPremium = hasPremium;
    const cpStrength = this.passStrength(st._cpNew);
    const cpStrengthColor = ['var(--cta)', 'var(--cta)', '#F2C21A', 'var(--success)'][cpStrength];
    const cpNewErrMsg = st._cpNew.length > 0 ? this.passErr(st._cpNew) : null;
    const cpNewInvalid = !!cpNewErrMsg;
    const cpInvalid = !st._cpOld || !this.passOk(st._cpNew) || st._cpNew !== st._cpConfirm;
    const ceInvalid = !this.validEmail(st._ceNew);
    const daInvalid = !st._daConfirm || !st._daPass;
    const tierName = (hasPremium && hasAcademic) ? 'Nhà nghiên cứu · Học giả' : hasAcademic ? 'Học giả' : hasPremium ? 'Nhà nghiên cứu' : 'Khách tham quan';
    const perks = [
      {icon: 'ti-headphones', text: 'Audio thuyết minh HD giọng nghệ sĩ'},
      {icon: 'ti-history', text: 'Du hành thời gian — timeline đầy đủ'},
      {icon: 'ti-wand', text: 'Bộ lọc AR 3D độc quyền'},
      {icon: 'ti-message-2', text: 'Lời nhắn AR Guestbook tuỳ chỉnh'},
    ];
    // comparison table
    const compareRows = [
      {f: 'Audio thuyết minh cơ bản', free: 1, prem: 1, acad: 1},
      {f: 'AR Scan không giới hạn', free: 1, prem: 1, acad: 1},
      {f: '3D Viewer + Guestbook', free: 1, prem: 1, acad: 1},
      {f: 'Audio HD giọng nghệ sĩ', free: 0, prem: 1, acad: 1},
      {f: 'AR Filter 3D động', free: 0, prem: 1, acad: 1},
      {f: 'Time-travel timeline đầy đủ', free: 0, prem: 1, acad: 1},
      {f: 'References & citations', free: 0, prem: 0, acad: 1},
      {f: 'Export PDF nghiên cứu', free: 0, prem: 0, acad: 1},
    ].map(r => ({
      ...r,
      freeIcon: r.free ? 'ti-check' : 'ti-minus',
      freeColor: r.free ? 'var(--success)' : 'var(--text-tertiary)',
      premIcon: r.prem ? 'ti-check' : 'ti-minus',
      premColor: r.prem ? 'var(--success)' : 'var(--text-tertiary)',
      acadIcon: r.acad ? 'ti-check' : 'ti-minus',
      acadColor: r.acad ? 'var(--success)' : 'var(--text-tertiary)'
    }));

    const plans = [
      {k: 'premium', name: 'Nhà nghiên cứu', price: '79.000đ', per: '/tháng'},
      {k: 'academic', name: 'Học giả', price: '149.000đ', per: '/tháng'},
    ].map(p => ({
      ...p,
      sel: st.paymentTier === p.k,
      border: st.paymentTier === p.k ? 'var(--cta)' : 'var(--border)',
      pick: () => this.setState({paymentTier: p.k})
    }));

    const payMethods = [
      {k: 'momo', name: 'Ví MoMo', icon: 'ti-wallet', color: '#A50064'},
      {k: 'zalopay', name: 'ZaloPay', icon: 'ti-brand-zalo', color: '#0068FF'},
      {k: 'card', name: 'Thẻ tín dụng / ghi nợ', icon: 'ti-credit-card', color: 'var(--primary)'},
      {k: 'bank', name: 'Chuyển khoản ngân hàng', icon: 'ti-building-bank', color: 'var(--primary)'},
    ].map(m => ({
      ...m,
      sel: st.paymentMethod === m.k,
      border: st.paymentMethod === m.k ? 'var(--cta)' : 'var(--border)',
      pick: () => this.setState({paymentMethod: m.k})
    }));

    const seed = st.notifList || this.NOTIF_SEED;
    const notifs = seed.map(n => ({
      ...n,
      bg: n.read ? 'var(--bg-card)' : 'var(--bg-tertiary)',
      dotDisp: n.read ? 'none' : 'block',
      offset: '0px',
      tap: () => {
        this.markRead(n.id);
        const f = this.notifAction[n.id];
        if (f) f();
      },
      del: (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        this.delNotif(n.id);
      }
    }));
    const nf = st._notifFilter || 'all';
    const SOCIAL = ['n2', 'n3'];
    const notifsFiltered = notifs.filter(n => nf === 'all' ? true : nf === 'unread' ? !n.read : nf === 'social' ? SOCIAL.includes(n.id) : !SOCIAL.includes(n.id));

    return {
      isProfile: st.screen === 'profile',
      profIsPremium: hasPremium,
      profNotPremium: !hasPremium,
      tierChipLabel: tierName,
      tierChipBg: (hasPremium || hasAcademic) ? 'var(--cta)' : 'var(--primary)',
      tierChipColor: (hasPremium || hasAcademic) ? 'var(--on-cta)' : 'var(--on-primary)',
      tierChipIcon: (hasPremium || hasAcademic) ? 'ti-crown' : 'ti-user',
      profName: st.user.name || 'Khách tham quan',
      profInitial: (st.user.name || 'K')[0],
      profEmailShort: st.user.email || 'minhanh@email.com',
      openManageTier: () => this.nav('managetier', 'fwd'),
      isManageTier: st.screen === 'managetier',
      mtActiveCards: [
        hasPremium ? {
          key: 'premium',
          name: 'Nhà nghiên cứu',
          icon: 'ti-crown',
          until: '25/07/2026',
          manage: () => this.showToast('Gia hạn tự động đang BẬT'),
          refund: () => this.nav('refund', 'fwd')
        } : null,
        hasAcademic ? {
          key: 'academic',
          name: 'Học giả',
          icon: 'ti-school',
          until: '25/07/2026',
          manage: () => this.showToast('Gia hạn tự động đang BẬT'),
          refund: () => this.nav('refund', 'fwd')
        } : null,
      ].filter(Boolean),
      mtAvailLabel: (hasPremium && hasAcademic) ? 'Bạn đã có tất cả các gói' : 'Có thể kích hoạt thêm',
      mtAvailCards: [
        !hasPremium ? {
          key: 'premium',
          name: 'Nhà nghiên cứu',
          icon: 'ti-crown',
          price: '79.000đ',
          cta: 'Thêm gói Nhà nghiên cứu',
          perks: ['Audio HD giọng nghệ sĩ', 'Du hành thời gian đầy đủ', 'Bộ lọc AR 3D', 'AR Guestbook viết tự do'],
          add: () => {
            this.setState({paymentTier: 'premium'});
            this.nav('paywall', 'fwd');
          }
        } : null,
        !hasAcademic ? {
          key: 'academic',
          name: 'Học giả',
          icon: 'ti-school',
          price: '149.000đ',
          cta: 'Thêm gói Học giả',
          perks: ['Thông tin học thuật chi tiết', 'Export PDF tài liệu', 'Kho ảnh chất lượng cao', 'Lịch sử tham quan vĩnh viễn'],
          add: () => {
            this.setState({paymentTier: 'academic'});
            this.nav('paywall', 'fwd');
          }
        } : null,
      ].filter(Boolean),
      profileStats: [{value: String(st.saved.length), label: 'Đã sưu tầm'}, {
        value: '23',
        label: 'Đã quét'
      }, {value: '2', label: 'Huy hiệu'}],
      isRefund: st.screen === 'refund',
      refundTiers: [hasPremium ? {k: 'premium', label: 'Nhà nghiên cứu'} : null, hasAcademic ? {
        k: 'academic',
        label: 'Học giả'
      } : null].filter(Boolean).map(t => ({
        ...t,
        border: st._refundTier === t.k ? 'var(--error)' : 'var(--border)',
        bg: st._refundTier === t.k ? 'var(--error)' : 'var(--bg-card)',
        color: st._refundTier === t.k ? 'var(--on-cta)' : 'var(--text-secondary)',
        pick: () => this.setState({_refundTier: t.k})
      })),
      refundReasons: [{k: 'mistake', label: 'Đăng ký nhầm'}, {k: 'unused', label: 'Không dùng đến'}, {
        k: 'expensive',
        label: 'Giá quá cao'
      }, {k: 'other', label: 'Lý do khác'}].map(r => ({
        ...r,
        border: st._refundReason === r.k ? 'var(--cta)' : 'var(--border)',
        dot: st._refundReason === r.k ? 'var(--cta)' : 'var(--border-2)',
        fill: st._refundReason === r.k ? 'var(--cta)' : 'transparent',
        pick: () => this.setState({_refundReason: r.k})
      })),
      refundDisabled: !st._refundTier || !st._refundReason,
      refundOpacity: (st._refundTier && st._refundReason) ? '1' : '0.5',
      submitRefund: () => {
        this.setState({_refundTier: null, _refundReason: null});
        this.showToast('Đã gửi yêu cầu hoàn tiền — chúng tôi sẽ phản hồi trong 24 giờ ✦');
        this.back();
      },
      achievements: this.achievements.map(a => ({
        ...a,
        op: a.earned ? '1' : '0.4',
        bg: a.earned ? 'var(--cta)' : 'var(--bg-tertiary)',
        iconColor: a.earned ? '#fff' : 'var(--text-tertiary)',
        show: () => this.showToast(a.earned ? 'Đã đạt: ' + a.name : 'Chưa mở khoá: ' + a.name)
      })),
      openPaywall: () => {
        this.setState({paymentTier: 'premium'});
        this.nav('paywall', 'fwd');
      },
      openManagePremium: () => this.nav('managepremium', 'fwd'),
      openNotifs: () => this.nav('notifications', 'fwd'),
      openEditProfile: () => this.nav('editprofile', 'fwd'),
      themeIconP: st.theme === 'light' ? 'ti-moon' : 'ti-sun',
      toggleThemeP: () => this.setState({theme: st.theme === 'light' ? 'dark' : 'light'}),
      profSettings: [
        {icon: 'ti-settings', label: 'Cài đặt', tap: () => this.nav('settings', 'fwd')},
        {icon: 'ti-accessible', label: 'Trợ năng', tap: () => this.nav('accessibility', 'fwd')},
        {icon: 'ti-shield-lock', label: 'Tài khoản & Bảo mật', tap: () => this.nav('accountsecurity', 'fwd')},
        {icon: 'ti-help-circle', label: 'Trợ giúp & FAQ', tap: () => this.nav('help', 'fwd')},
        {icon: 'ti-info-circle', label: 'Về V-Heritage', tap: () => this.nav('about', 'fwd')},
        {
          icon: 'ti-logout',
          label: 'Đăng xuất',
          tap: () => this.setState({
            modal: 'generic',
            modalData: {
              icon: 'ti-logout',
              iconBg: 'rgba(221,14,14,.1)',
              iconColor: 'var(--error)',
              title: 'Đăng xuất?',
              body: 'Bạn sẽ cần đăng nhập lại để tiếp tục khám phá.',
              primary: 'Đăng xuất',
              onPrimary: () => this.logout(),
              secondary: 'Huỷ'
            }
          })
        },
      ].map((s, i, arr) => ({...s, radius: i === 0 ? '12px 12px 0 0' : i === arr.length - 1 ? '0 0 12px 12px' : '0'})),
      // PAYWALL
      isPaywall: st.screen === 'paywall',
      compareRows,
      plans,
      paywallBuy: () => this.nav('paymentmethod', 'fwd'),
      // PAYMENT METHOD
      isPaymentMethod: st.screen === 'paymentmethod',
      payMethods,
      payMethodNext: () => {
        if (!st.paymentMethod) {
          this.showToast('Chọn phương thức thanh toán', 'error');
          return;
        }
        if (st.tiers && st.tiers[st.paymentTier]) {
          this.setState({
            modal: 'generic',
            modalData: {
              icon: 'ti-crown',
              title: 'Bạn đã có gói này',
              body: 'Gói này của bạn còn hiệu lực đến 25/07/2026.',
              primary: 'Quản lý gói',
              onPrimary: () => this.nav('managepremium', 'fwd'),
              secondary: 'Đóng'
            }
          });
          return;
        }
        this.nav('paymentconfirm', 'fwd');
      },
      // CONFIRM
      isPaymentConfirm: st.screen === 'paymentconfirm',
      confirmTier: st.paymentTier === 'academic' ? 'Học giả' : 'Nhà nghiên cứu',
      confirmPrice: st.paymentTier === 'academic' ? '149.000đ' : '79.000đ',
      confirmMethod: (payMethods.find(m => m.k === st.paymentMethod) || {}).name || 'MoMo',
      doPay: () => this.processPayment(),
      simPayFail: () => {
        this.setState({failedPayment: (st.failedPayment || 0) + 1});
        this.nav('paymentfailed', 'fwd');
      },
      // SUCCESS
      isPaymentSuccess: st.screen === 'paymentsuccess',
      confetti: this._confetti || [],
      // FAILED
      isPaymentFailed: st.screen === 'paymentfailed',
      payFailOver: (st.failedPayment || 0) > 3,
      payFailNormal: (st.failedPayment || 0) <= 3,
      retryPay: () => this.replace('paymentmethod'),
      payContact: () => this.nav('contactsupport', 'fwd'),
      payLater: () => {
        this.setState({history: []});
        this.replace('home');
      },
      // MANAGE PREMIUM
      isManagePremium: st.screen === 'managepremium',
      manageTier: tierName,
      openRefund: () => this.nav('refund', 'fwd'),
      cancelSub: () => this.setState({
        modal: 'generic',
        modalData: {
          icon: 'ti-alert-triangle',
          iconBg: 'rgba(221,14,14,.12)',
          iconColor: 'var(--error)',
          title: 'Huỷ gói thành viên?',
          body: 'Bạn sẽ mất quyền truy cập các tính năng nâng cao khi hết kỳ hiện tại.',
          primary: 'Giữ gói',
          secondary: 'Vẫn huỷ',
          onSecondary: () => {
            this.setState({tiers: {premium: false, academic: false}});
            this.showToast('Đã huỷ gói — về Khách tham quan');
            this.back();
          }
        }
      }),
      // REFUND
      isRefund: st.screen === 'refund',
      refundReason: st._refundReason || '',
      onRefundReason: (e) => this.setState({_refundReason: e.target.value}),
      submitRefund: () => {
        this.showToast('Đã gửi yêu cầu hoàn tiền — phản hồi trong 3 ngày');
        this.back();
      },
      // EDIT PROFILE
      isEditProfile: st.screen === 'editprofile',
      editName: st._editName != null ? st._editName : (st.user.name || ''),
      onEditName: (e) => this.setState({_editName: e.target.value}),
      saveProfile: () => {
        this.setState({user: Object.assign({}, st.user, {name: this.state._editName != null ? this.state._editName : st.user.name})});
        this.showToast('Đã lưu hồ sơ ✦');
        this.back();
      },
      // NOTIFICATIONS
      isNotifications: st.screen === 'notifications',
      notifs: notifsFiltered,
      notifsEmpty: notifsFiltered.length === 0,
      notifFilters: [{k: 'all', label: 'Tất cả'}, {k: 'unread', label: 'Chưa đọc'}, {
        k: 'system',
        label: 'Hệ thống'
      }, {k: 'social', label: 'Tương tác'}].map(f => ({
        ...f,
        border: (st._notifFilter || 'all') === f.k ? 'var(--cta)' : 'var(--border)',
        bg: (st._notifFilter || 'all') === f.k ? 'var(--cta)' : 'var(--bg-card)',
        color: (st._notifFilter || 'all') === f.k ? 'var(--on-cta)' : 'var(--text-secondary)',
        pick: () => this.setState({_notifFilter: f.k})
      })),
      markAllRead: () => this.markAllRead(),
      clearReadNotifs: () => this.clearReadNotifs(),
      // ACCOUNT SECURITY
      isAccountSecurity: st.screen === 'accountsecurity',
      accEmail: st.user.email || 'minhanh@email.com',
      twoFASub: st.twoFA ? 'Đang bật — bảo vệ qua email' : 'Đang tắt',
      twoFATrack: st.twoFA ? 'var(--success)' : 'var(--border-2)',
      twoFAKnob: st.twoFA ? '22px' : '3px',
      toggle2FA: () => {
        this.setState({twoFA: !st.twoFA});
        this.showToast(!st.twoFA ? 'Đã bật xác thực 2 bước ✦' : 'Đã tắt xác thực 2 bước');
      },
      deviceCount: 3,
      devicesHl: st._accSecTab === 'devices' ? 'rgba(237,137,39,.1)' : 'transparent',
      goChangeEmail: () => this.nav('changeemail', 'fwd'),
      goChangePass: () => this.nav('changepassword', 'fwd'),
      goDevices: () => this.nav('devicemanagement', 'fwd'),
      goDataExport: () => this.setState({
        modal: 'generic',
        modalData: {
          icon: 'ti-download',
          title: 'Tải xuống dữ liệu của bạn',
          body: 'Chúng tôi sẽ tổng hợp toàn bộ dữ liệu tài khoản và gửi link tải về email trong vòng 24 giờ.',
          primary: 'Yêu cầu tải xuống',
          secondary: 'Huỷ',
          onPrimary: () => this.showToast('Đã gửi yêu cầu — kiểm tra email của bạn ✦')
        }
      }),
      goDeleteAccount: () => this.nav('deleteaccount', 'fwd'),
      goPrivacyPolicy: () => this.nav('privacypolicy', 'fwd'),
      // CHANGE PASSWORD
      isChangePass: st.screen === 'changepassword',
      cpOld: st._cpOld,
      cpNew: st._cpNew,
      cpConfirm: st._cpConfirm,
      onCpOld: (e) => this.setState({_cpOld: e.target.value}),
      onCpNew: (e) => this.setState({_cpNew: e.target.value}),
      onCpConfirm: (e) => this.setState({_cpConfirm: e.target.value}),
      cpOldType: st._cpShowOld ? 'text' : 'password',
      cpNewType: st._cpShowNew ? 'text' : 'password',
      cpConfirmType: st._cpShowConfirm ? 'text' : 'password',
      cpOldEye: st._cpShowOld ? 'ti-eye-off' : 'ti-eye',
      cpNewEye: st._cpShowNew ? 'ti-eye-off' : 'ti-eye',
      cpConfirmEye: st._cpShowConfirm ? 'ti-eye-off' : 'ti-eye',
      toggleCpOld: () => this.setState({_cpShowOld: !st._cpShowOld}),
      toggleCpNew: () => this.setState({_cpShowNew: !st._cpShowNew}),
      toggleCpConfirm: () => this.setState({_cpShowConfirm: !st._cpShowConfirm}),
      cpBars: [0, 1, 2].map(i => i < cpStrength ? cpStrengthColor : 'var(--bar-track)'),
      cpConfirmBorder: (st._cpConfirm && st._cpConfirm !== st._cpNew) ? 'var(--error)' : 'var(--border)',
      cpErr: (st._cpConfirm && st._cpConfirm !== st._cpNew) ? 'Mật khẩu xác nhận không khớp' : null,
      cpNewBorder: cpNewInvalid ? 'var(--error)' : 'var(--border)',
      cpNewErr: cpNewErrMsg,
      cpDisabled: cpInvalid,
      cpOpacity: cpInvalid ? '0.5' : '1',
      submitCp: () => {
        if (st._cpOld !== this.DEMO_PASS && st._cpOld !== this.TEST_PASS) {
          this.showToast('Mật khẩu hiện tại không đúng', 'error');
          return;
        }
        this.setState({_cpOld: '', _cpNew: '', _cpConfirm: ''});
        this.showToast('Đã đổi mật khẩu thành công ✦');
        this.back();
      },
      // CHANGE EMAIL
      isChangeEmail: st.screen === 'changeemail',
      ceNew: st._ceNew,
      onCeNew: (e) => this.setState({_ceNew: e.target.value}),
      ceBorder: (st._ceNew && !this.validEmail(st._ceNew)) ? 'var(--error)' : 'var(--border)',
      ceErr: (st._ceNew && !this.validEmail(st._ceNew)) ? 'Định dạng email không đúng' : null,
      ceDisabled: ceInvalid,
      ceOpacity: ceInvalid ? '0.5' : '1',
      submitCe: () => {
        this.setState({_ceNew: ''});
        this.showToast('Đã gửi link xác minh đến email mới ✦');
        this.back();
      },
      // DEVICE MANAGEMENT
      isDevices: st.screen === 'devicemanagement',
      deviceList: this.devices.filter(d => !st._revoked.includes(d.id)).map(d => ({
        ...d,
        border: d.current ? 'var(--success)' : 'var(--border)',
        curDisp: d.current ? 'inline' : 'none',
        revokeDisp: d.current ? 'none' : 'flex',
        revoke: () => {
          this.setState({_revoked: st._revoked.concat(d.id)});
          this.showToast('Đã đăng xuất ' + d.name);
        }
      })),
      // DELETE ACCOUNT
      isDeleteAccount: st.screen === 'deleteaccount',
      daPass: st._daPass,
      onDaPass: (e) => this.setState({_daPass: e.target.value}),
      daPassType: st._daShow ? 'text' : 'password',
      daPassEye: st._daShow ? 'ti-eye-off' : 'ti-eye',
      toggleDaPass: () => this.setState({_daShow: !st._daShow}),
      toggleDaConfirm: () => this.setState({_daConfirm: !st._daConfirm}),
      daCheckBorder: st._daConfirm ? 'var(--error)' : 'var(--border-2)',
      daCheckBg: st._daConfirm ? 'var(--error)' : 'transparent',
      daCheckDisp: st._daConfirm ? 'block' : 'none',
      daDisabled: daInvalid,
      daOpacity: daInvalid ? '0.5' : '1',
      submitDelete: () => {
        this.setState({
          _daConfirm: false,
          _daPass: '',
          user: {name: '', email: '', isLoggedIn: false, age: null},
          history: []
        });
        this.showToast('Tài khoản đã được xoá');
        this.replace('authchoice');
      },
      // PRIVACY POLICY
      isPrivacyPolicy: st.screen === 'privacypolicy',
      // EVENT DETAIL
      isEventDetail: st.screen === 'eventdetail',
      eventImg: this.vimg('phocohoian', 600, 420),
      remindEvent: () => this.showToast('Đã đặt lịch nhắc — sẽ báo bạn trước 1 ngày ✦'),
      openEventVenue: () => {
        this.setState({curVenueId: 2});
        this.nav('place', 'fwd');
      },
    };
  },
  settingsVals() {
    const st = this.state;
    const a = st.a11y;
    const lowSw = this.sw(a.visualLow), blindSw = this.sw(a.visualBlind), motorSw = this.sw(a.motor),
        offSw = this.sw(st.isOffline);
    const faqs = [
      {
        q: 'AR Scan hoạt động thế nào?',
        a: 'Hướng camera vào hiện vật có gắn nhãn V-Heritage, AI sẽ nhận diện và hiển thị thông tin cùng mô hình 3D ngay trên màn hình.'
      },
      {
        q: 'Tôi có cần Internet để dùng app không?',
        a: 'Không bắt buộc. Bạn có thể tải gói dữ liệu của từng địa điểm để dùng offline khi tham quan.'
      },
      {
        q: 'Gói miễn phí có những gì?',
        a: 'Audio thuyết minh, 3D viewer, AR Guestbook, sưu tầm hiện vật, AR Scan không giới hạn — đủ dùng cho mọi chuyến tham quan.'
      },
      {
        q: 'Premium khác gì bản miễn phí?',
        a: 'Premium thêm audio HD giọng nghệ sĩ, du hành thời gian đầy đủ, bộ lọc AR 3D và lời nhắn Guestbook tuỳ chỉnh.'
      },
      {
        q: 'Làm sao để bật chế độ trợ năng?',
        a: 'Vào Hồ sơ → Trợ năng và bật các hồ sơ phù hợp: mắt yếu, khiếm thị hoặc vận động khó khăn.'
      },
      {
        q: 'Tôi quên mật khẩu thì sao?',
        a: 'Tại màn đăng nhập, chạm "Quên mật khẩu?" và làm theo hướng dẫn gửi qua email.'
      },
      {
        q: 'Làm sao để tạo bộ sưu tập?',
        a: 'Vào Thư viện → chạm nút "+" để tạo bộ sưu tập mới và đặt tên. Mỗi hiện vật có thể thêm vào nhiều bộ qua nút bookmark.'
      },
      {
        q: 'Mất kết nối có dùng được không?',
        a: 'Được, nếu bạn đã tải gói dữ liệu của địa điểm. AR Scan và nội dung đã tải vẫn hoạt động bình thường khi offline.'
      },
    ];
    const hq = (st._helpQuery || '').toLowerCase().trim();
    const helpFiltered = hq ? faqs.filter(f => f.q.toLowerCase().includes(hq) || f.a.toLowerCase().includes(hq)) : faqs;
    const csInvalid = !st._csName.trim() || !this.validEmail(st._csEmail) || !st._csIssue || !st._csDesc.trim();
    // Màn Quyền truy cập (đồng bộ trạng thái quyền thật của thiết bị)
    const dperm = st.devicePerm || {};
    const permCardDefs = [
      {kind: 'notification', icon: 'ti-bell', iconBg: 'rgba(237,137,39,.14)', iconColor: 'var(--cta)',
        title: 'Nhận thông báo ứng dụng', desc: 'Nhắc nhở hành trình, sự kiện và tin tức di sản mới.'},
      {kind: 'location', icon: 'ti-map-pin', iconBg: 'rgba(95,138,236,.14)', iconColor: 'var(--info)',
        title: 'Định vị di sản xung quanh', desc: 'Dùng vị trí để gợi ý địa điểm và hiện vật ở gần bạn.'},
      {kind: 'camera', icon: 'ti-camera', iconBg: 'rgba(0,128,0,.12)', iconColor: 'var(--success)',
        title: 'Quét hiện vật AR', desc: 'Mở camera để quét và nhận diện hiện vật bằng AR.'},
    ];
    const appPermItems = permCardDefs.map((d) => {
      const state = dperm[d.kind] || 'prompt';
      const denied = state === 'denied';
      const unsupported = state === 'unsupported';
      const on = !denied && !unsupported && st.permissions[d.kind] === 1;
      const blocked = denied || unsupported;
      let status, statusColor;
      if (unsupported) { status = 'Thiết bị không hỗ trợ'; statusColor = 'var(--text-tertiary)'; }
      else if (denied) { status = 'Đã bị tắt trong cài đặt hệ thống'; statusColor = 'var(--error)'; }
      else if (state === 'prompt') { status = 'Chạm để cấp quyền'; statusColor = 'var(--text-tertiary)'; }
      else { status = on ? 'Đang bật' : 'Đang tắt nhận trong ứng dụng'; statusColor = on ? 'var(--success)' : 'var(--text-tertiary)'; }
      const sw = this.sw(on);
      return {
        icon: d.icon, iconBg: d.iconBg, iconColor: d.iconColor, title: d.title, desc: d.desc,
        status, statusColor,
        track: blocked ? 'var(--bar-track)' : sw.track,
        knob: sw.knob,
        knobBg: blocked ? 'var(--text-tertiary)' : '#fff',
        cardOpacity: blocked ? '.7' : '1',
        tap: () => this.handlePermissionToggle(d.kind),
      };
    });

    const settingsItems = [
      {
        icon: 'ti-language',
        label: 'Ngôn ngữ',
        value: this.langDefs.find(l => l.code === st.language).name,
        tap: () => this.setState({sheet: 'lang'})
      },
      {
        icon: st.theme === 'light' ? 'ti-moon' : 'ti-sun',
        label: 'Giao diện',
        value: st.theme === 'light' ? 'Sáng' : 'Tối',
        tap: () => this.setState({theme: st.theme === 'light' ? 'dark' : 'light'})
      },
      {icon: 'ti-accessible', label: 'Trợ năng', value: '', tap: () => this.nav('accessibility', 'fwd')},
      {icon: 'ti-lock-cog', label: 'Quyền truy cập', value: '', tap: () => this.openAppPermissions()},
      {icon: 'ti-bell', label: 'Thông báo', value: '', tap: () => this.nav('notifications', 'fwd')},
      {icon: 'ti-database', label: 'Quản lý bộ nhớ', value: '7,2 GB', tap: () => this.nav('downloads', 'fwd')},
      {icon: 'ti-shield-lock', label: 'Tài khoản & Bảo mật', value: '', tap: () => this.nav('accountsecurity', 'fwd')},
      {icon: 'ti-help-circle', label: 'Trợ giúp & FAQ', value: '', tap: () => this.nav('help', 'fwd')},
    ].map((s, i, arr) => ({...s, radius: i === 0 ? '12px 12px 0 0' : i === arr.length - 1 ? '0 0 12px 12px' : '0'}));

    return {
      // SETTINGS
      isSettings: st.screen === 'settings',
      settingsItems,
      // APP PERMISSIONS
      isAppPermissions: st.screen === 'apppermissions',
      appPermItems,
      offlineSwitchOn: st.isOffline,
      offTrack: offSw.track,
      offKnob: offSw.knob,
      toggleOfflineSetting: () => {
        const willOffline = !st.isOffline;
        this.setState({isOffline: willOffline});
        if (willOffline && !st.hasPacks) this.nav('offline', 'fwd'); else this.showToast(willOffline ? 'Đã chuyển sang offline' : 'Đã bật lại kết nối');
      },
      // ACCESSIBILITY
      isAccessibility: st.screen === 'accessibility',
      acLowOn: a.visualLow,
      acLowTrack: lowSw.track,
      acLowKnob: lowSw.knob,
      toggleLow: () => this.toggleA11y('visualLow'),
      acBlindOn: a.visualBlind,
      acBlindTrack: blindSw.track,
      acBlindKnob: blindSw.knob,
      toggleBlind: () => this.toggleA11y('visualBlind'),
      acMotorOn: a.motor,
      acMotorTrack: motorSw.track,
      acMotorKnob: motorSw.knob,
      toggleMotor: () => this.toggleA11y('motor'),
      acAnyOn: a.visualLow || a.visualBlind || a.motor,
      acPreviewFs: a.visualLow ? '17px' : '14px',
      acPreviewPad: a.visualLow ? '16px' : '12px',
      acSoundTrack: this.sw(st.soundAlert).track,
      acSoundKnob: this.sw(st.soundAlert).knob,
      toggleSoundAlert: () => {
        this.setState({soundAlert: !st.soundAlert});
        this.showToast(!st.soundAlert ? 'Đã bật cảnh báo âm thanh' : 'Đã tắt cảnh báo âm thanh');
      },
      acDistTrack: this.sw(st.distAlert).track,
      acDistKnob: this.sw(st.distAlert).knob,
      toggleDistAlert: () => {
        this.setState({distAlert: !st.distAlert});
        this.showToast(!st.distAlert ? 'Đã bật cảnh báo khoảng cách' : 'Đã tắt cảnh báo khoảng cách');
      },
      // PRIVACY
      isPrivacy: st.screen === 'privacy',
      privacySections: [
        {
          icon: 'ti-database',
          title: 'Dữ liệu chúng tôi thu thập',
          body: 'Email, lịch sử tham quan và hiện vật bạn lưu. Vị trí chỉ khi bạn cho phép, dùng để gợi ý di tích gần bạn.'
        },
        {
          icon: 'ti-lock',
          title: 'Cách chúng tôi bảo vệ',
          body: 'Dữ liệu được mã hoá khi truyền và lưu trữ. Chúng tôi không bán thông tin cá nhân cho bên thứ ba.'
        },
        {
          icon: 'ti-share',
          title: 'Chia sẻ với đối tác',
          body: 'Chỉ chia sẻ dữ liệu ẩn danh, gộp với các bảo tàng đối tác để cải thiện trải nghiệm trưng bày.'
        },
        {
          icon: 'ti-user-check',
          title: 'Quyền của bạn',
          body: 'Bạn có thể yêu cầu xuất hoặc xoá toàn bộ dữ liệu bất cứ lúc nào trong phần Cài đặt tài khoản.'
        },
      ],
      // HELP
      isHelp: st.screen === 'help',
      helpQuery: st._helpQuery,
      onHelpQuery: (e) => this.setState({_helpQuery: e.target.value}),
      faqs: helpFiltered.map((f) => ({
        ...f,
        open: st._faqOpen === f.q,
        chevron: st._faqOpen === f.q ? 'ti-chevron-up' : 'ti-chevron-down',
        toggle: () => this.setState({_faqOpen: st._faqOpen === f.q ? null : f.q})
      })),
      faqsEmpty: helpFiltered.length === 0,
      contactSupport2: () => this.nav('contactsupport', 'fwd'),
      // CONTACT SUPPORT
      isContactSupport: st.screen === 'contactsupport',
      csName: st._csName,
      csEmail: st._csEmail,
      csDesc: st._csDesc,
      onCsName: (e) => this.setState({_csName: e.target.value}),
      onCsEmail: (e) => this.setState({_csEmail: e.target.value}),
      onCsDesc: (e) => this.setState({_csDesc: e.target.value}),
      csIssues: [
        {k: 'bug', label: 'Lỗi kỹ thuật'}, {k: 'account', label: 'Tài khoản'}, {
          k: 'payment',
          label: 'Thanh toán'
        }, {k: 'content', label: 'Nội dung'}, {k: 'other', label: 'Khác'},
      ].map(it => ({
        ...it,
        pick: () => this.setState({_csIssue: it.k}),
        border: st._csIssue === it.k ? 'var(--cta)' : 'var(--border)',
        bg: st._csIssue === it.k ? 'var(--cta)' : 'var(--bg-card)',
        color: st._csIssue === it.k ? 'var(--on-cta)' : 'var(--text-secondary)'
      })),
      csAttached: st._csAttached,
      csAttachIcon: st._csAttached ? 'ti-circle-check-filled' : 'ti-paperclip',
      csAttachLabel: st._csAttached ? 'Đã đính kèm ảnh chụp màn hình' : 'Đính kèm ảnh chụp màn hình',
      csAttach: () => this.setState({_csAttached: !st._csAttached}),
      csDisabled: csInvalid,
      csOpacity: csInvalid ? '0.5' : '1',
      submitContact: () => {
        this.setState({_csName: '', _csEmail: '', _csIssue: null, _csDesc: '', _csAttached: false});
        this.showToast('Đã gửi yêu cầu — chúng tôi sẽ phản hồi trong 24 giờ ✦');
        this.back();
      },
      // ABOUT
      isAbout: st.screen === 'about',
      aboutVersion: 'V-Heritage v8.0.0',
      triggerError: () => this.nav('error', 'fwd'),
      triggerMaintenance: () => this.nav('maintenance', 'fwd'),
      triggerLocked: () => this.nav('locked', 'fwd'),
      gbPostedCount: st.guestbookPosted,
    };
  },

  placeVals() {
    const st = this.state;
    const isARGbMode = (st._arMode || 'camera') === 'guestbook';
    const cur = this.artifacts.find(a => a.id === st.curArtId) || this.artifacts[0];
    const ven = this.findVenue(st.curVenueId) || this.venues[0];
    const venArtifacts = this.venueArtifacts(ven.id);
    const isPremium = !!(st.tiers && st.tiers.premium);
    const inAnyCollection = (st.collections || []).some(c => (c.items || []).includes(cur.id));
    const isSaved = st.saved.includes(cur.id) || inAnyCollection;
    const a3 = (this.deepArticles && this.deepArticles[cur.id]) || this.deepArticles[1];

    // Explore
    const mapPins = this.venues.map(v => ({
      ...v,
      select: () => this.selectPin(v.id),
      color: st.curVenueId === v.id ? 'var(--cta)' : 'var(--primary)',
      txt: st.curVenueId === v.id ? '#fff' : 'var(--on-primary)',
      z: st.curVenueId === v.id ? 6 : 3,
      dim: (st.a11y.motor && !v.wheelchair) ? '0.35' : '1'
    }));
    const venuesView = this.venues.filter(v => !st.a11y.motor || v.wheelchair).map(v => ({
      ...v,
      img: this.vimg(v.seed, 200, 200),
      open: () => this.openVenue(v.id),
      activeBorder: st.curVenueId === v.id ? 'var(--cta)' : 'var(--border)'
    }));

    // Search
    const q = st.searchQuery.trim().toLowerCase();
    let searchItems = [];
    if (q) {
      this.artifacts.forEach(a => {
        if (a.name.toLowerCase().includes(q)) searchItems.push({
          kind: 'art',
          id: a.id,
          name: a.name,
          sub: a.era + ' · ' + a.material,
          img: this.vimg(a.seed, 120, 120),
          icon: 'ti-artboard',
          tap: () => this.openArtifact(a.id)
        });
      });
      this.venues.forEach(v => {
        if (v.name.toLowerCase().includes(q)) searchItems.push({
          kind: 'venue',
          id: v.id,
          name: v.name,
          sub: v.city + ' · ' + v.count + ' hiện vật',
          img: this.vimg(v.seed, 120, 120),
          icon: 'ti-map-pin',
          tap: () => this.openVenue(v.id)
        });
      });
    }
    if (st.searchFilter === 'art') searchItems = searchItems.filter(i => i.kind === 'art');
    if (st.searchFilter === 'venue') searchItems = searchItems.filter(i => i.kind === 'venue');
    const searchChips = [{k: 'all', l: 'Tất cả'}, {k: 'art', l: 'Hiện vật'}, {
      k: 'venue',
      l: 'Địa điểm'
    }].map(c => ({
      ...c,
      pick: () => this.setState({searchFilter: c.k}),
      bg: st.searchFilter === c.k ? 'var(--cta)' : 'transparent',
      color: st.searchFilter === c.k ? 'var(--on-cta)' : 'var(--text-secondary)',
      border: st.searchFilter === c.k ? 'var(--cta)' : 'var(--border)'
    }));

    // audio
    const audioPct = st.audioProgress + '%';

    return {
      // EXPLORE
      isExplore: st.screen === 'explore',
      locGranted: !!(st.permissions && st.permissions.location === 1),
      exploreNoLoc: !(st.permissions && st.permissions.location === 1),
      enableLoc: () => {
        this.setState({permissions: Object.assign({}, st.permissions, {location: 1}), _exploreH: 18});
        this.showToast('Đã bật vị trí — hiện di tích gần bạn ✦');
      },
      showMap: !st.isOffline && st.permissions && st.permissions.location === 1 && !st._noLocation,
      mapHidden: st.isOffline && st.permissions && st.permissions.location === 1 && !st._noLocation,
      mapHiddenIcon: st.isOffline ? 'ti-wifi-off' : 'ti-map-pin-off',
      mapHiddenTitle: st.isOffline ? 'Bản đồ không khả dụng offline' : 'Chưa xác định được vị trí',
      mapHiddenBody: st.isOffline ? 'Bạn vẫn có thể xem danh sách địa điểm đã tải bên dưới.' : 'Bật vị trí để xem di tích gần bạn, hoặc chọn một thành phố để khám phá.',
      showChooseCity: st._noLocation && !st.isOffline,
      chooseCity: () => this.setState({sheet: 'city'}),
      sheetCity: st.sheet === 'city',
      cityList: ['Hà Nội', 'TP.HCM', 'Huế', 'Đà Nẵng', 'Quảng Nam', 'Ninh Bình'].map(c => ({
        name: c, pick: () => {
          this.setState({_noLocation: false, _fallbackLoc: true, sheet: null});
          this.showToast('Đang khám phá di sản tại ' + c + ' ✦');
        }
      })),
      mapPins,
      venuesView,
      exploreCount: venuesView.length,
      exploreTitle: (st.permissions && st.permissions.location === 1)
          ? (venuesView.length + ' địa điểm gần bạn')
          : ('Khám phá ' + venuesView.length + ' di tích'),
      exploreH: (st.permissions && st.permissions.location === 1) ? ((st._exploreH || 18) + '%') : '100%',
      exPanelRadius: (st.permissions && st.permissions.location === 1) ? '24px 24px 0 0' : '0',
      exDragDisp: (st.permissions && st.permissions.location === 1) ? 'block' : 'none',
      exHeaderCursor: (st.permissions && st.permissions.location === 1) ? 'grab' : 'default',
      exPanelPadTop: (st.permissions && st.permissions.location === 1) ? '0' : '100px',
      exSheetRef: (el) => {
        this._exSheetEl = el;
      },
      exToggleH: () => this.exToggleH(),
      exDragStart: (e) => this.exDragStart(e),
      deselectPin: () => this.deselectPin(),
      usingFallbackLoc: st._fallbackLoc,
      openSearchFromExplore: () => this.nav('search', 'fwd'),
      // SEARCH
      isSearch: st.screen === 'search',
      searchQuery: st.searchQuery,
      onSearchInput: (e) => this.setState({searchQuery: e.target.value}),
      searchChips,
      searchItems,
      searchHasQuery: !!q,
      searchEmpty: q && searchItems.length === 0,
      clearSearch: () => this.setState({searchQuery: ''}),
      // PLACE DETAIL
      isPlace: st.screen === 'place',
      curVen: {...ven, img: this.vimg(ven.seed, 600, 400)},
      venHours: (this.venueInfos[ven.id]?.openingHours) || '08:00 - 17:00',
      venClosedDays: (this.venueInfos[ven.id]?.closedDays) || 'Không nghỉ',
      venTicketAdult: (this.venueInfos[ven.id]?.ticketPrice?.adult) || 'Liên hệ',
      venTicketChild: (this.venueInfos[ven.id]?.ticketPrice?.child) || 'Liên hệ',
      venTicketNote: (this.venueInfos[ven.id]?.ticketPrice?.note) || 'Tham quan tự do',
      venAddress: (this.venueInfos[ven.id]?.address) || (ven.name + ', ' + ven.city),
      venPhone: (this.venueInfos[ven.id]?.phone) || 'Không có',
      venPhoneLink: 'tel:' + ((this.venueInfos[ven.id]?.phone) || '02412345678').replace(/\s+/g, ''),
      venWebsite: (this.venueInfos[ven.id]?.website) || 'Không có',
      venWebsiteLink: (this.venueInfos[ven.id]?.website) ? ('https://' + this.venueInfos[ven.id].website) : '',
      venEmail: (this.venueInfos[ven.id]?.email) || 'Không có',
      venEmailLink: (this.venueInfos[ven.id]?.email) ? ('mailto:' + this.venueInfos[ven.id].email) : '',
      venDuration: (this.venueInfos[ven.id]?.estimatedVisitDuration) || '60 - 90 phút',
      venMapImg: 'https://picsum.photos/seed/map-' + ven.id + '/420/160',
      venHasWifi: (this.venueInfos[ven.id]?.amenities || ['wifi', 'parking', 'guide']).includes('wifi'),
      venHasParking: (this.venueInfos[ven.id]?.amenities || ['wifi', 'parking', 'guide']).includes('parking'),
      venHasGuide: (this.venueInfos[ven.id]?.amenities || ['wifi', 'parking', 'guide']).includes('guide'),
      venHasShop: (this.venueInfos[ven.id]?.amenities || ['wifi', 'parking', 'guide']).includes('shop'),
      venHasCafe: (this.venueInfos[ven.id]?.amenities || ['wifi', 'parking', 'guide']).includes('cafe'),
      openGoogleMaps: () => this.openGoogleMaps(ven.id),
      copyAddress: () => this.copyToClipboard((this.venueInfos[ven.id]?.address) || (ven.name + ', ' + ven.city), 'địa chỉ'),
      copyPhone: () => this.copyToClipboard((this.venueInfos[ven.id]?.phone) || 'Không có', 'số điện thoại'),
      copyEmail: () => this.copyToClipboard((this.venueInfos[ven.id]?.email) || 'Không có', 'email'),
      venArtifacts: venArtifacts.map(a => ({
        ...a,
        img: this.vimg(a.seed, 200, 200),
        open: () => this.openArtifactModel(a.id)
      })),
      venArtCount: venArtifacts.length,
      showWheelchairToggle: st.a11y.motor,
      wcTrackBg: st.wheelchair ? 'var(--cta)' : 'var(--bg-tertiary)',
      wcKnobX: st.wheelchair ? '19px' : '0px',
      toggleWheelchair: () => {
        this.setState({wheelchair: !st.wheelchair});
        this.showToast(st.wheelchair ? 'Đã tắt lộ trình xe lăn' : 'Hiện lối tiếp cận thân thiện xe lăn ♿');
      },
      venAccessNote: ven.wheelchair ? ('Có lối tiếp cận — ' + ven.floor) : ('Khó tiếp cận — ' + ven.floor),
      venAccessColor: ven.wheelchair ? 'var(--success)' : 'var(--warning)',
      venAccessIcon: ven.wheelchair ? 'ti-wheelchair' : 'ti-stairs',
      downloadVenuePack: () => this.downloadVenueDataPack(ven.id),
      venueDownloadDisabled: !!st._venueDownloadLoading,
      venueDownloadIcon: st._venueDownloadLoading ? 'ti-loader-2' : 'ti-download',
      venueDownloadIconSpin: st._venueDownloadLoading ? 'vhSpin .9s linear infinite' : 'none',
      venueDownloadText: st._venueDownloadLoading ? 'Đang tải...' : 'Tải xuống gói dữ liệu',
      venueDownloadProgressW: (st._venueDownloadProgress || 0) + '%',
      venueDownloadPercent: (st._venueDownloadProgress || 0) + '%',
      venueDownloadPercentDisp: st._venueDownloadLoading ? 'inline-flex' : 'none',
      venueDownloadError: st._venueDownloadError || '',
      showVenueDownloadError: !!st._venueDownloadError,
      openAreaMap: () => this.nav('areamap', 'fwd'),
      readArticle: () => this.nav('article', 'fwd'),
      // AREA MAP (lối tiếp cận khu vực)
      isAreaMap: st.screen === 'areamap',
      amVenName: ven.name,
      amVenCity: ven.city,
      amPinX: ven.x,
      amPinY: ven.y,
      amAccessNote: ven.wheelchair ? ('Có lối tiếp cận — ' + ven.floor) : ('Khó tiếp cận — ' + ven.floor),
      amAccessColor: ven.wheelchair ? 'var(--success)' : 'var(--warning)',
      amAccessIcon: ven.wheelchair ? 'ti-wheelchair' : 'ti-stairs',
      amAccessDesc: ven.wheelchair
          ? 'Đường vào bằng phẳng, có lối dắt và không gian xoay trở rộng — thân thiện với xe lăn và người cao tuổi ♿'
          : 'Khu vực có bậc thang và mặt nền không bằng phẳng — cân nhắc nếu di chuyển khó khăn.',
      // VENUE ARTICLE
      isArticle: st.screen === 'article',
      articleTitle: ven.name,
      articleImg: this.vimg(ven.seed, 600, 360),
      articleImg2: this.vimg((venArtifacts[0] || cur).seed, 600, 360),
      // ARTIFACT DETAIL
      isArtifact: st.screen === 'artifact',
      curArt: {...cur, img: this.vimg(cur.seed, 600, 440)},
      fromScan: st._fromScan,
      audioPct,
      audioTime: this.fmtTime(st.audioProgress),
      audioIcon: st.isPlaying ? 'ti-player-pause-filled' : 'ti-player-play-filled',
      toggleAudio: () => this.toggleAudio(),
      audioHDTap: () => {
        if (isPremium) this.showToast('Đang phát bản HD giọng nghệ sĩ...'); else this.premiumGate();
      },
      audioTotal: this.fmtTime(100),
      audioScrub: (e) => this.audioScrubStart(e),
      // voice picker
      voiceLabel: st.audioVoice || 'Tiêu chuẩn',
      voiceLocked: !isPremium,
      voiceCrownDisp: isPremium ? 'none' : 'flex',
      voiceTap: () => {
        if (!isPremium) this.premiumGate();
        else this.setState({sheet: 'voicepick'});
      },
      sheetVoicePick: st.sheet === 'voicepick',
      closeVoicePick: () => this.setState({sheet: null}),
      voiceRows: [
        {name: 'Tiêu chuẩn', desc: 'Giọng đọc AI tự nhiên', icon: 'ti-robot'},
        {name: 'Giọng nghệ sĩ (Nam)', desc: 'NSƯT — chất giọng Bắc trầm ấm', icon: 'ti-microphone'},
        {name: 'Giọng nữ miền Nam', desc: 'Ngọt ngào, truyền cảm', icon: 'ti-microphone-2'},
        {name: 'Giọng kể chuyện', desc: 'Trầm, chậm rãi, cuốn hút', icon: 'ti-book'},
      ].map(v => {
        const active = (st.audioVoice || 'Tiêu chuẩn') === v.name;
        return {
          ...v, active,
          border: active ? 'var(--cta)' : 'var(--border)',
          check: active ? 'block' : 'none',
          pick: () => {
            this.setState({audioVoice: v.name, sheet: null});
            this.showToast('Đã đổi giọng — ' + v.name);
          }
        };
      }),
      // Màn 3 — bài viết chuyên sâu (premium)
      article3Icon: isPremium ? 'ti-chevron-right' : 'ti-crown',
      openArticle3: () => {
        if (isPremium) this.nav('article3', 'fwd');
        else this.premiumGate();
      },
      isArticle3: st.screen === 'article3',
      a3Hero: this.vimg(cur.seed, 700, 460),
      a3ArtName: cur.name,
      a3Title: a3.title,
      a3Abstract: a3.abstract,
      a3Read: a3.readTime,
      a3Author: a3.author,
      a3Role: a3.role,
      a3Blocks: a3.blocks.map(b => ({
        ...b,
        isP: b.t === 'p',
        isH: b.t === 'h',
        isImg: b.t === 'img',
        isSpec: b.t === 'spec',
        isQuote: b.t === 'quote',
        imgUrl: b.t === 'img' ? this.vimg(b.seed, 600, 360) : '',
        items: b.items || [],
      })),
      isPremium,
      openAudioPlayer: () => {
        this.nav('audioplayer', 'fwd');
        if (!st.isPlaying) this.toggleAudio();
      },
      isAudioPlayer: st.screen === 'audioplayer',
      apImg: this.vimg(cur.seed, 500, 500),
      apName: cur.name,
      apSub: (cur.era || '') + ' · Thuyết minh',
      apSpeedLabel: (st.audioSpeed || 1) + 'x',
      apSpeed: () => {
        const seq = [1, 1.25, 1.5, 0.75];
        const i = seq.indexOf(st.audioSpeed || 1);
        this.setState({audioSpeed: seq[(i + 1) % seq.length]});
      },
      apBack15: () => this.setState({audioProgress: Math.max(0, st.audioProgress - 6.75)}),
      apFwd15: () => this.setState({audioProgress: Math.min(100, st.audioProgress + 6.75)}),
      apHD: () => {
        if (isPremium) this.showToast('Đang phát bản HD giọng nghệ sĩ ✦'); else this.premiumGate();
      },
      apHDColor: isPremium ? 'var(--cta)' : 'rgba(255,255,255,.5)',
      apSeek: (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
        this.setState({audioProgress: pct});
      },
      apLyricsRef: (el) => {
        this._apLyricsEl = el;
      },
      apLyrics: (() => {
        const lyrics = this.audioLyrics;
        const cp = st.audioProgress;
        const words = [];
        for (let i = 0; i < lyrics.length; i++) {
          const l = lyrics[i];
          const next = lyrics[i + 1];
          const segStart = l.p;
          const segEnd = next ? next.p : 100;
          const segDur = segEnd - segStart;
          const ws = l.text.split(' ').filter(w => w);
          ws.forEach((word, wi) => {
            const wStart = segStart + (wi / ws.length) * segDur;
            const wEnd = segStart + ((wi + 1) / ws.length) * segDur;
            const active = cp >= wStart && cp < wEnd;
            const past = cp >= wEnd;
            words.push({
              text: word,
              active,
              color: active ? '#fff' : past ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.22)',
              seek: () => this.setState({audioProgress: wStart}),
            });
          });
        }
        return words;
      })(),
      open3D: () => {
        this.nav('threed', 'fwd');
        this.start3D();
        this.showToast('Kéo để xoay · chạm điểm sáng để xem chi tiết');
      },
      // điều hướng giữa Màn 1 (3D) <-> Màn 2 (chi tiết), tránh dồn history
      toDetail: () => {
        const h = this.state.history;
        if (h[h.length - 1] === 'artifact') this.back();
        else this.nav('artifact', 'fwd');
      },
      toModel: () => {
        const h = this.state.history;
        if (h[h.length - 1] === 'threed') this.back();
        else this.nav('threed', 'fwd');
        this.setState({threeDPlaying: true});
        this.start3D();
      },
      openTimeTravel: () => this.nav('timetravel', 'fwd'),
      gbCount: this.guestbook.length,
      saveBg: isSaved ? 'var(--cta)' : 'var(--bg-secondary)',
      saveColor: isSaved ? '#fff' : 'var(--text-primary)',
      saveHeroColor: isSaved ? 'var(--cta)' : '#fff',
      saveIcon: isSaved ? 'ti-bookmark-filled' : 'ti-bookmark-plus',
      saveLabel: isSaved ? 'Đã lưu' : 'Thêm vào bộ sưu tập',
      openSaveSheet: () => this.setState({sheet: 'savecollection'}),
      sheetSaveCollection: st.sheet === 'savecollection',
      closeSaveSheet: () => this.setState({sheet: null}),
      saveSheetRows: [
        {
          key: 'saved',
          emoji: '📌',
          name: 'Đã lưu',
          checked: st.saved.includes(cur.id),
          toggle: () => this.toggleSave(cur.id, true)
        },
        ...(st.collections || []).map(c => ({
          key: c.id, emoji: c.emoji || '📁', name: c.name,
          checked: (c.items || []).includes(cur.id),
          toggle: () => this.toggleArtInCollection(c.id),
        })),
      ].map(r => ({
        ...r,
        checkIcon: r.checked ? 'ti-checkbox' : 'ti-square',
        checkColor: r.checked ? 'var(--cta)' : 'var(--text-tertiary)'
      })),
      saveSheetCreateNew: () => this.setState({
        modal: 'createcollection',
        _ccName: '',
        _ccEmoji: '📁',
        _ccAddArt: cur.id
      }),
      closeCreateCollection: () => this.setState({
        modal: null,
        sheet: st._ccAddArt ? 'savecollection' : null,
        _ccName: '',
        _ccAddArt: null
      }),
      openShareArt: () => this.setState({sheet: 'share'}),
      openPhoto: () => this.openPhotoCapture(),
      showVoiceDesc: st.a11y.visualBlind,
      openAudioDesc: () => this.nav('audiodesc', 'fwd'),
      // CAMERA SHOT
      isCameraShot: st.screen === 'camerashot',
      takePhoto: () => this.takePhoto(),
      cameraShotImg: this.vimg(cur.seed, 500, 500),
      shutterFlash: st._shutterFlash ? 'block' : 'none',
      camerashotBack: () => this.back(),
      // 3D VIEWER
      isThreeD: st.screen === 'threed',
      threeDRot: 'rotateY(' + st.threeDRot + 'deg) scale(' + st.threeDZoom + ')',
      threeDImg: this.vimg(cur.seed, 500, 500),
      rot3DLeft: () => this.setState({threeDRot: (st.threeDRot - 30 + 360) % 360}),
      rot3DRight: () => this.setState({threeDRot: (st.threeDRot + 30) % 360}),
      zoom3DIn: () => this.zoom3DIn(),
      zoom3DOut: () => this.zoom3DOut(),
      reset3D: () => this.reset3D(),
      show3DHint: () => this.showToast('Kéo để xoay · chạm điểm sáng để xem chi tiết'),
      threeDPlaying: st.threeDPlaying,
      threeDPlayIcon: st.threeDPlaying ? 'ti-player-pause' : 'ti-player-play',
      toggle3DPlay: () => this.toggle3DPlay(),
      drag3DStart: (e) => this.drag3DStart(e),
      clearHotspot: () => this.setState({activeHotspot: null}),
      hasActiveHotspot: st.activeHotspot !== null && st.activeHotspot !== undefined,
      threeDPanelY: st.threeDPanelY !== undefined ? st.threeDPanelY : 80,
      threeDPanelH: ((((st.threeDPanelY !== undefined ? st.threeDPanelY : 80) === 0) ? 448 : 440) + (st.threeDPanelStretch || 0)) + 'px',
      panelTransition: this._draggingPanel ? 'none' : 'transform 0.3s ease',
      dragPanelStart: (e) => this.dragPanelStart(e),
      curArtMetaItems: [
        {label: 'Niên đại', value: cur.era},
        {label: 'Chất liệu', value: cur.material},
      ],
      
      // Dynamic Hotspot and details
      curArtName: (() => {
        const curHotspots = cur.hotspots || [
          { id: 1, title: 'Đỉnh hiện vật', summary: 'Phần phía trên của hiện vật chứa nhiều chi tiết trang trí tinh xảo.', desc: 'Đặc trưng hoa văn trang trí ở phần trên thể hiện tính thẩm mỹ cao và tài năng của các nghệ nhân chế tác cổ đại.' },
          { id: 2, title: 'Thân hiện vật', summary: 'Phần thân chính nâng đỡ cấu trúc hiện vật với chất liệu bền bỉ.', desc: 'Cấu trúc thân chính làm bằng chất liệu đặc trưng giúp hiện vật trường tồn qua hàng ngàn năm lịch sử.' },
          { id: 3, title: 'Chân đế hiện vật', summary: 'Đế vững chãi nâng đỡ toàn bộ hiện vật.', desc: 'Chân đế được gia cố vững chắc, có kết cấu đặc trưng để giữ thăng bằng cho hiện vật trong suốt thời kỳ trưng bày.' }
        ];
        const activeH = curHotspots.find(h => h.id === st.activeHotspot);
        return activeH ? activeH.title : cur.name;
      })(),
      curHotspotImg: (() => {
        const curHotspots = cur.hotspots || [
          { id: 1, title: 'Đỉnh hiện vật', summary: 'Phần phía trên của hiện vật chứa nhiều chi tiết trang trí tinh xảo.', desc: 'Đặc trưng hoa văn trang trí ở phần trên thể hiện tính thẩm mỹ cao và tài năng của các nghệ nhân chế tác cổ đại.' },
          { id: 2, title: 'Thân hiện vật', summary: 'Phần thân chính nâng đỡ cấu trúc hiện vật với chất liệu bền bỉ.', desc: 'Cấu trúc thân chính làm bằng chất liệu đặc trưng giúp hiện vật trường tồn qua hàng ngàn năm lịch sử.' },
          { id: 3, title: 'Chân đế hiện vật', summary: 'Đế vững chãi nâng đỡ toàn bộ hiện vật.', desc: 'Chân đế được gia cố vững chắc, có kết cấu đặc trưng để giữ thăng bằng cho hiện vật trong suốt thời kỳ trưng bày.' }
        ];
        const activeH = curHotspots.find(h => h.id === st.activeHotspot);
        return activeH ? this.vimg(cur.seed + '_part' + activeH.id, 120, 120) : null;
      })(),
      curArtSummary: (() => {
        const curHotspots = cur.hotspots || [
          { id: 1, title: 'Đỉnh hiện vật', summary: 'Phần phía trên của hiện vật chứa nhiều chi tiết trang trí tinh xảo.', desc: 'Đặc trưng hoa văn trang trí ở phần trên thể hiện tính thẩm mỹ cao và tài năng của các nghệ nhân chế tác cổ đại.' },
          { id: 2, title: 'Thân hiện vật', summary: 'Phần thân chính nâng đỡ cấu trúc hiện vật với chất liệu bền bỉ.', desc: 'Cấu trúc thân chính làm bằng chất liệu đặc trưng giúp hiện vật trường tồn qua hàng ngàn năm lịch sử.' },
          { id: 3, title: 'Chân đế hiện vật', summary: 'Đế vững chãi nâng đỡ toàn bộ hiện vật.', desc: 'Chân đế được gia cố vững chắc, có kết cấu đặc trưng để giữ thăng bằng cho hiện vật trong suốt thời kỳ trưng bày.' }
        ];
        const activeH = curHotspots.find(h => h.id === st.activeHotspot);
        return activeH ? activeH.summary : cur.summary;
      })(),
      curArtDesc: (() => {
        const curHotspots = cur.hotspots || [
          { id: 1, title: 'Đỉnh hiện vật', summary: 'Phần phía trên của hiện vật chứa nhiều chi tiết trang trí tinh xảo.', desc: 'Đặc trưng hoa văn trang trí ở phần trên thể hiện tính thẩm mỹ cao và tài năng của các nghệ nhân chế tác cổ đại.' },
          { id: 2, title: 'Thân hiện vật', summary: 'Phần thân chính nâng đỡ cấu trúc hiện vật với chất liệu bền bỉ.', desc: 'Cấu trúc thân chính làm bằng chất liệu đặc trưng giúp hiện vật trường tồn qua hàng ngàn năm lịch sử.' },
          { id: 3, title: 'Chân đế hiện vật', summary: 'Đế vững chãi nâng đỡ toàn bộ hiện vật.', desc: 'Chân đế được gia cố vững chắc, có kết cấu đặc trưng để giữ thăng bằng cho hiện vật trong suốt thời kỳ trưng bày.' }
        ];
        const activeH = curHotspots.find(h => h.id === st.activeHotspot);
        return activeH ? activeH.desc : cur.desc;
      })(),
      activeHotspot: st.activeHotspot,
      curHotspots: isARGbMode ? [] : (cur.hotspots || [
        { id: 1, title: 'Đỉnh hiện vật', summary: 'Phần phía trên của hiện vật chứa nhiều chi tiết trang trí tinh xảo.', desc: 'Đặc trưng hoa văn trang trí ở phần trên thể hiện tính thẩm mỹ cao và tài năng của các nghệ nhân chế tác cổ đại.' },
        { id: 2, title: 'Thân hiện vật', summary: 'Phần thân chính nâng đỡ cấu trúc hiện vật với chất liệu bền bỉ.', desc: 'Cấu trúc thân chính làm bằng chất liệu đặc trưng giúp hiện vật trường tồn qua hàng ngàn năm lịch sử.' },
        { id: 3, title: 'Chân đế hiện vật', summary: 'Đế vững chãi nâng đỡ toàn bộ hiện vật.', desc: 'Chân đế được gia cố vững chắc, có kết cấu đặc trưng để giữ thăng bằng cho hiện vật trong suốt thời kỳ trưng bày.' }
      ]).map(h => ({
        ...h,
        isActive: st.activeHotspot === h.id,
        style: [
          'position:absolute;top:20%;left:78%;',
          'position:absolute;top:62%;left:14%;',
          'position:absolute;top:40%;left:50%;'
        ][h.id - 1] || 'position:absolute;top:50%;left:50%;',
        activeScale: st.activeHotspot === h.id ? 'scale(1.4)' : 'scale(1)',
        activeColor: st.activeHotspot === h.id ? 'var(--cta)' : 'var(--info)',
        tap: (e) => { e.stopPropagation(); this.selectHotspot(h.id); }
      })),
      showDetailBtn: (st.threeDPanelY !== undefined ? st.threeDPanelY : 80) <= 170,

      // Report screen flow
      openReportArtifact: () => this.openReportArtifact(),
      submitReportScreen: () => this.submitReportScreen(),
      isReportScreen: st.screen === 'report_screen',
      reportText: st._reportText || '',
      reportImage: st._reportImage,
      hasReportImage: !!st._reportImage,
      hasNoReportImage: !st._reportImage,
      reportType: (st._reportTypes || []).join(','),
      selectReportTypeInfo: () => this.selectReportType('info'),
      selectReportTypeModel: () => this.selectReportType('model'),
      selectReportTypeTypo: () => this.selectReportType('typo'),
      selectReportTypeOther: () => this.selectReportType('other'),
      simulateUploadImage: () => this.simulateUploadImage(),
      removeReportImage: () => this.removeReportImage(),

      // Option styles tính sẵn (tránh logic trong template)
      reportIconInfo: (st._reportTypes || []).includes('info') ? 'ti-checkbox' : 'ti-square',
      reportColorInfo: (st._reportTypes || []).includes('info') ? 'var(--cta)' : 'var(--text-tertiary)',
      reportBorderInfo: (st._reportTypes || []).includes('info') ? '1px solid var(--cta)' : '1px solid var(--border)',
      reportBgInfo: (st._reportTypes || []).includes('info') ? 'var(--bg-tertiary)' : 'var(--bg-card)',

      reportIconModel: (st._reportTypes || []).includes('model') ? 'ti-checkbox' : 'ti-square',
      reportColorModel: (st._reportTypes || []).includes('model') ? 'var(--cta)' : 'var(--text-tertiary)',
      reportBorderModel: (st._reportTypes || []).includes('model') ? '1px solid var(--cta)' : '1px solid var(--border)',
      reportBgModel: (st._reportTypes || []).includes('model') ? 'var(--bg-tertiary)' : 'var(--bg-card)',

      reportIconTypo: (st._reportTypes || []).includes('typo') ? 'ti-checkbox' : 'ti-square',
      reportColorTypo: (st._reportTypes || []).includes('typo') ? 'var(--cta)' : 'var(--text-tertiary)',
      reportBorderTypo: (st._reportTypes || []).includes('typo') ? '1px solid var(--cta)' : '1px solid var(--border)',
      reportBgTypo: (st._reportTypes || []).includes('typo') ? 'var(--bg-tertiary)' : 'var(--bg-card)',

      reportIconOther: (st._reportTypes || []).includes('other') ? 'ti-checkbox' : 'ti-square',
      reportColorOther: (st._reportTypes || []).includes('other') ? 'var(--cta)' : 'var(--text-tertiary)',
      reportBorderOther: (st._reportTypes || []).includes('other') ? '1px solid var(--cta)' : '1px solid var(--border)',
      reportBgOther: (st._reportTypes || []).includes('other') ? 'var(--bg-tertiary)' : 'var(--bg-card)',

      // Nút Gửi báo cáo state
      reportSubmitBg: (st._reportTypes && st._reportTypes.length > 0) ? 'var(--cta)' : 'var(--disabled-bg)',
      reportSubmitFg: (st._reportTypes && st._reportTypes.length > 0) ? '#fff' : 'var(--disabled-fg)',
      reportSubmitCursor: (st._reportTypes && st._reportTypes.length > 0) ? 'pointer' : 'not-allowed',
      reportSubmitShadow: (st._reportTypes && st._reportTypes.length > 0) ? '0 4px 12px rgba(237,137,39,.2)' : 'none',
      reportSubmitPointerEvents: (st._reportTypes && st._reportTypes.length > 0) ? 'auto' : 'none',

      setReportText: (e) => this.setState({_reportText: e.target.value}),

      exit3D: () => {
        this.stop3D();
        this.back();
      },
      // TIME TRAVEL (2 mốc: Hiện trạng / Phục dựng 3D)
      isTimeTravel: st.screen === 'timetravel',
      timeIdx: st.timeIdx,
      timeLabel: ['Hiện trạng ngày nay', 'Phục dựng 3D đầy đủ'][st.timeIdx],
      timeBigSub: [
        'Hình ảnh hiện vật theo hiện trạng đang được lưu giữ và trưng bày.',
        'Mô hình phục dựng 3D đầy đủ — chi tiết, màu sắc và hoa văn nguyên gốc.'
      ][st.timeIdx],
      timeSwipe: (e) => this.timeSwipeStart(e),
      timeImg0: this.vimg(cur.seed, 600, 760),
      timeImg1: this.vimg(cur.seed, 600, 760),
      timeImg0Opacity: st.timeIdx === 0 ? 1 : 0,
      timeImg1Opacity: st.timeIdx === 1 ? 1 : 0,
      time3DDisp: st.timeIdx === 1 ? 'block' : 'none',
      timeBadge: ['Hiện trạng trưng bày', 'Mô hình phục dựng 3D'][st.timeIdx],
      timeBadgeIcon: ['ti-building-museum', 'ti-cube-3d-sphere'][st.timeIdx],
      
      timeSliderPct: st._timeTravelPct !== undefined ? st._timeTravelPct : (st.timeIdx * 100),
      timeThumbTransition: this._draggingTimeSlider ? 'none' : 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      timeTrackTransition: this._draggingTimeSlider ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      onTimeSliderStart: (e) => this.timeSliderStart(e),
      
      // Props riêng cho 2 nhãn mốc (tránh sc-for wrapper phá flex:1)
      timePick0: () => this.pickTimeStage(0),
      timePick1: () => this.pickTimeStage(1),
      timeLabel0Color: st.timeIdx === 0 ? '#fff' : 'rgba(255,255,255,.45)',
      timeLabel1Color: st.timeIdx === 1 ? '#fff' : 'rgba(255,255,255,.45)',
      timeLabel0Weight: st.timeIdx === 0 ? '700' : '500',
      timeLabel1Weight: st.timeIdx === 1 ? '700' : '500',
      // PHOTO DETAIL
      isPhoto: st.screen === 'photo',
      photoImg: this.vimg(cur.seed, 600, 700),
      sharePhoto: () => this.setState({sheet: 'share'}),
      // AUDIO DESC
      isAudioDesc: st.screen === 'audiodesc',
      descShape: cur.shape,
      descName: cur.name,
      descImg: this.vimg(cur.seed, 400, 300),
    };
  }
};
