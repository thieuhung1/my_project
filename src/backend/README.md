# Backend Clean Code - FoodHub

Tài liệu này mô tả cấu trúc backend hiện tại của dự án FoodHub và được dùng như tài liệu tham chiếu khi refactor.

## Mục tiêu
- Giữ backend nhỏ gọn, dễ đọc và dễ bảo trì.
- Tách rõ service, model, hook và helper.
- Giảm logic trùng lặp.
- Chuẩn hóa luồng dữ liệu cho auth, product, order, coupon, review, storage và support chat.

## Cấu trúc thư mục
- `src/backend/firebase` - khởi tạo Firebase.
- `src/backend/services` - nghiệp vụ Firestore/Realtime DB.
- `src/backend/models` - schema và helper model.
- `src/backend/hooks` - custom hooks cho frontend.
- `src/backend/seeds` - dữ liệu mẫu.
- `src/backend/index.js` - export tập trung.

## Quy ước hiện tại
- `services`: chỉ xử lý nghiệp vụ.
- `models`: chỉ mô tả dữ liệu và hằng số liên quan.
- `hooks`: chỉ bọc logic truy xuất dữ liệu cho UI.
- `firestoreHelpers`: gom helper dùng chung cho Firestore.

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
