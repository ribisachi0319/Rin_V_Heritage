# AGENTS.md — Hướng dẫn cho coding agent làm việc trên V-Heritage

> Tài liệu này dành cho **bất kỳ AI coding agent nào** (Claude, Cursor, Copilot, Codex…) tiếp nhận dự án.
> Đọc hết phần **"0. Bắt buộc đọc trước"** trước khi sửa bất cứ thứ gì. Phần còn lại là tham khảo.
> (Quy tắc workflow/git nằm trong `CLAUDE.md` — file này bổ sung phần **kiến trúc & kỹ thuật**.)

---

## 0. Bắt buộc đọc trước (TL;DR)

1. **Đây là prototype buildless** — KHÔNG có bước build/bundle. Sửa file → lưu → reload trình duyệt là thấy ngay. Không có `npm install`, không có webpack/vite. Đừng thêm build step.
2. **App chính = `app.dc.html`** (chứa template 50+ màn hình + state). `index.html` chỉ redirect sang đó. Logic/data/render tách ra `src/vh-*.js`. `support.js` là runtime — **KHÔNG sửa**.
3. **Template KHÔNG được chứa JS logic.** Không ternary, không gọi hàm trong `{{ }}`. Mọi giá trị phải **tính sẵn** trong `src/vh-render.js` rồi đưa ra qua `{{ tênProp }}`. (Xem mục 4 & 5.)
4. **Git/commit (theo `CLAUDE.md`):** author `Rin <ribisachi0319@gmail.com>`, commit message **tiếng Việt** dạng `feat(scope): …` / `fix(scope): …`, **KHÔNG** thêm `Co-Authored-By`. **Luôn hỏi người dùng trước khi commit + push.**
5. **Verify trước khi xong:** chạy `node --check` cho mỗi file JS đã sửa, và kiểm **cân bằng tag** `sc-if`/`sc-for` + `<div>` trong `app.dc.html` (mục 9).
6. **Test trực quan:** chủ project (Rin) thường tự mở sản phẩm thật để soi. Có thể render headless để tự kiểm (mục 8) **nhưng tốn token** — chỉ dùng khi cần xác minh điều khó đoán, hoặc khi được yêu cầu.
7. Ngôn ngữ UI là **tiếng Việt**. Comment trong code cũng tiếng Việt.

---

## 1. Dự án là gì

**V-Heritage** — app prototype (demo bấm thử được) cho ứng dụng du lịch **di sản văn hóa Việt Nam**: khám phá bảo tàng/di tích, xem hiện vật bằng AR/mô hình 3D, audio guide, sưu tập, gói premium… Mục đích là bản mẫu UI/UX có tương tác đầy đủ để demo, **không phải app production** (state chỉ lưu trong phiên, reload là reset).

Người dùng chính là **Rin** — chưa quen code/git, cần agent xử lý giúp version/file/git và **luôn xác nhận trước khi push**.

---

## 2. Stack & cơ chế "buildless"

- **dc-runtime** (`support.js`): một runtime nhỏ render template `<x-dc>` bằng **React** (lấy từ CDN). Hỗ trợ directive `<sc-if>`, `<sc-for>`, và nội suy `{{ }}`.
- App được viết như **một component lớn** (`class Component extends DCLogic`) với `state` + rất nhiều method.
- **Vì sao tách file mà không cần build:**
  - **CSS** → `src/vh-styles.css`, nạp bằng `<link>` trong `<helmet>`.
  - **Data/logic/render** → 3 file `src/vh-*.js`, mỗi file set một biến global (`window.VH_DATA`, `window.VH_LOGIC`, `window.VH_RENDER`). Các `<script src>` này chạy **đồng bộ lúc parse** (nằm trong `<head>`, trước khi runtime eval block logic), nên biến global luôn sẵn sàng.
  - Block logic inline (`<script type="text/x-dc" data-dc-script>` cuối `app.dc.html`) định nghĩa `class Component`, rồi gộp tất cả:
    ```js
    Object.assign(Component.prototype, VH_DATA, VH_LOGIC, VH_RENDER);
    ```
- **Hệ quả quan trọng:** thứ nào **tham chiếu `this`** thì KHÔNG đặt được ở scope module của `vh-*.js` dưới dạng arrow/biến (sẽ bắt nhầm `this`). Phải để dạng **method** trên prototype (trong `VH_LOGIC`/`VH_RENDER`) hoặc **class field** trong block inline (vd `notifAction`, `state`).

---

## 3. Bản đồ file

