# Hướng dẫn cho Claude Code - V-Heritage Project

## Git Configuration
- **Author**: Rin <ribisachi0319@gmail.com>
- **Commit message**: Không viết Co-Authored-By
- **Format commit message**: Tiếng Việt, theo format `feat(...): ...` hoặc `fix(...): ...`

## Version Management

### Quy tắc chung
- Project hiện tại sử dụng version numbering: `V-Heritage vX.dc.html`
- `index.html` luôn trỏ tới version chính (hiện tại là v8)
- Mỗi thay đổi lớn → version mới; thay đổi nhỏ → sửa version hiện tại

### Workflow khi nhận yêu cầu/feedback
1. **Trước khi bắt tay làm việc**, Claude Code phải hỏi:
   - "Bạn muốn thay đổi version hiện tại hay tạo version mới?"
   - Nếu người dùng không chỉ định rõ, Claude Code được tự nhận định dựa trên độ lớn của thay đổi

2. **Nếu tạo version mới**:
   - Copy file version hiện tại → tên mới (vD: `V-Heritage v9.dc.html`)
   - Thực hiện thay đổi trên file mới
   - Update `index.html` để trỏ tới version mới

3. **Nếu sửa version hiện tại**:
   - Chỉnh sửa trực tiếp file version đang active

## Commit & Push Workflow

### Trước khi commit + push
1. **Visual testing**: Mở trình duyệt, kiểm tra UI/UX hoạt động đúng
   - Không cần test toàn bộ, chỉ kiểm tra phần vừa thay đổi + các liên quan
2. **Hỏi người dùng xác nhận**:
   - "Có muốn commit + push lên GitHub Pages không?"
   - Nếu người dùng chưa nói gì, luôn hỏi trước khi push

### Commit message
- Ngắn gọn, tiếng Việt
- Format: `feat(scope): ...` / `fix(scope): ...` / `update(scope): ...` / `docs(scope): ...`
  - Scope bên trong ngoặc là phần được thay đổi (VD: title, version, feature, etc.)
- Ví dụ: `feat(search): thêm feature tìm kiếm nâng cao`, `update(title): cập nhật title thành V-Heritage`

## Tổng kết
Mục đích: Claude Code sẽ hỗ trợ bạn (người chưa quen code/git) một cách thoải mái, thông qua:
- Tự động handle version/file management
- Luôn hỏi xác nhận trước khi push
- Đảm bảo visual correctness trước push
