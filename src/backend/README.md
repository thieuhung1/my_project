# Backend Clean Code - FoodHub

Tài liệu này mô tả cấu trúc backend hiện tại của dự án FoodHub và được dùng như tài liệu tham chiếu khi refactor.

## Mục tiêu
- Giữ backend nhỏ gọn, dễ đọc và dễ bảo trì.
- Tách rõ service, model, hook và helper.
- Giảm logic trùng lặp.
- Chuẩn hóa luồng dữ liệu cho auth, product, order, coupon, review, storage và support chat.
- Loại bỏ sạch mọi dấu vết payment online không còn dùng.

## Cấu trúc thư mục
- `src/backend/firebase` - khởi tạo Firebase.
- `src/backend/services` - nghiệp vụ Firestore/Realtime DB.
- `src/backend/models` - schema và helper model.
- `src/backend/hooks` - custom hooks cho frontend.
- `src/backend/seeds` - dữ liệu mẫu.
- `src/backend/index.js` - export tập trung.

## Quy ước hiện tại
- `services`: xử lý nghiệp vụ, cập nhật dữ liệu và kiểm tra dữ liệu vào/ra.
- `models`: mô tả dữ liệu mặc định, hằng số trạng thái và helper tính toán.
- `hooks`: bọc logic truy xuất dữ liệu cho UI.
- `firestoreHelpers`: gom helper dùng chung cho Firestore.

## Chuẩn hóa order flow
- Chỉ giữ `COD` là phương thức thanh toán backend mặc định.
- Chỉ giữ `LOCAL` là payment provider nội bộ.
- Order creation chạy trong transaction và kiểm tra tồn kho trước khi trừ stock.
- Các trạng thái order và payment status được đặt ở model dùng chung.

## Collections chính
- `users`
- `products`
- `orders`
- `categories`
- `coupons`
- `reviews`

## Ghi chú refactor
- Payment online đã bị loại bỏ khỏi backend.
- Ưu tiên giữ các service gọn, rõ trách nhiệm.
- Các thay đổi lớn phải đi kèm lint/test trước khi chốt.
