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

  const FIXTURES = [
    {id: 'splash', name: '01 Splash', state: {}},
    {id: 'walkthrough', name: '02 Walkthrough', state: {walkStep: 0}},
    {id: 'authchoice', name: '03 AuthChoice', state: {}},
    {id: 'login', name: '04 Login', state: {liEmail: 'test@gmail.com', liPass: '123456'}},
    {id: 'register', name: '05 Register', state: {}},
    {id: 'forgot', name: '06 ForgotPassword', state: {}},
    {id: 'parental', name: '07 ParentalConsent', state: {}},
    {id: 'language', name: '08 Language', state: {}},
    {id: 'special', name: '09 SpecialSupport', state: {}},
    {id: 'locationask', name: '10 LocationAsk', state: {}},
    {id: 'cameraask', name: '11 CameraAsk', state: {}},
    {id: 'nearby', name: '12 NearbySuggest', state: {...AUTH}},
    {id: 'home', name: '13 Home', state: {...AUTH, _visited: [1], saved: [1, 2]}},
    {id: 'explore', name: '14 Explore', state: {...AUTH, ...PERMS}},
    {id: 'search', name: '15 Search', state: {...AUTH}},
    {id: 'place', name: '16 PlaceDetail', state: {...AUTH, curVenueId: 1}},
    {id: 'areamap', name: '17 AreaMap', state: {...AUTH, curVenueId: 1}},
    {id: 'article', name: '18 VenueArticle', state: {...AUTH, curVenueId: 1}},
    {id: 'artifact', name: '19 ArtifactDetail', state: {...AUTH, ...ART, saved: [1]}},
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
    {id: 'timetravel', name: '26 TimeTravel', state: {...AUTH, ...ART, timeIdx: 1}},
    {id: 'report_screen', name: '27 ReportScreen', state: {...AUTH, ...ART}},
    {id: 'scan', name: '28 ARScanner', state: {...AUTH, ...PERMS, scanState: 'idle'}},
    {id: 'qrscanner', name: '29 QRScanner', state: {...AUTH, ...PERMS, qrState: 'idle'}},
    {
      id: 'aiwrong', name: '30 AIWrong',
      state: {...AUTH, ...PERMS, scanState: 'fail', scanFailReason: 'wrong'},
    },
    {
      id: 'library', name: '31 Library',
      state: {...AUTH, saved: [1, 2, 3], collections: COLS, libTab: 'art'},
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
