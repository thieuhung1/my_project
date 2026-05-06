# GOTCHAS

## 1. Đường dẫn và cấu trúc đang có dấu hiệu không đồng nhất
Trong git status có cả các file theo đường dẫn chuẩn như `src/Pages/Home/Index.jsx` và một số file dạng `src\Pages\Home\Index.jsx`.

Cần cẩn thận để tránh:
- tạo duplicate file do khác dấu slash
- sửa nhầm file không được app sử dụng
- làm rối cấu trúc import

## 2. Thanh toán VNPay là luồng nhạy cảm
- Không đổi trạng thái đơn hàng tùy tiện từ UI.
- Cần phân biệt rõ `paymentMethod`, `paymentProvider`, `paymentStatus`.
- Khi tạo đơn, stock đang bị trừ trong transaction; sửa sai có thể gây lệch tồn kho.

## 3. Stock và order phải đồng bộ
Trong service order hiện có logic kiểm tra stock rồi mới tạo đơn.

Nếu chỉnh luồng này, phải kiểm tra:
- đơn có bị tạo khi stock không đủ không
- stock có bị trừ hai lần không
- cập nhật đơn có rollback hợp lý không

## 4. Firebase data layer có ràng buộc query
Một số query kết hợp `where` và `orderBy` sẽ phụ thuộc index / cấu trúc dữ liệu.
Khi sửa query, cần để ý khả năng phát sinh lỗi ở Firestore.

## 5. UI Home có dùng image fallback và toast động
- Ảnh lỗi sẽ fallback sang ảnh phở bò.
- Toast được gắn trực tiếp vào DOM.
- Nếu refactor Home, phải giữ fallback và hành vi add-to-cart.

## 6. Backend entry point và frontend entry có thể cùng tồn tại
Project hiện có cả server backend và UI frontend.
Cần xác định rõ file nào chạy ở runtime nào trước khi sửa.

## 7. Đừng phá các giá trị chuẩn
Các giá trị trạng thái như order status, payment status, payment method, payment provider nên coi là hằng chuẩn.
Nếu thêm mới phải cập nhật đồng bộ toàn bộ hệ thống.

## 8. Tránh refactor lớn khi chưa hiểu hết luồng
Project đang có nhiều phần đang chuyển đổi hoặc ghép giữa frontend và backend.
Sửa nhỏ, kiểm tra kỹ, rồi mới mở rộng.