```
index.html          # chỉ redirect → app.dc.html
app.dc.html         # ★ FILE CHÍNH: template 50+ màn hình + <helmet> + class Component + state (~4900 dòng)
support.js          # runtime dc-runtime — KHÔNG SỬA
serve.js            # server tĩnh để chạy local: `node serve.js` → http://localhost:8731
src/
  vh-data.js        # window.VH_DATA — dữ liệu seed thuần (venues, destVenues, artifacts, articles, i18n…), KHÔNG tham chiếu this
  vh-logic.js       # window.VH_LOGIC — toàn bộ method/action (nav, openArtifact, doLogin, recordVisit, fmtTime, toggleA11y…)
  vh-render.js      # window.VH_RENDER — renderVals() + các *Vals(): tính MỌI prop {{ }} cho template
  vh-styles.css     # biến CSS theme sáng/tối, animation, a11y
CLAUDE.md           # quy tắc workflow/git/version (đọc kèm file này)
legacy/             # các bản V-Heritage v*.dc.html cũ — tham khảo, KHÔNG động vào
screenshots/, uploads/   # tài nguyên phụ
devenv.nix/.lock    # môi trường nix (không bắt buộc dùng)
```

---

## 4. Template DSL (trong `app.dc.html`)

Đặt trong `<x-dc>…</x-dc>`. Cú pháp:

- **Nội suy:** `{{ propName }}` — lấy từ object mà `renderVals()` trả về. Dùng được trong text và trong giá trị thuộc tính/`style`.
- **Điều kiện:** `<sc-if value="{{ boolProp }}" hint-placeholder-val="{{ false }}"> … </sc-if>`
- **Lặp:** `<sc-for list="{{ arrayProp }}" as="x" hint-placeholder-count="4"> … {{ x.field }} … </sc-for>`
- **Sự kiện:** `onClick="{{ handlerProp }}"`, `onInput="{{ … }}"`, `onTouchStart`… — handler là **hàm** lấy từ render props.

### Luật vàng (vi phạm = lỗi khó chịu)
- ❌ KHÔNG logic trong `{{ }}`: không `{{ a ? b : c }}`, không `{{ foo() }}`, không `{{ a + b }}` phức tạp.
  ✅ Tính sẵn trong `vh-render.js`: `someColor: cond ? 'var(--cta)' : 'var(--border)'` → template chỉ `{{ someColor }}`.
- **`<sc-for>` cần `hint-placeholder-count`**, **`<sc-if>` nên có `hint-placeholder-val`** (gợi ý cho lúc render khung).
- **Key & ghosting:** runtime dùng React. Nếu một vùng đổi nội dung theo bước (vd walkthrough), đặt `key="prefix-{{ stepVar }}"` **có tiền tố chữ** — đừng để key là số trần (`{{ step }}` = "0","1") vì sẽ trùng key vị trí của các sibling và gây **chồng/ghosting** (phần tử cũ không bị gỡ).

---

## 5. Component model

```
class Component extends DCLogic {   // DCLogic từ support.js
  state = { … }                     // class field — toàn bộ state (xem app.dc.html ~4834)
  notifAction = { n1: () => this.… }// class field arrow (tham chiếu this) phải để ở đây, KHÔNG ở vh-*.js
}
Object.assign(Component.prototype, VH_DATA, VH_LOGIC, VH_RENDER);
```

- **Đổi/đọc state:** `this.setState({ … })` (merge nông), đọc `this.state.x`.
- **State chỉ tồn tại trong phiên** — reload là về mặc định (`screen: 'splash'`).
- **`renderVals()`** (vh-render.js) là nguồn của mọi `{{ }}`. Nó gộp nhiều nhóm:
  ```js
  renderVals() {
    return Object.assign({}, this.globalVals(), this.authVals(), this.mainVals(),
        this.placeVals?.(), this.arVals(), this.libVals(), this.profileVals(),
        this.settingsVals(), this.errorVals());
  }
  ```
  → **Muốn sửa/ thêm một giá trị `{{ x }}`:** tìm `x:` trong `vh-render.js` (thường trong nhóm tương ứng màn: `mainVals` cho Home/Explore/Place, `authVals` cho login/đăng ký, `profileVals`, `libVals`, `settingsVals`…). Thêm prop mới = thêm `key: value` vào object `return {}` của nhóm phù hợp.
- **Thêm hành động/điều hướng:** viết method trong `vh-logic.js` (hoặc handler arrow ngay trong render prop), rồi tham chiếu qua `onClick="{{ … }}"`.

