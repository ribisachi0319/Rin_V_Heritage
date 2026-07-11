// Danh sách màn hình cần export sang Figma + state cần set để dựng đúng màn.
// Dùng chung cho node (export.js) và browser (driver.js).
(function (root) {
  const AUTH = {
    user: {name: 'Rin Kanamiza', email: 'test@gmail.com', isLoggedIn: true, age: 22},
  };
  const COLS = [
    {id: 'c1', name: 'Yêu thích', emoji: '⭐', items: [1, 2]},
    {id: 'c2', name: 'Đồ đồng cổ', emoji: '🏺', items: [1]},
  ];
  const ART = {curArtId: 1};
  const PERMS = {permissions: {camera: 1, location: 1, audio: 1, notification: 1}};
  // Mặc định của state.rg (app.dc.html) — dùng làm nền cho từng bước đăng ký,
  // tránh mất field khi chỉ set 1 phần (setState thay nguyên object rg, không merge sâu).
  const RG_DEFAULT = {
    first: '', last: '', email: '', birth: '', pass: '', confirm: '',
    terms: false, show: false, showConfirm: false, err: {}, step: 'age', ageBracket: null, needA11y: false,
  };

  const FIXTURES = [
    {id: 'splash', name: '01 Splash', state: {}},
    {id: 'walkthrough', name: '02 Walkthrough', state: {walkStep: 0}},
    {id: 'onboardloc', name: '02b Onboard - Vị trí', state: {}},
    {id: 'onboardcam', name: '02c Onboard - Camera', state: {}},
    {id: 'onboardnotif', name: '02d Onboard - Thông báo', state: {}},
    {id: 'authchoice', name: '03 AuthChoice', state: {}},
    {id: 'login', name: '04 Login', state: {liEmail: 'test@gmail.com', liPass: '123456'}},
    {id: 'register', name: '05 Register - Tuổi', state: {}},
    {
      id: 'register_mature', name: '05 Register - Tuổi (45+)', screen: 'register',
      state: {rg: {...RG_DEFAULT, ageBracket: 'mature'}},
    },
    {
      id: 'register_name', name: '05 Register - Tên', screen: 'register',
      state: {rg: {...RG_DEFAULT, step: 'name', birth: '1990'}},
    },
    {
      id: 'register_account', name: '05 Register - Tài khoản', screen: 'register',
      state: {rg: {...RG_DEFAULT, step: 'account', first: 'Rin', last: 'Kanamiza', birth: '1990'}},
    },
    {
      id: 'register_otp', name: '05 Register - OTP', screen: 'register',
      state: {
        rg: {...RG_DEFAULT, step: 'otp', first: 'Rin', last: 'Kanamiza', email: 'test@gmail.com', birth: '1990'},
        otpArr: ['1', '2', '3', '', '', ''],
      },
    },
    {id: 'forgot', name: '06 ForgotPassword - Email', state: {}},
    {
      id: 'forgot_otp', name: '06 ForgotPassword - OTP', screen: 'forgot',
      state: {fpStep: 'otp', otpArr: ['1', '2', '3', '', '', '']},
    },
    {id: 'forgot_reset', name: '06 ForgotPassword - Mật khẩu mới', screen: 'forgot', state: {fpStep: 'reset'}},
    {id: 'forgot_done', name: '06 ForgotPassword - Hoàn tất', screen: 'forgot', state: {fpStep: 'done'}},
    {id: 'parental', name: '07 ParentalConsent - Chưa gửi', state: {}},
    {
      id: 'parental_sent', name: '07 ParentalConsent - Đã gửi', screen: 'parental',
      state: {parentalSent: true, parentEmail: 'phuhuynh@email.com'},
    },
    {id: 'language', name: '08 Language', state: {}},
    {id: 'special', name: '09 SpecialSupport', state: {}},
    {id: 'locationask', name: '10 LocationAsk', state: {}},
    {id: 'cameraask', name: '11 CameraAsk', state: {}},
    {id: 'nearby', name: '12 NearbySuggest', state: {...AUTH}},
    {id: 'home', name: '13 Home', state: {...AUTH, _visited: [1], saved: [1, 2]}},
    {
      id: 'home_predownload', name: '13 Home - Sheet phát hiện vị trí', screen: 'home',
      state: {...AUTH, _visited: [1], saved: [1, 2], sheet: 'preDownloadPack'},
    },
    {
      id: 'home_continue', name: '13 Home - Tiếp tục tham quan', screen: 'home',
      state: {...AUTH, _visited: [1], saved: [1, 2], _visitVenue: 1},
    },
    {id: 'explore', name: '14 Explore', state: {...AUTH, ...PERMS}},
    {
      id: 'explore_offline', name: '14 Explore - Offline', screen: 'explore',
      state: {...AUTH, ...PERMS, isOffline: true},
    },
    {
      id: 'explore_fallback', name: '14 Explore - Vị trí mặc định', screen: 'explore',
      state: {...AUTH, ...PERMS, _fallbackLoc: true},
    },
    {
      id: 'explore_pin_selected', name: '14 Explore - Đã chọn điểm', screen: 'explore',
      state: {...AUTH, ...PERMS, curVenueId: 1, _exploreH: 46},
    },
    {
      id: 'explore_expanded', name: '14 Explore - Kéo lên cao', screen: 'explore',
      state: {...AUTH, ...PERMS, _exploreH: 80},
    },
    {id: 'search', name: '15 Search - Trống', state: {...AUTH}},
    {
      id: 'search_results', name: '15 Search - Có kết quả', screen: 'search',
      state: {...AUTH, searchQuery: 'Trống đồng'},
    },
    {
      id: 'search_empty', name: '15 Search - Không có kết quả', screen: 'search',
      state: {...AUTH, searchQuery: 'zzznotfound'},
    },
    {id: 'place', name: '16 PlaceDetail', state: {...AUTH, curVenueId: 1}},
    {
      id: 'place_wheelchair', name: '16 PlaceDetail - Xe lăn', screen: 'place',
      state: {...AUTH, curVenueId: 1, a11y: {motor: true}},
    },
    {
      id: 'place_downloaderror', name: '16 PlaceDetail - Lỗi tải', screen: 'place',
      state: {...AUTH, curVenueId: 1, _venueDownloadError: 'Không thể tải gói dữ liệu. Vui lòng thử lại.'},
    },
    {id: 'areamap', name: '17 AreaMap', state: {...AUTH, curVenueId: 1}},
    {id: 'article', name: '18 VenueArticle', state: {...AUTH, curVenueId: 1}},
    {id: 'artifact', name: '19 ArtifactDetail', state: {...AUTH, ...ART, saved: [1]}},
    {
      id: 'artifact_fromscan', name: '19 ArtifactDetail - Từ quét AR', screen: 'artifact',
      state: {...AUTH, ...ART, saved: [1], _fromScan: true},
    },
    {
      id: 'artifact_voicedesc', name: '19 ArtifactDetail - Mô tả giọng nói', screen: 'artifact',
      state: {...AUTH, ...ART, saved: [1], a11y: {visualBlind: true}},
    },
    {
      id: 'article3', name: '20 DeepArticle',
      state: {...AUTH, ...ART, tiers: {premium: true, academic: true}},
    },
    {
      id: 'audioplayer', name: '21 AudioPlayer',
      state: {...AUTH, ...ART, isPlaying: true, audioProgress: 38},
    },
    {id: 'audiodesc', name: '22 AudioDescription', state: {...AUTH, ...ART}},
    {id: 'photo', name: '23 ArtifactPhoto', state: {...AUTH, ...ART}},
    {id: 'camerashot', name: '24 CameraShot', state: {...AUTH, ...ART, ...PERMS}},
    {id: 'threed', name: '25 ThreeDViewer', state: {...AUTH, ...ART}},
    {
      id: 'threed_gb', name: '25 ThreeDViewer - Sổ lưu niệm', screen: 'threed',
      state: {...AUTH, ...ART, _arMode: 'guestbook'},
    },
    {
      id: 'threed_gb_selected', name: '25 ThreeDViewer - Bình luận đã chọn', screen: 'threed',
      state: {...AUTH, ...ART, _arMode: 'guestbook', _arGbBubble: 1},
    },
    {id: 'timetravel', name: '26 TimeTravel - Phục dựng 3D', state: {...AUTH, ...ART, timeIdx: 1}},
    {
      id: 'timetravel_now', name: '26 TimeTravel - Hiện trạng', screen: 'timetravel',
      state: {...AUTH, ...ART, timeIdx: 0},
    },
    {id: 'report_screen', name: '27 ReportScreen', state: {...AUTH, ...ART}},
    {id: 'scan', name: '28 ARScanner - Chờ', state: {...AUTH, ...PERMS, scanState: 'idle'}},
    {
      id: 'scan_scanning', name: '28 ARScanner - Đang quét', screen: 'scan',
      state: {...AUTH, ...PERMS, scanState: 'scanning'},
    },
    {
      id: 'scan_failed', name: '28 ARScanner - Thất bại', screen: 'scan',
      state: {...AUTH, ...PERMS, scanState: 'failed', scanFailReason: 'nomatch'},
    },
    {id: 'qrscanner', name: '29 QRScanner - Chờ', state: {...AUTH, ...PERMS, qrState: 'idle'}},
    {
      id: 'qrscanner_scanning', name: '29 QRScanner - Đang quét', screen: 'qrscanner',
      state: {...AUTH, ...PERMS, qrState: 'scanning'},
    },
    {
      id: 'qrscanner_flash', name: '29 QRScanner - Đèn flash', screen: 'qrscanner',
      state: {...AUTH, ...PERMS, qrState: 'flash'},
    },
    {
      id: 'aiwrong', name: '30 AIWrong',
      state: {...AUTH, ...PERMS, scanState: 'fail', scanFailReason: 'wrong'},
    },
    {
      id: 'library', name: '31 Library - Hiện vật',
      state: {...AUTH, saved: [1, 2, 3], collections: COLS, libTab: 'art'},
    },
    {
      id: 'library_photo', name: '31 Library - Ảnh', screen: 'library',
      state: {...AUTH, saved: [1, 2, 3], collections: COLS, libTab: 'photo'},
    },
    {
      id: 'library_collections', name: '31 Library - Bộ sưu tập', screen: 'library',
      state: {...AUTH, saved: [1, 2, 3], collections: COLS, libTab: 'collections'},
    },
    {
      id: 'library_badge', name: '31 Library - Huy hiệu', screen: 'library',
      state: {...AUTH, saved: [1, 2, 3], collections: COLS, libTab: 'badge'},
    },
    {
      id: 'library_empty', name: '31 Library - Trống', screen: 'library',
      state: {...AUTH, saved: [], collections: [], libTab: 'art'},
    },
    {
      id: 'collectiondetail', name: '32 CollectionDetail',
      state: {...AUTH, saved: [1, 2, 3], collections: COLS, _curCollection: 'c1'},
    },
    {id: 'articles', name: '33 ArticlesList', state: {...AUTH}},
    {id: 'articledetail', name: '34 ArticleDetail', state: {...AUTH, _curArticle: 1}},
    {id: 'downloads', name: '35 DownloadManager', state: {...AUTH}},
    {id: 'profile', name: '36 Profile', state: {...AUTH, saved: [1, 2]}},
    {id: 'paywall', name: '37 Paywall', state: {...AUTH}},
    {id: 'paymentmethod', name: '38 PaymentMethod', state: {...AUTH, paymentTier: 'premium'}},
    {
      id: 'paymentconfirm', name: '39 PaymentConfirm',
      state: {...AUTH, paymentTier: 'premium', paymentMethod: 'momo'},
    },
    {id: 'paymentsuccess', name: '40 PaymentSuccess', state: {...AUTH, paymentTier: 'premium'}},
    {id: 'paymentfailed', name: '41 PaymentFailed', state: {...AUTH, paymentTier: 'premium'}},
    {
      id: 'refund', name: '42 RefundRequest',
      state: {...AUTH, tiers: {premium: true, academic: false}, _refundTier: 'premium'},
    },
    {
      id: 'managetier', name: '43 ManageTier',
      state: {...AUTH, tiers: {premium: true, academic: true}},
    },
    {
      id: 'managepremium', name: '44 ManagePremium',
      state: {...AUTH, tiers: {premium: true, academic: false}},
    },
    {id: 'editprofile', name: '45 EditProfile', state: {...AUTH}},
    {id: 'notifications', name: '46 Notifications', state: {...AUTH}},
    {id: 'accountsecurity', name: '47 AccountSecurity', state: {...AUTH}},
    {id: 'changepassword', name: '48 ChangePassword', state: {...AUTH}},
    {id: 'changeemail', name: '49 ChangeEmail', state: {...AUTH}},
    {id: 'devicemanagement', name: '50 DeviceManagement', state: {...AUTH}},
    {id: 'deleteaccount', name: '51 DeleteAccount', state: {...AUTH}},
    {id: 'privacypolicy', name: '52 PrivacyPolicy', state: {...AUTH}},
    {id: 'eventdetail', name: '53 EventDetail', state: {...AUTH}},
    {id: 'settings', name: '54 Settings', state: {...AUTH}},
    {id: 'apppermissions', name: '55 AppPermissions', state: {...AUTH, ...PERMS}},
    {
      id: 'apppermissions_denied', name: '55 AppPermissions - Bị tắt trong hệ thống', screen: 'apppermissions',
      state: {...AUTH, ...PERMS, devicePerm: {notification: 'denied', location: 'denied', camera: 'denied'}},
    },
    {id: 'accessibility', name: '56 Accessibility', state: {...AUTH}},
    {id: 'privacy', name: '57 PrivacyScreen', state: {...AUTH}},
    {id: 'help', name: '58 HelpScreen', state: {...AUTH}},
    {id: 'contactsupport', name: '59 ContactSupport', state: {...AUTH}},
    {id: 'about', name: '60 AboutScreen', state: {...AUTH}},
    {id: 'error', name: '61 ErrorScreen', state: {...AUTH}},
    {id: 'maintenance', name: '62 Maintenance', state: {...AUTH}},
    {id: 'locked', name: '63 AccountLocked', state: {...AUTH}},
    {id: 'offline', name: '64 OfflineScreen', state: {...AUTH, isOffline: true}},
    {id: 'stub', name: '65 Stub', state: {...AUTH, _stubName: 'Tính năng demo'}},
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = FIXTURES;
  else root.VH_FIXTURES = FIXTURES;
})(typeof window !== 'undefined' ? window : globalThis);
