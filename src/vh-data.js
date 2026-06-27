// vh-data.js — Dữ liệu seed tĩnh của V-Heritage (không tham chiếu `this`).
// Được nạp qua <script src> trong app.dc.html rồi gộp vào Component bằng:
//   Object.assign(Component.prototype, VH_DATA)
// Sửa nội dung (hiện vật, bảo tàng, bài viết, đa ngôn ngữ...) ngay tại đây.
window.VH_DATA = {
  // Tài khoản demo
  DEMO_EMAIL: 'minhanh@email.com',
  DEMO_PASS: 'Heritage2024',

  venues: [
    {
      id: 1,
      name: 'Bảo tàng Lịch sử Quốc gia',
      city: 'Hà Nội',
      count: 48,
      seed: 'baotanglichsu',
      dist: 'Cách 1,2 km',
      x: '34%',
      y: '34%',
      wheelchair: true,
      floor: 'Tầng trệt'
    },
    {
      id: 2,
      name: 'Bảo tàng Mỹ thuật Việt Nam',
      city: 'Hà Nội',
      count: 32,
      seed: 'baotangmythuat',
      dist: 'Cách 2,8 km',
      x: '58%',
      y: '26%',
      wheelchair: true,
      floor: 'Tầng 2 — có thang máy'
    },
    {
      id: 3,
      name: 'Dinh Độc Lập',
      city: 'TP.HCM',
      count: 27,
      seed: 'dinhdoclap',
      dist: 'Cách 4,1 km',
      x: '24%',
      y: '56%',
      wheelchair: true,
      floor: 'Tầng trệt'
    },
    {
      id: 4,
      name: 'Khu di tích K9',
      city: 'Hà Nội',
      count: 15,
      seed: 'khuditichk9',
      dist: 'Cách 6,5 km',
      x: '70%',
      y: '50%',
      wheelchair: false,
      floor: 'Có bậc thang'
    },
    {
      id: 5,
      name: 'Thành cổ Quảng Trị',
      city: 'Quảng Trị',
      count: 21,
      seed: 'thanhcoquangtri',
      dist: 'Cách 9,0 km',
      x: '46%',
      y: '66%',
      wheelchair: true,
      floor: 'Lối phẳng'
    },
    {
      id: 6,
      name: 'Phố cổ Hội An',
      city: 'Quảng Nam',
      count: 56,
      seed: 'phocohoian',
      dist: 'Cách 11 km',
      x: '62%',
      y: '76%',
      wheelchair: true,
      floor: 'Lối phẳng'
    },
  ],

  artifacts: [
    {
      id: 1,
      name: 'Trống đồng Đông Sơn',
      era: '500 TCN',
      material: 'Đồng thau',
      venue: 1,
      seed: 'trongdong',
      views: '1.247',
      summary: 'Biểu tượng của nền văn minh Đông Sơn rực rỡ.',
      desc: 'Trống đồng Đông Sơn là biểu tượng của nền văn minh Đông Sơn rực rỡ. Mặt trống khắc hoa văn hình ngôi sao, chim Lạc và cảnh sinh hoạt — phản ánh đời sống tinh thần phong phú của người Việt cổ. Đây là hiện vật khảo cổ quan trọng bậc nhất, minh chứng cho kỹ thuật đúc đồng đỉnh cao cách đây hơn 2.500 năm.',
      shape: 'Hình trụ tròn, mặt trống phẳng đường kính khoảng 79cm, thân phình ở giữa và loe ra ở chân.'
    },
    {
      id: 2,
      name: 'Áo tứ thân',
      era: 'Thế kỷ XVIII',
      material: 'Lụa',
      venue: 2,
      seed: 'aotuthan',
      views: '842',
      summary: 'Trang phục truyền thống của phụ nữ Bắc Bộ.',
      desc: 'Trang phục truyền thống của phụ nữ Bắc Bộ, gồm bốn vạt áo tượng trưng cho tứ thân phụ mẫu. Thường mặc cùng yếm đào và khăn mỏ quạ trong các dịp lễ hội, thể hiện vẻ đẹp duyên dáng, kín đáo của người phụ nữ Việt xưa.',
      shape: 'Áo dài tới gối với bốn tà, hai tà trước buộc lại, màu nâu non và the thâm.'
    },
    {
      id: 3,
      name: 'Bình gốm triều Lý',
      era: 'Thế kỷ XI',
      material: 'Gốm sứ',
      venue: 1,
      seed: 'binhgomly',
      views: '623',
      summary: 'Đỉnh cao nghệ thuật gốm men ngọc thời Lý.',
      desc: 'Đỉnh cao của nghệ thuật gốm men ngọc thời Lý, với đường nét thanh thoát và lớp men xanh đặc trưng — minh chứng cho trình độ thủ công tinh xảo của Đại Việt.',
      shape: 'Bình cổ cao, thân bầu, men ngọc xanh lam phủ đều, hoa văn sen khắc chìm.'
    },
    {
      id: 4,
      name: 'Kiếm thời Lê',
      era: 'Thế kỷ XV',
      material: 'Sắt rèn',
      venue: 3,
      seed: 'kiemthole',
      views: '418',
      summary: 'Thanh kiếm rèn thủ công thời Hậu Lê.',
      desc: 'Thanh kiếm rèn thủ công thời Hậu Lê, gắn với những trang sử oai hùng chống ngoại xâm. Lưỡi kiếm khắc hoa văn rồng cuộn tinh tế.',
      shape: 'Lưỡi thẳng dài, chuôi bọc đồng chạm rồng, vỏ gỗ sơn then.'
    },
    {
      id: 5,
      name: 'Tranh Đông Hồ',
      era: 'Thế kỷ XIX',
      material: 'Giấy điệp',
      venue: 2,
      seed: 'tranhdongho',
      views: '991',
      summary: 'Dòng tranh dân gian in từ ván khắc gỗ.',
      desc: 'Dòng tranh dân gian in từ ván khắc gỗ trên giấy điệp, màu lấy từ thiên nhiên. Mỗi bức tranh gửi gắm ước vọng về cuộc sống ấm no, hạnh phúc.',
      shape: 'Tranh giấy hình chữ nhật, nền điệp óng ánh, màu đỏ vang, vàng hoè, xanh chàm.'
    },
    {
      id: 6,
      name: 'Tượng Phật A Di Đà',
      era: 'Thế kỷ XI',
      material: 'Đá sa thạch',
      venue: 5,
      seed: 'tuongphat',
      views: '1.508',
      summary: 'Kiệt tác điêu khắc thời Lý tại chùa Phật Tích.',
      desc: 'Kiệt tác điêu khắc thời Lý tại chùa Phật Tích, thể hiện sự an nhiên với từng nếp áo cà sa mềm mại tạc trên đá — đỉnh cao mỹ thuật Phật giáo Đại Việt.',
      shape: 'Tượng ngồi thiền trên đài sen, cao khoảng 1,8m, đá sa thạch xám.'
    },
    {
      id: 7,
      name: 'Cồng chiêng Tây Nguyên',
      era: 'Thế kỷ XX',
      material: 'Đồng',
      venue: 6,
      seed: 'congchieng',
      views: '1.102',
      summary: 'Di sản văn hóa phi vật thể được UNESCO công nhận.',
      desc: 'Không gian văn hóa cồng chiêng Tây Nguyên được UNESCO công nhận là Kiệt tác di sản truyền khẩu và phi vật thể của nhân loại.',
      shape: 'Bộ chiêng đồng tròn nhiều kích cỡ, mặt phẳng có núm hoặc không núm.'
    },
    {
      id: 8,
      name: 'Mũ quan triều Nguyễn',
      era: 'Thế kỷ XIX',
      material: 'Vàng, đá quý',
      venue: 3,
      seed: 'muquan',
      views: '736',
      summary: 'Mũ thượng triều của quan lại triều Nguyễn.',
      desc: 'Mũ thượng triều của quan lại triều Nguyễn, chế tác từ vàng và đá quý theo phẩm hàm — biểu trưng cho quyền uy và nghi lễ cung đình.',
      shape: 'Mũ cánh chuồn, khung kim loại mạ vàng, đính đá quý nhiều màu.'
    },
  ],

  // Màn 3 — bài viết nghiên cứu chuyên sâu (premium), khoá theo id hiện vật
  deepArticles: {
    1: {
      title: 'Trống đồng Đông Sơn: Bản giao hưởng đồng thau của văn minh Sông Hồng',
      abstract: 'Hơn hai nghìn năm trước, người Việt cổ đã đúc nên những chiếc trống đồng mà kỹ thuật và mỹ thuật của nó đến nay vẫn khiến giới khảo cổ học kinh ngạc. Trống đồng Ngọc Lũ — hiện vật tiêu biểu nhất — là một "bản đồ vũ trụ" thu nhỏ của cư dân nông nghiệp lúa nước.',
      readTime: '7 phút đọc',
      blocks: [
        {t: 'p', text: 'Trống đồng Đông Sơn không đơn thuần là một nhạc khí. Với người Lạc Việt, nó là biểu tượng quyền lực của thủ lĩnh, là vật thiêng trong nghi lễ cầu mưa, cầu mùa, và là chứng tích cho một nền văn minh bản địa rực rỡ phát triển độc lập ở lưu vực sông Hồng.'},
        {t: 'h', text: 'Đỉnh cao kỹ thuật luyện kim cổ'},
        {t: 'p', text: 'Để đúc một chiếc trống lớn liền khối, người thợ Đông Sơn phải làm chủ kỹ thuật khuôn ghép nhiều mang, pha hợp kim đồng – thiếc – chì theo tỷ lệ tính toán để vừa dễ rót vừa cho âm thanh vang. Đây là trình độ mà nhiều nền văn hóa cùng thời chưa đạt tới.'},
        {t: 'img', seed: 'trongdongb', cap: 'Mặt trống Ngọc Lũ với ngôi sao nhiều cánh ở trung tâm và các vành hoa văn đồng tâm.'},
        {t: 'spec', stitle: 'Thông số kỹ thuật', items: [
          {k: 'Hiện vật tiêu biểu', v: 'Trống đồng Ngọc Lũ'},
          {k: 'Đường kính mặt', v: '79,3 cm'},
          {k: 'Đường kính chân', v: '80 cm'},
          {k: 'Chiều cao', v: '63 cm'},
          {k: 'Niên đại', v: 'Cách nay ~2.500–2.000 năm'},
          {k: 'Chất liệu', v: 'Hợp kim đồng thau'},
          {k: 'Xếp hạng', v: 'Bảo vật Quốc gia (đợt 1, 2012)'},
        ]},
        {t: 'h', text: 'Một thế giới khắc trên mặt trống'},
        {t: 'p', text: 'Chính giữa mặt trống là ngôi sao nhiều cánh tượng trưng cho mặt trời — tín ngưỡng thờ thần Mặt Trời của cư dân nông nghiệp. Bao quanh là các vành hoa văn khắc chim Lạc bay, cảnh giã gạo, nhà sàn mái cong, đoàn người hóa trang lông chim nhảy múa: một bức tranh sống động về đời sống vật chất và tinh thần thời dựng nước.'},
        {t: 'quote', text: 'Trống đồng Đông Sơn là pho "sử bằng hình" của người Việt cổ — mỗi vành hoa văn là một trang ghi lại tín ngưỡng, lao động và lễ hội của tổ tiên.', who: 'PGS.TS Khảo cổ học, Viện Khảo cổ học Việt Nam'},
        {t: 'p', text: 'Trống được phát hiện năm 1893 khi đắp đê ở Hà Nam, sau thờ tại đình làng Ngọc Lũ và nay là hiện vật trung tâm của Bảo tàng Lịch sử Quốc gia — đại diện loại hình tiêu biểu nhất của văn hóa Đông Sơn trong khu vực Đông Nam Á.'},
      ],
      author: 'TS. Nguyễn Việt',
      role: 'Trung tâm Tiền sử Đông Nam Á',
    },
    2: {
      title: 'Áo tứ thân: Bốn tà áo và triết lý "tứ thân phụ mẫu"',
      abstract: 'Trang phục của người phụ nữ Bắc Bộ xưa không chỉ đẹp ở dáng vẻ duyên dáng mà còn gói trong từng đường may một quan niệm sống về gia đình, đạo hiếu và sự khiêm nhường.',
      readTime: '5 phút đọc',
      blocks: [
        {t: 'p', text: 'Áo tứ thân là trang phục thường nhật và lễ hội của phụ nữ đồng bằng Bắc Bộ từ khoảng thế kỷ XVII–XVIII đến đầu thế kỷ XX. Tên gọi "tứ thân" chỉ bốn vạt áo — hai vạt trước, hai vạt sau — được người xưa gắn với hình ảnh tứ thân phụ mẫu (cha mẹ hai bên).'},
        {t: 'h', text: 'Cấu trúc và cách mặc'},
        {t: 'p', text: 'Áo gồm hai vạt sau may liền sống lưng, hai vạt trước để buông hoặc buộc lại; bên trong mặc yếm đào, thắt lưng bao, đầu vấn khăn mỏ quạ, chân đi guốc mộc. Cách buộc hai vạt trước vừa gọn gàng khi lao động vừa tạo nên dáng thắt eo mềm mại.'},
        {t: 'img', seed: 'aotuthanb', cap: 'Bộ áo tứ thân đi cùng yếm, thắt lưng bao và khăn mỏ quạ.'},
        {t: 'spec', stitle: 'Đặc điểm trang phục', items: [
          {k: 'Niên đại phổ biến', v: 'Thế kỷ XVIII – đầu XX'},
          {k: 'Chất liệu', v: 'Lụa, the, sồi nhuộm nâu'},
          {k: 'Số vạt áo', v: 'Bốn (tứ thân)'},
          {k: 'Phụ kiện', v: 'Yếm đào, thắt lưng bao, khăn mỏ quạ'},
          {k: 'Vùng phổ biến', v: 'Đồng bằng Bắc Bộ'},
        ]},
        {t: 'quote', text: 'Mỗi chi tiết của áo tứ thân đều mang ý nghĩa: bốn vạt áo nhắc người phụ nữ nhớ công ơn cha mẹ đôi bên, màu nâu non thể hiện nếp sống mộc mạc, tảo tần.', who: 'Nhà nghiên cứu trang phục cổ truyền'},
        {t: 'p', text: 'Ngày nay áo tứ thân chủ yếu xuất hiện trong hát quan họ, lễ hội và biểu diễn nghệ thuật, trở thành một biểu tượng thị giác đậm chất Bắc Bộ của văn hóa Việt.'},
      ],
      author: 'ThS. Trần Thị Lan',
      role: 'Bảo tàng Mỹ thuật Việt Nam',
    },
    3: {
      title: 'Gốm men ngọc thời Lý: Vẻ thanh nhã của một vương triều Phật giáo',
      abstract: 'Lớp men xanh trong như ngọc và những đường khắc hoa sen mềm mại đã đưa gốm thời Lý lên hàng kiệt tác, phản chiếu tinh thần thẩm mỹ tao nhã của Đại Việt thế kỷ XI–XIII.',
      readTime: '6 phút đọc',
      blocks: [
        {t: 'p', text: 'Dưới triều Lý, nghệ thuật gốm Đại Việt bước vào thời kỳ rực rỡ. Các lò gốm sản xuất đồ men ngọc, men trắng ngà và hoa nâu phục vụ cung đình và chùa tháp, với hình dáng cân đối và hoa văn lấy cảm hứng từ Phật giáo.'},
        {t: 'h', text: 'Bí ẩn của lớp men ngọc'},
        {t: 'p', text: 'Men ngọc (celadon) có sắc xanh lục nhạt đặc trưng, đạt được nhờ một lượng nhỏ ôxit sắt nung trong môi trường khử ở nhiệt độ cao. Sự đồng đều của lớp men trên xương gốm mịn cho thấy người thợ thời Lý đã kiểm soát rất tốt nhiệt độ và không khí trong lò.'},
        {t: 'img', seed: 'binhgomlyb', cap: 'Bình gốm men ngọc thời Lý với hoa văn sen khắc chìm dưới lớp men.'},
        {t: 'spec', stitle: 'Đặc điểm hiện vật', items: [
          {k: 'Niên đại', v: 'Thế kỷ XI (thời Lý)'},
          {k: 'Dòng men', v: 'Men ngọc (celadon)'},
          {k: 'Kỹ thuật trang trí', v: 'Khắc chìm, in khuôn'},
          {k: 'Mô-típ chủ đạo', v: 'Hoa sen, cánh sen, dây leo'},
          {k: 'Chất liệu xương', v: 'Đất sét trắng mịn'},
        ]},
        {t: 'quote', text: 'Hoa sen trên gốm Lý không chỉ là trang trí mà là biểu tượng nhà Phật — sự thanh khiết vươn lên từ bùn lầy, đúng tinh thần của một vương triều sùng đạo.', who: 'Chuyên gia gốm cổ, Bảo tàng Lịch sử Quốc gia'},
        {t: 'p', text: 'Gốm men ngọc thời Lý được xem là một trong những đỉnh cao của gốm Việt Nam, đặt nền móng cho truyền thống gốm Đại Việt phát triển liên tục các thế kỷ sau.'},
      ],
      author: 'TS. Bùi Minh Trí',
      role: 'Viện Nghiên cứu Kinh thành',
    },
    4: {
      title: 'Kiếm thời Lê: Vũ khí, biểu tượng và huyền thoại gươm thần',
      abstract: 'Từ những lò rèn thời Hậu Lê, thanh kiếm vừa là binh khí thực dụng vừa trở thành biểu tượng chính nghĩa, gắn với truyền thuyết Lê Lợi trả gươm nơi hồ Hoàn Kiếm.',
      readTime: '5 phút đọc',
      blocks: [
        {t: 'p', text: 'Thế kỷ XV gắn với cuộc khởi nghĩa Lam Sơn và sự thành lập triều Hậu Lê. Vũ khí thời kỳ này — đặc biệt là kiếm — phản ánh trình độ rèn sắt và quan niệm về chính nghĩa của người Việt trong cuộc kháng chiến chống Minh.'},
        {t: 'h', text: 'Nghề rèn và nghệ thuật trang trí'},
        {t: 'p', text: 'Lưỡi kiếm được rèn từ sắt qua nhiều lần gập – nung – đập để khử tạp chất, tạo độ dẻo và sắc. Chuôi và bao kiếm của tầng lớp quý tộc thường bọc đồng, chạm hình rồng cuộn, sơn then đen bóng — thể hiện vị thế người sở hữu.'},
        {t: 'img', seed: 'kiemtholeb', cap: 'Chuôi kiếm bọc đồng chạm rồng, đặc trưng nghệ thuật trang trí thời Lê.'},
        {t: 'spec', stitle: 'Thông số hiện vật', items: [
          {k: 'Niên đại', v: 'Thế kỷ XV (Hậu Lê)'},
          {k: 'Chất liệu lưỡi', v: 'Sắt rèn thủ công'},
          {k: 'Trang trí chuôi', v: 'Bọc đồng, chạm rồng'},
          {k: 'Bao kiếm', v: 'Gỗ sơn then'},
          {k: 'Bối cảnh', v: 'Khởi nghĩa Lam Sơn'},
        ]},
        {t: 'quote', text: 'Truyền thuyết Lê Lợi trả gươm cho Rùa Vàng đã nâng thanh kiếm thời Lê từ một binh khí thành biểu tượng văn hóa: chính nghĩa thắng bạo tàn, và hòa bình được trả lại cho dân tộc.', who: 'Nhà nghiên cứu lịch sử quân sự'},
        {t: 'p', text: 'Chính vì lớp huyền thoại ấy mà kiếm thời Lê vượt khỏi giá trị một hiện vật khảo cổ, trở thành một phần ký ức cộng đồng gắn với hồ Hoàn Kiếm giữa lòng Hà Nội.'},
      ],
      author: 'TS. Đỗ Danh Huấn',
      role: 'Viện Sử học Việt Nam',
    },
    5: {
      title: 'Tranh Đông Hồ: Sắc màu thiên nhiên trên giấy điệp',
      abstract: 'Dòng tranh dân gian làng Đông Hồ in từ ván khắc gỗ, dùng màu lấy từ cây cỏ và vỏ sò điệp, gửi gắm những ước vọng bình dị về no ấm và hạnh phúc.',
      readTime: '6 phút đọc',
      blocks: [
        {t: 'p', text: 'Tranh Đông Hồ ra đời ở làng Đông Hồ (Thuận Thành, Bắc Ninh), từng là thú chơi không thể thiếu mỗi dịp Tết của người dân Bắc Bộ. Mỗi bức tranh là một lời chúc: đàn gà, đàn lợn cho sung túc; cá chép, vinh hoa cho con cái đỗ đạt.'},
        {t: 'h', text: 'Giấy điệp và màu từ thiên nhiên'},
        {t: 'p', text: 'Nét độc đáo nằm ở chất liệu: giấy dó được quét lớp hồ trộn bột vỏ sò điệp nghiền mịn, tạo nền óng ánh gọi là giấy điệp. Màu in hoàn toàn từ thiên nhiên — đỏ son từ sỏi, vàng từ hoa hòe, xanh từ lá chàm, đen từ than lá tre, trắng từ vỏ điệp.'},
        {t: 'img', seed: 'tranhdonghob', cap: 'Bản in tranh Đông Hồ trên nền giấy điệp óng ánh, mỗi màu một bản khắc.'},
        {t: 'spec', stitle: 'Kỹ thuật chế tác', items: [
          {k: 'Làng nghề', v: 'Đông Hồ, Thuận Thành, Bắc Ninh'},
          {k: 'Niên đại dòng tranh', v: 'Khoảng thế kỷ XVII–XIX'},
          {k: 'Chất liệu nền', v: 'Giấy dó quét điệp'},
          {k: 'Kỹ thuật in', v: 'Ván khắc gỗ, mỗi màu một bản'},
          {k: 'Bảng màu', v: 'Son, hoa hòe, lá chàm, than tre, vỏ điệp'},
        ]},
        {t: 'quote', text: 'Tranh Đông Hồ là tiếng nói thẩm mỹ của người nông dân: mộc mạc, lạc quan, và thấm đẫm ước mơ về một cuộc sống đủ đầy.', who: 'Nghệ nhân làng tranh Đông Hồ'},
        {t: 'p', text: 'Trước nguy cơ mai một, nghề làm tranh Đông Hồ đã được đưa vào danh mục di sản văn hóa phi vật thể cần bảo vệ và đang được lập hồ sơ trình UNESCO ghi danh.'},
      ],
      author: 'ThS. Nguyễn Thị Thu Hòa',
      role: 'Nhà nghiên cứu tranh dân gian',
    },
    6: {
      title: 'Tượng Phật A Di Đà chùa Phật Tích: Kiệt tác điêu khắc thời Lý',
      abstract: 'Pho tượng đá thời Lý ở chùa Phật Tích là tượng Phật bằng đá lớn và nguyên vẹn nhất còn lại từ thế kỷ XI — đỉnh cao của mỹ thuật Phật giáo Đại Việt.',
      readTime: '7 phút đọc',
      blocks: [
        {t: 'p', text: 'Theo văn bia Vạn Phúc thiền tự, năm 1057 vua Lý cho dựng chùa và tháp trên núi Lạn Kha (Phật Tích, Bắc Ninh), tôn trí một pho tượng Phật lớn. Đó chính là tượng A Di Đà ngồi thiền mà ngày nay được công nhận là Bảo vật Quốc gia.'},
        {t: 'h', text: 'Vẻ đẹp của sự an nhiên'},
        {t: 'p', text: 'Tượng tạc Đức Phật ngồi kiết già trên tòa sen, hai tay kết ấn thiền định. Gương mặt phúc hậu, mắt khép hờ, nếp áo cà sa buông mềm như lụa tạc trên đá — diễn tả trạng thái tĩnh tại tuyệt đối, đặc trưng cho phong cách điêu khắc tinh tế thời Lý.'},
        {t: 'img', seed: 'tuongphatb', cap: 'Tượng A Di Đà ngồi thiền trên tòa sen, các nếp áo mềm mại tạc trên đá sa thạch.'},
        {t: 'spec', stitle: 'Thông số hiện vật', items: [
          {k: 'Niên đại', v: 'Năm 1057 (thời Lý)'},
          {k: 'Chiều cao tượng', v: '≈ 1,86 m'},
          {k: 'Cao cả bệ', v: '≈ 2,69–2,77 m'},
          {k: 'Chất liệu', v: 'Đá, nguyên thếp vàng'},
          {k: 'Vị trí', v: 'Chùa Phật Tích, Bắc Ninh'},
          {k: 'Xếp hạng', v: 'Bảo vật Quốc gia (2013)'},
        ]},
        {t: 'quote', text: 'Đây là pho tượng Phật bằng đá lớn nhất và nguyên vẹn nhất còn lại từ thời Lý — một chuẩn mực của nghệ thuật tạo tượng Đại Việt mà các thời sau noi theo.', who: 'Chuyên gia mỹ thuật cổ, Cục Di sản Văn hóa'},
        {t: 'p', text: 'Lớp vàng thếp bên ngoài đã mất theo binh lửa và thời gian, chỉ còn lõi đá; nhưng vẻ đẹp tạo hình thì vẫn vẹn nguyên, là niềm tự hào của nghệ thuật điêu khắc Phật giáo Việt Nam.'},
      ],
      author: 'PGS.TS Trần Lâm Biền',
      role: 'Nhà nghiên cứu mỹ thuật Phật giáo',
    },
    7: {
      title: 'Cồng chiêng Tây Nguyên: Tiếng vọng của đại ngàn',
      abstract: 'Không gian văn hóa cồng chiêng Tây Nguyên đã được UNESCO ghi danh là Kiệt tác truyền khẩu và di sản phi vật thể của nhân loại — nơi mỗi tiếng chiêng là một sợi dây nối con người với thần linh.',
      readTime: '6 phút đọc',
      blocks: [
        {t: 'p', text: 'Với các dân tộc Tây Nguyên, cồng chiêng không chỉ là nhạc cụ mà là vật thiêng, là tiếng nói giao tiếp với thần linh (Yàng). Tiếng chiêng hiện diện trong suốt vòng đời con người: lễ thổi tai cho trẻ sơ sinh, mừng lúa mới, mừng nhà rông, cho đến lễ bỏ mả.'},
        {t: 'h', text: 'Một dàn nhạc của cộng đồng'},
        {t: 'p', text: 'Mỗi bộ chiêng gồm nhiều chiếc to nhỏ khác nhau, mỗi người giữ một chiếc đánh một nốt; chỉ khi cả cộng đồng cùng tấu, giai điệu mới hoàn chỉnh. Cách diễn tấu ấy phản ánh tinh thần cố kết cộng đồng đặc trưng của xã hội Tây Nguyên.'},
        {t: 'img', seed: 'congchiengb', cap: 'Dàn cồng chiêng nhiều kích cỡ được tấu trong lễ hội bên nhà rông.'},
        {t: 'spec', stitle: 'Hồ sơ di sản', items: [
          {k: 'Loại hình', v: 'Di sản văn hóa phi vật thể'},
          {k: 'UNESCO ghi danh', v: '25/11/2005'},
          {k: 'Phạm vi', v: '5 tỉnh Tây Nguyên'},
          {k: 'Chất liệu chiêng', v: 'Hợp kim đồng'},
          {k: 'Chức năng', v: 'Nghi lễ, lễ hội cộng đồng'},
        ]},
        {t: 'quote', text: 'Cồng chiêng là ngôn ngữ thiêng của Tây Nguyên. Mất tiếng chiêng là mất đi sợi dây nối giữa con người, tổ tiên và thần linh.', who: 'Nhà nghiên cứu văn hóa dân gian Tây Nguyên'},
        {t: 'p', text: 'Sau Nhã nhạc cung đình Huế, đây là di sản thứ hai của Việt Nam được UNESCO vinh danh, và năm 2008 được chuyển sang Danh sách di sản văn hóa phi vật thể đại diện của nhân loại.'},
      ],
      author: 'TS. Tô Đông Hải',
      role: 'Viện Văn hóa Nghệ thuật Việt Nam',
    },
    8: {
      title: 'Mũ quan triều Nguyễn: Phẩm phục và trật tự cung đình',
      abstract: 'Chiếc mũ thượng triều bằng vàng và đá quý không chỉ là trang sức mà là dấu hiệu phân định phẩm hàm, thể hiện cả một hệ thống nghi lễ và quyền lực của triều đại quân chủ cuối cùng ở Việt Nam.',
      readTime: '5 phút đọc',
      blocks: [
        {t: 'p', text: 'Dưới triều Nguyễn (1802–1945), trang phục và mũ mão của quan lại được quy định chặt chẽ theo phẩm hàm. Mỗi loại mũ — cánh chuồn, kim khôi, phốc đầu — gắn với một dịp lễ và một cấp bậc nhất định trong bộ máy triều đình.'},
        {t: 'h', text: 'Vàng, đá quý và phẩm hàm'},
        {t: 'p', text: 'Mũ của các quan đại thần được chế tác công phu: khung kim loại mạ vàng, đính trân châu và đá quý nhiều màu, gắn các hoa văn rồng, mây, hoa lá bằng vàng. Số lượng và loại trang sức trên mũ phản ánh trực tiếp phẩm trật của người đội.'},
        {t: 'img', seed: 'muquanb', cap: 'Mũ quan triều Nguyễn với khung mạ vàng và đá quý gắn theo phẩm hàm.'},
        {t: 'spec', stitle: 'Đặc điểm hiện vật', items: [
          {k: 'Niên đại', v: 'Thế kỷ XIX (triều Nguyễn)'},
          {k: 'Chất liệu', v: 'Vàng, kim loại mạ, đá quý'},
          {k: 'Kiểu dáng', v: 'Mũ cánh chuồn'},
          {k: 'Công năng', v: 'Phẩm phục thượng triều'},
          {k: 'Ý nghĩa', v: 'Biểu trưng phẩm hàm, nghi lễ'},
        ]},
        {t: 'quote', text: 'Trong xã hội quân chủ, một chiếc mũ không bao giờ chỉ là chiếc mũ — nó là tấm "thẻ căn cước" về địa vị, là thứ ngôn ngữ thị giác của trật tự cung đình.', who: 'Chuyên gia cổ vật cung đình Huế'},
        {t: 'p', text: 'Những chiếc mũ quan còn lại đến nay là tư liệu quý để nghiên cứu nghề kim hoàn, mỹ thuật trang trí và hệ thống quan chế của triều Nguyễn.'},
      ],
      author: 'TS. Phan Thanh Hải',
      role: 'Trung tâm Bảo tồn Di tích Cố đô Huế',
    },
  },

  guestbook: [
    {
      id: 1,
      text: 'Được nhìn tận mắt trống đồng thật — xúc động lắm 🇻🇳',
      author: 'Minh Anh',
      likes: 47,
      time: '2 giờ trước',
      premium: false
    },
    {
      id: 2,
      text: 'Cảm ơn V-Heritage đã giúp mình hiểu rõ hơn về lịch sử dân tộc',
      author: 'Tuấn',
      likes: 23,
      time: '1 ngày trước',
      premium: false
    },
    {
      id: 3,
      text: 'Incredible piece of history! AR made it come alive.',
      author: 'Sarah K.',
      likes: 18,
      time: '3 ngày trước',
      premium: false
    },
  ],

  achievements: [
    {
      id: 1,
      name: 'Người khám phá Thăng Long',
      icon: 'ti-building-castle',
      earned: true,
      blurb: 'Dấu chân đầu tiên giữa lòng Hà Nội ngàn năm.',
      cond: 'Thăm 3 bảo tàng tại Hà Nội',
      progress: 3,
      target: 3,
      date: '12/03/2026'
    },
    {
      id: 2,
      name: 'Lữ khách Hội An',
      icon: 'ti-lamp',
      earned: true,
      blurb: 'Lang thang phố Hội, chạm vào từng lớp thời gian.',
      cond: 'Scan 10 hiện vật tại Phố cổ Hội An',
      progress: 10,
      target: 10,
      date: '28/04/2026'
    },
    {
      id: 3,
      name: 'Nhà sử học Huế',
      icon: 'ti-book',
      earned: false,
      blurb: 'Lắng nghe triều Nguyễn kể chuyện cố đô.',
      cond: 'Nghe đủ 5 audio guide về triều Nguyễn',
      progress: 2,
      target: 5
    },
    {
      id: 4,
      name: 'Người giữ lửa',
      icon: 'ti-flame',
      earned: false,
      blurb: 'Để lại dấu ấn tại những nơi lịch sử đi qua.',
      cond: 'Đăng 10 lời nhắn AR Guestbook',
      progress: 4,
      target: 10
    },
    {
      id: 5,
      name: 'Nhà thám hiểm số',
      icon: 'ti-camera',
      earned: false,
      blurb: 'Bậc thầy nhận diện hiện vật bằng AR.',
      cond: 'Scan thành công 50 hiện vật bất kỳ',
      progress: 23,
      target: 50
    },
    {
      id: 6,
      name: 'Người bảo tồn',
      icon: 'ti-shield-heart',
      earned: false,
      blurb: 'Xây dựng kho tàng di sản của riêng bạn.',
      cond: 'Tạo 5 bộ sưu tập riêng',
      progress: 1,
      target: 5
    },
  ],

  articles: [
    {
      id: 1,
      seed: 'trongdong',
      tag: 'Lịch sử',
      title: 'Bí ẩn hoa văn trên trống đồng Đông Sơn',
      read: '5 phút đọc',
      date: '20/06',
      author: 'TS. Nguyễn Văn Huy',
      body: ['Trống đồng Đông Sơn là đỉnh cao của nghệ thuật đúc đồng Việt Nam cách đây hơn 2.500 năm. Mỗi hoa văn trên mặt trống đều mang ý nghĩa biểu tượng sâu sắc về vũ trụ quan và đời sống của người Việt cổ.', 'Ngôi sao nhiều cánh ở trung tâm tượng trưng cho mặt trời — vị thần tối cao trong tín ngưỡng nông nghiệp. Vòng quanh là hình ảnh chim Lạc bay ngược chiều kim đồng hồ, biểu trưng cho khát vọng tự do và cội nguồn dân tộc.', 'Những vành hoa văn hình học đồng tâm thể hiện trình độ toán học và thẩm mỹ tinh tế của cư dân Lạc Việt, đến nay vẫn khiến giới khảo cổ kinh ngạc.']
    },
    {
      id: 2,
      seed: 'hoian',
      tag: 'Kiến trúc',
      title: 'Chùa Cầu Hội An — nơi giao thoa ba nền văn hóa',
      read: '4 phút đọc',
      date: '18/06',
      author: 'KTS. Lê Thành Vinh',
      body: ['Chùa Cầu (Lai Viễn Kiều) là biểu tượng của phố cổ Hội An, được thương nhân Nhật Bản xây dựng vào đầu thế kỷ 17.', 'Công trình kết hợp hài hòa kiến trúc Nhật, Hoa và Việt: mái ngói âm dương kiểu Việt, kết cấu gỗ kiểu Nhật, và các chi tiết trang trí mang đậm phong cách Hoa.', 'Trải qua hơn 400 năm, Chùa Cầu vẫn đứng vững như chứng nhân cho thời kỳ Hội An là thương cảng quốc tế sầm uất bậc nhất Đông Nam Á.']
    },
    {
      id: 3,
      seed: 'hue',
      tag: 'Triều Nguyễn',
      title: 'Nhã nhạc cung đình Huế — âm thanh của vương triều',
      read: '6 phút đọc',
      date: '15/06',
      author: 'GS. Trần Văn Khê',
      body: ['Nhã nhạc cung đình Huế là loại hình âm nhạc bác học từng vang lên trong các đại lễ của triều Nguyễn, được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại năm 2003.', 'Dàn nhạc gồm nhiều nhạc cụ truyền thống: đàn nguyệt, đàn tỳ bà, sáo, trống và chuông, hòa quyện tạo nên âm hưởng trang nghiêm và tinh tế.', 'Ngày nay, nhã nhạc được biểu diễn tại Đại Nội Huế, đưa du khách trở về không gian uy nghi của hoàng cung xưa.']
    },
  ],

  destinations: [
    {name: 'Hoàng thành Thăng Long', city: 'Hà Nội', rating: '4.9', seed: 'thanglong', venueId: 11},
    {name: 'Phố cổ Hội An', city: 'Quảng Nam', rating: '4.9', seed: 'phocohoian', venueId: 6},
    {name: 'Quần thể di tích Cố đô Huế', city: 'Thừa Thiên Huế', rating: '4.8', seed: 'codohue', venueId: 12},
    {name: 'Thánh địa Mỹ Sơn', city: 'Quảng Nam', rating: '4.7', seed: 'myson', venueId: 13},
    {name: 'Vịnh Hạ Long', city: 'Quảng Ninh', rating: '4.8', seed: 'halong', venueId: 14},
    {name: 'Thành nhà Hồ', city: 'Thanh Hóa', rating: '4.6', seed: 'thanhnhaho', venueId: 15},
    {name: 'Văn Miếu Quốc Tử Giám', city: 'Hà Nội', rating: '4.7', seed: 'vanmieu', venueId: 16},
    {name: 'Địa đạo Củ Chi', city: 'TP.HCM', rating: '4.6', seed: 'cuchi', venueId: 17},
    {name: 'Cố đô Hoa Lư', city: 'Ninh Bình', rating: '4.5', seed: 'hoalu', venueId: 18},
    {name: 'Dinh Độc Lập', city: 'TP.HCM', rating: '4.5', seed: 'dinhdoclap', venueId: 3},
  ],

  // Di tích cho "Top 10 điểm đến" — chỉ dùng cho màn chi tiết, KHÔNG lên bản đồ Khám phá
  destVenues: [
    {id: 11, name: 'Hoàng thành Thăng Long', city: 'Hà Nội', seed: 'thanglong', dist: 'Cách 3,4 km', count: 18, x: '50%', y: '50%', wheelchair: true, floor: 'Lối phẳng'},
    {id: 12, name: 'Quần thể di tích Cố đô Huế', city: 'Thừa Thiên Huế', seed: 'codohue', dist: 'Cách 660 km', count: 42, x: '50%', y: '50%', wheelchair: true, floor: 'Lối phẳng, có dốc nhẹ'},
    {id: 13, name: 'Thánh địa Mỹ Sơn', city: 'Quảng Nam', seed: 'myson', dist: 'Cách 720 km', count: 24, x: '50%', y: '50%', wheelchair: false, floor: 'Đường đá, có bậc'},
    {id: 14, name: 'Vịnh Hạ Long', city: 'Quảng Ninh', seed: 'halong', dist: 'Cách 160 km', count: 12, x: '50%', y: '50%', wheelchair: false, floor: 'Lên tàu, có bậc'},
    {id: 15, name: 'Thành nhà Hồ', city: 'Thanh Hóa', seed: 'thanhnhaho', dist: 'Cách 150 km', count: 9, x: '50%', y: '50%', wheelchair: true, floor: 'Lối phẳng'},
    {id: 16, name: 'Văn Miếu Quốc Tử Giám', city: 'Hà Nội', seed: 'vanmieu', dist: 'Cách 2,1 km', count: 15, x: '50%', y: '50%', wheelchair: true, floor: 'Lối phẳng, có bậc tam quan'},
    {id: 17, name: 'Địa đạo Củ Chi', city: 'TP.HCM', seed: 'cuchi', dist: 'Cách 70 km', count: 11, x: '50%', y: '50%', wheelchair: false, floor: 'Hầm hẹp, có bậc'},
    {id: 18, name: 'Cố đô Hoa Lư', city: 'Ninh Bình', seed: 'hoalu', dist: 'Cách 95 km', count: 14, x: '50%', y: '50%', wheelchair: true, floor: 'Lối phẳng'},
  ],

  audioLyrics: [
    {p: 0, text: 'Trống đồng Đông Sơn — kiệt tác của nền văn minh sông Hồng.'},
    {p: 9, text: 'Được đúc cách đây hơn 2.500 năm bằng kỹ thuật khuôn sáp tinh xảo.'},
    {p: 20, text: 'Mặt trống là ngôi sao nhiều cánh — biểu tượng của thần Mặt Trời.'},
    {p: 32, text: 'Quanh ngôi sao là đàn chim Lạc tung cánh, cội nguồn dân tộc Việt.'},
    {p: 45, text: 'Thân trống khắc cảnh giã gạo, đua thuyền, lễ hội mùa màng.'},
    {p: 58, text: 'Mỗi đường nét phản ánh đời sống nông nghiệp lúa nước trù phú.'},
    {p: 70, text: 'Tiếng trống từng vang trong các nghi lễ cầu mưa thuận gió hòa.'},
    {p: 82, text: 'Đến nay, trống đồng vẫn là niềm tự hào của văn hóa Việt Nam.'},
    {p: 93, text: 'Một di sản nối liền quá khứ và hiện tại, vọng mãi ngàn năm.'},
  ],

  NOTIF_SEED: [
    {
      id: 'n1',
      icon: 'ti-building-bank',
      color: 'var(--primary)',
      title: 'Bảo tàng Lịch sử Quốc gia vừa thêm 12 hiện vật mới về Triều Lý',
      sub: 'Bạn đã đăng ký quan tâm · 30 phút trước',
      read: false
    },
    {
      id: 'n2',
      icon: 'ti-heart',
      color: 'var(--error)',
      title: 'Minh Anh vừa thả tim lời nhắn AR Guestbook của bạn tại Trống đồng Đông Sơn',
      sub: '2 giờ trước',
      read: false
    },
    {
      id: 'n3',
      icon: 'ti-award',
      color: 'var(--cta)',
      title: 'Bạn vừa đạt huy hiệu Lữ khách Hội An — xem thành tích?',
      sub: '1 ngày trước',
      read: false
    },
    {
      id: 'n4',
      icon: 'ti-download',
      color: 'var(--success)',
      title: 'Gói dữ liệu Bảo tàng Mỹ thuật đã tải xong',
      sub: '1 ngày trước',
      read: true
    },
    {
      id: 'n5',
      icon: 'ti-shield-lock',
      color: 'var(--warning)',
      title: 'Đăng nhập mới từ Chrome trên Windows — không phải bạn?',
      sub: '2 ngày trước',
      read: true
    },
    {
      id: 'n6',
      icon: 'ti-ticket',
      color: 'var(--info)',
      title: 'Triển lãm đặc biệt: Hành trình gốm Việt — chỉ còn 3 ngày',
      sub: '3 ngày trước',
      read: true
    },
  ],

  devices: [
    {id: 'd1', name: 'iPhone 14 Pro', icon: 'ti-device-mobile', meta: 'Hà Nội · Đang hoạt động', current: true},
    {id: 'd2', name: 'iPad Air', icon: 'ti-device-ipad', meta: 'Hà Nội · 2 ngày trước', current: false},
    {
      id: 'd3',
      name: 'Chrome · Windows',
      icon: 'ti-device-desktop',
      meta: 'TP.HCM · 2 ngày trước · Thiết bị lạ',
      current: false
    },
  ],

  i18n: {
    vi: {
      home: 'Trang chủ',
      explore: 'Khám phá',
      library: 'Thư viện',
      profile: 'Hồ sơ',
      greet: 'Xin chào,',
      homeTitle: 'Khám phá di sản',
      homeSubtitle: 'Khám phá di sản hôm nay?',
      secDiscover: 'Đang chờ bạn khám phá',
      secFeatured: 'Di tích đặc sắc tuần này',
      secArt: 'Hiện vật nổi bật',
      offlineBanner: 'Chế độ offline — Đang dùng dữ liệu đã tải'
    },
    en: {
      home: 'Home',
      explore: 'Explore',
      library: 'Library',
      profile: 'Profile',
      greet: 'Hello,',
      homeTitle: 'Discover heritage',
      homeSubtitle: 'Explore heritage today?',
      secDiscover: 'Waiting to be discovered',
      secFeatured: 'Featured sites this week',
      secArt: 'Featured artifacts',
      offlineBanner: 'Offline mode — Using downloaded data'
    },
    cn: {
      home: '首页',
      explore: '探索',
      library: '收藏',
      profile: '我的',
      greet: '你好，',
      homeTitle: '探索文化遗产',
      homeSubtitle: '今天探索文化遗产吗？',
      secDiscover: '等待你的发现',
      secFeatured: '本周精选遗址',
      secArt: '精选文物',
      offlineBanner: '离线模式 — 使用已下载数据'
    },
  },

  walkSlides: [
    {icon: 'ti-sparkles', title: 'Mỗi hiện vật đều có câu chuyện chưa được kể. Bạn sẽ là người khám phá nó.'},
    {icon: 'ti-device-mobile', title: 'Giơ điện thoại lên. Lịch sử sẽ hiện ra trước mắt bạn.'},
    {icon: 'ti-headphones', title: 'Nghe di sản kể chuyện — bằng giọng nói của chính nó.'},
    {icon: 'ti-message-2-heart', title: 'Để lại dấu ấn của bạn tại những nơi lịch sử đã đi qua.'},
  ],

  langDefs: [
    {code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt'},
    {code: 'en', flag: '🇬🇧', name: 'English'},
    {code: 'cn', flag: '🇨🇳', name: '中文'},
  ],
};