### Điều hướng (vh-logic.js)
- `nav(screen, dir)` — push màn hiện tại vào history, set màn mới, đóng sheet/modal. `dir` = `'fwd'|'back'`.
- `back()` — pop history. `goTab(tab)` — chuyển tab chính (reset history). `replace(screen)`.
- Màn hiện tại = `this.state.screen`. Cờ `is<Tên>` (vd `isHome`, `isPlace`) do `globalVals` tính từ `screen` để bật `<sc-if>` tương ứng.

### Mở hiện vật — phân biệt "Màn 1" vs "Màn 2" (hay nhầm!)
- `openArtifact(id)` → màn **`artifact`** = **Màn 2** (trang chi tiết hiện vật).
- `openArtifactModel(id)` → màn **`threed`** = **Màn 1** (mô hình 3D/AR). Đây là màn người dùng muốn vào **trước**.
- `revealArtifact(id)` → vào Màn 1 sau khi quét QR/AR (thay scanner trong history).
- Cả ba đều gọi `recordVisit(id)` để ghi lịch sử tham quan. → Khi làm nút "mở hiện vật", chọn đúng hàm theo yêu cầu (mặc định thường là **Màn 1** `openArtifactModel`).

---

## 6. Mô hình dữ liệu (vh-data.js)

- **`venues`** (id 1–6): địa điểm chính, **có lên bản đồ Khám phá**. Field: `name, city, count (số hiện vật), seed (ảnh), dist, x/y (vị trí pin), wheelchair (bool), floor (mô tả lối đi)`.
- **`destVenues`** (id 11–18): địa điểm phụ, **không lên bản đồ**, cùng cấu trúc.
- `findVenue(id)` (vh-logic) tra cả hai mảng. `venueArtifacts(id)` lấy hiện vật của một venue.
- **`artifacts`**: hiện vật. Field: `id, name, era, material, venue, seed, views, summary, desc, shape`.
- **`destinations`**, **`articles`**, **`i18n`** (vi/en/cn)…
- **Ảnh** dùng `this.vimg(seed, w, h)` → ảnh placeholder theo seed (picsum) hoặc tài nguyên đã khai báo.
- **Loại hình địa điểm (badge "Bảo tàng/Khu di tích/…")** hiện đặt trong map `VTYPE` ở `mainVals()` (vh-render.js), không phải trong data — chỉnh ở đó nếu thêm địa điểm/loại mới.

---

## 7. Theme, CSS vars, trợ năng (a11y)

