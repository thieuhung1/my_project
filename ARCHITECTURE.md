# ARCHITECTURE

## 1. Kiến trúc tổng thể
Project có xu hướng chia thành 2 phần chính:
- Frontend React cho giao diện người dùng.
- Backend / feature layer cho các tác vụ server, tích hợp VNPay và xử lý nghiệp vụ dữ liệu.

## 2. Frontend structure
### Pages
`src/Pages/` đang là nơi chứa các màn hình chính theo route.

Các trang nổi bật gồm:
- Home
- Checkout
- Orders
- Products / ProductDetail
- Auth pages
- Search / Account / About / Contact

### Contexts
`src/contexts/` là lớp state toàn cục.
- Cart state
- Auth state
- Product state

Nguyên tắc: nếu dữ liệu cần dùng ở nhiều màn hình, ưu tiên đặt vào context thay vì truyền props quá sâu.

### UI style
- Bootstrap 5 là lớp layout chính.
- Màu chủ đạo cam-trắng.
- Tập trung vào responsive mobile-first.

## 3. Backend / feature structure
### `src/features/`
Khu vực này đang chứa:
- `controllers/` cho logic nghiệp vụ
- `models/` cho enum / schema logic của đơn hàng
- `vnpay/` cho route và service thanh toán
- `server.js` cho backend entry

### `src/backend/`
Có dấu hiệu đây là một nhánh backend tách riêng hoặc đang được tổ chức lại để phục vụ server runtime.

Nguyên tắc:
- Không đặt logic nghiệp vụ rải rác giữa nhiều nơi nếu có thể gom về service.
- Route chỉ nên xử lý request/response.
- Service xử lý business logic.

## 4. Data flow quan trọng
### Cart flow
1. Người dùng thêm món vào cart.
2. CartContext cập nhật state và localStorage.
3. Checkout đọc từ cart để tạo đơn.
4. Orders phản ánh kết quả sau khi tạo đơn.

### Order flow
1. Tạo đơn từ checkout.
2. Trừ stock nếu đặt đơn thành công.
3. Lưu trạng thái đơn và trạng thái thanh toán.
4. Cập nhật đơn khi có xác nhận thanh toán / xử lý backend.

### Payment flow
- COD và VNPay cần được tách rõ.
- Trạng thái thanh toán không nên suy đoán từ UI.
- Backend là nơi xác nhận các cập nhật quan trọng.

## 5. Quy tắc kiến trúc
- Component thuần UI không nên chứa nghiệp vụ backend phức tạp.
- Helper dùng cho logic lặp lại như format tiền, xử lý ảnh lỗi, map dữ liệu.
- File nào đang là nguồn dữ liệu thật thì không được thay đổi tùy tiện.
- Luồng mới phải bám theo luồng cũ nếu chưa có kế hoạch migration.
