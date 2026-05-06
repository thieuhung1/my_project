# PROJECT_GUIDE

## 1. Mục tiêu dự án
FoodHub là ứng dụng đặt đồ ăn Việt Nam với trải nghiệm mua hàng nhanh, UI cam-trắng, giỏ hàng, thanh toán và theo dõi đơn hàng.

## 2. Nguyên tắc làm việc với project
- Luôn ưu tiên đúng luồng nghiệp vụ hiện tại hơn là refactor cho đẹp.
- Không tự ý đổi cấu trúc dữ liệu hoặc API nếu chưa có yêu cầu rõ ràng.
- Nếu tài liệu và code mâu thuẫn, hãy dừng lại để xác nhận.
- Khi sửa tính năng, chỉ sửa trong phạm vi liên quan trực tiếp.
- Tận dụng component, context, helper và style đang có trước khi tạo mới.

## 3. Stack chính
- React 19 + React Router
- Bootstrap 5 + Bootstrap Icons
- Context API + useReducer
- Firebase client SDK
- Firebase Admin / backend Node.js cho các luồng server cần thiết
- VNPay integration cho thanh toán

## 4. Cấu trúc tổng quan
- `src/Pages/` chứa các màn hình chính của app.
- `src/contexts/` chứa state dùng chung như auth, cart, products.
- `src/features/` chứa phần backend logic, service, model, controller.
- `src/backend/` chứa backend server và route tách riêng.
- `public/` chứa asset tĩnh.

## 5. Luồng nghiệp vụ quan trọng
- Home hiển thị món nổi bật, CTA sang products và promo.
- Products / ProductDetail là nơi người dùng xem và chọn món.
- Cart lưu số lượng, tính tổng và chuyển sang checkout.
- Orders theo dõi đơn hàng sau khi đặt.
- Thanh toán VNPay phải giữ đúng trạng thái đơn và trạng thái thanh toán.

## 6. Những việc cần hỏi lại trước khi làm
- Có thay đổi model dữ liệu đơn hàng hay không.
- Có đổi flow thanh toán hoặc trạng thái đơn hàng hay không.
- Có thêm provider thanh toán mới hay không.
- Có sửa luồng auth / quyền truy cập hay không.

## 7. Cách AI nên làm việc
1. Đọc tài liệu gốc này trước.
2. Xác định file liên quan.
3. Tóm tắt lại hiểu biết trước khi sửa.
4. Chỉ thực hiện thay đổi được yêu cầu.
5. Sau khi sửa, kiểm tra các ảnh hưởng liên quan.