- Biến theme trong `vh-styles.css`, đổi qua `[data-theme="light|dark"]` trên `.vh-app`. Dùng `var(--…)` thay vì màu cứng:
  `--cta` (cam #ED8927), `--primary` (navy sáng / kem tối), `--bg-card/secondary/tertiary`, `--text-secondary/tertiary`, `--border`, `--border-2`, `--success`, `--error`, `--cream`, `--on-primary`…
- **a11y state:** `state.a11y = { visualLow, visualBlind, motor }` → áp qua `data-vlow/vblind/vmotor` trên `.vh-app`. `toggleA11y(key)`.
- **Phóng to (visualLow):** nội dung bọc trong `.vh-content`; bật trợ năng → `.vh-content { width:83.333%; transform: scale(1.2); transform-origin: top left }` (xem vh-styles.css). Dùng `transform` (không phải `zoom`) để hit-test chuẩn.

### ⚠️ Gotcha đã từng cắn: input trong flex row
Mọi `<input style="flex:1">` nằm trong hàng `display:flex` **PHẢI có `min-width:0`** (`flex:1;min-width:0;…`). Thiếu nó → input không co được dưới kích thước nội tại → cả hàng tràn phải, đẩy icon/nút (vd nút ẩn/hiện mật khẩu) **sát/ra ngoài mép phải** (rõ nhất khi bật trợ năng vì font to). Đã fix toàn bộ; khi thêm input mới nhớ kèm `min-width:0`.

---

## 8. Chạy & test trực quan

- **Chạy local:** `node serve.js` → mở `http://localhost:8731`. **Bắt buộc qua HTTP** (runtime dùng `fetch`; mở `file://` sẽ hỏng). Cần mạng để tải React + Tabler icons + Google Fonts từ CDN.
- **Khung máy cố định:** frame ngoài **412px**, `.vh-app` **390px** (KHÔNG co theo cửa sổ). Nếu cửa sổ/màn hình hẹp hơn 412px, mép phải bị cắt — đó là do mockup, không phải lỗi layout. Khi render headless để soi, đặt cửa sổ **≥ 460px**.
- **Render headless (Chrome) để tự kiểm — tốn token, dùng tiết kiệm:**
  ```bash
  node serve.js &                       # hoặc một static server tối thiểu
  google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=470,940 --virtual-time-budget=8000 \
    --screenshot=/tmp/shot.png "http://127.0.0.1:8731/app.dc.html"
  ```
  Lưu ý: app vào `splash` rồi tự `nav('walkthrough')` sau 1.6s (timer trong `componentDidMount`). Muốn chụp thẳng một màn: **tạm** sửa state init (`screen`, `a11y.visualLow`, `rg.step`…) + chặn timer (`if(this.state.screen==='splash') …`), chụp xong **revert sạch** (nên backup file trước).
- Đo pixel chính xác: chèn tạm `<script>` cuối `<body>` dùng `getBoundingClientRect()` ghi ra overlay rồi chụp.

---

## 9. Checklist verify (làm trước khi báo xong / commit)

```bash
node --check src/vh-render.js && node --check src/vh-logic.js && node --check src/vh-data.js

# cân bằng tag trong app.dc.html
node -e 'require("fs").readFile("app.dc.html","utf8",(e,s)=>{
  const c=r=>(s.match(r)||[]).length;
  console.log("sc-if", c(/<sc-if/g),"/",c(/<\/sc-if>/g),
    "| sc-for", c(/<sc-for/g),"/",c(/<\/sc-for>/g),
    "| div", c(/<div/g),"/",c(/<\/div>/g));
})'
```
- `sc-if` mở = đóng, `sc-for` mở = đóng, `<div>` mở = đóng. Lệch = template hỏng.
- Kiểm tra prop mới thực sự được render trả về (grep tên prop trong `vh-render.js`).
- Mở thử bằng trình duyệt (hoặc nhờ Rin) các màn vừa đụng.

---

## 10. Quy trình làm việc (tóm tắt từ CLAUDE.md)

1. **Trước khi làm**, nếu thay đổi lớn → hỏi "sửa version hiện tại hay tạo version mới?". Hiện tại đang sửa trực tiếp `app.dc.html` + `src/` (đã refactor khỏi monolith v8). Các bản `legacy/V-Heritage v*.dc.html` chỉ để tham khảo.
2. Làm thay đổi → **verify** (mục 9) → **hỏi Rin xác nhận** "commit + push?".
3. Commit: tiếng Việt, `feat()/fix()/update()/docs()`, author Rin, **không** Co-Authored-By.
   ```bash
   git -c user.name='Rin' -c user.email='ribisachi0319@gmail.com' commit -am "feat(scope): …"
   git push
   ```
4. Push lên `main` → GitHub Pages tự cập nhật (đợi 1–3 phút, hard refresh Ctrl+Shift+R).

---

## 11. Những lỗi đã từng gặp (đừng lặp lại)

| Triệu chứng | Nguyên nhân | Cách đúng |
|---|---|---|
| Phần tử cũ chồng lên khi back (ghosting) | `key="{{ step }}"` là số trùng key vị trí React | `key="prefix-{{ step }}"` có tiền tố chữ |
| Icon/nút bị đẩy sát/ra ngoài mép phải input | `<input flex:1>` thiếu `min-width:0` | thêm `min-width:0` cho mọi input trong flex row |
| Trợ năng phóng to lệch trái / khó bấm | dùng `zoom` cũ | dùng `transform: scale` trên `.vh-content` (đã làm) |
| Mở hiện vật vào nhầm trang | nhầm `openArtifact` (Màn 2) với `openArtifactModel` (Màn 1) | chọn đúng hàm theo yêu cầu |
| `null < 13` ra nhánh sai khi tính tuổi | so sánh giá trị rỗng | suy tuổi từ bracket/đã kiểm tra trước |
| Mở `file://` không chạy | runtime cần `fetch` qua HTTP | chạy `node serve.js` |
| Sửa template xong app trắng/hỏng | lệch tag `sc-if/sc-for/div` hoặc có logic trong `{{ }}` | chạy checklist mục 9, tính sẵn trong render |

---

## 12. Khi bí

- Tìm theo **tên prop** (`grep "tênProp" src/vh-render.js app.dc.html`) để lần ra cả nơi tính lẫn nơi hiển thị.
- Tìm theo **tên màn** (`is<Tên>`, `data-screen-label="<Tên>"`, comment `<!-- NN TÊN -->`) trong `app.dc.html`.
- Đối chiếu bản chạy được ở `legacy/` nếu nghi ngờ một hành vi vốn có.
- Không chắc về yêu cầu UI/UX của Rin → **hỏi lại**, đừng đoán bừa thay đổi lớn.
