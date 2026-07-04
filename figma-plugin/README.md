# V-Heritage → Figma Importer

Plugin Figma tự dựng lại toàn bộ **65 màn hình** của app V-Heritage thành frame chỉnh sửa được
(text thật, ảnh thật, icon vector, gradient, shadow… — không phải ảnh chụp).

## Cách dùng (1 lần duy nhất)

1. Mở **Figma Desktop app** (bản cài trên máy — plugin development không chạy trên web).
2. Mở file Figma của bạn.
3. Menu **Plugins → Development → Import plugin from manifest…**
4. Chọn file `figma-plugin/manifest.json` trong thư mục project này.
5. Chạy plugin **V-Heritage Importer** (Plugins → Development → V-Heritage Importer).
6. Trong cửa sổ plugin: chọn file `figma-plugin/vh-export.json` → bấm **Import toàn bộ màn hình**.
7. Đợi ~1–2 phút. Plugin tạo page mới "V-Heritage (…)" chứa 65 frame xếp dạng lưới.

> Lưu ý: file Figma cần bật font Google **Be Vietnam Pro** và **Literata**
> (Figma có sẵn, plugin tự load — nếu thiếu sẽ tự thay bằng font gần nhất).

## Cập nhật lại khi app thay đổi

Chạy lại bộ export để sinh `vh-export.json` mới rồi import lại trong Figma:

```bash
node figma-export/export.js
```

Script sẽ tự mở Chrome ẩn, dựng từng màn, tải toàn bộ ảnh + icon và ghi đè
`figma-plugin/vh-export.json`.

## Cấu trúc

- `figma-export/fixtures.js` — danh sách 65 màn + state cần set để dựng đúng màn
- `figma-export/driver.js` — chạy trong Chrome, đo DOM từng màn thành cây layer
- `figma-export/export.js` — orchestrator: server + Chrome + tải assets + ghi JSON
- `figma-plugin/` — plugin Figma (manifest + ui + code) và dữ liệu `vh-export.json`
