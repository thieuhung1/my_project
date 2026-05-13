# My Project

Ứng dụng web FoodHub phục vụ đặt món, quản lý đơn hàng, tài khoản người dùng và khu vực quản trị.

## Công nghệ sử dụng

- React 19
- React Router DOM
- Firebase
- Bootstrap 5
- MUI
- Framer Motion
- Recharts
- Express
- MongoDB / Mongoose
- Firebase Admin

## Tính năng chính

- Trang chủ, danh sách sản phẩm, chi tiết sản phẩm
- Giỏ hàng và thanh toán
- Đăng ký, đăng nhập, quên mật khẩu
- Tài khoản người dùng và lịch sử đơn hàng
- Khu vực quản trị, shipper, waiter
- Chat hỗ trợ khách hàng
- Gợi ý tìm kiếm sản phẩm

## Cấu trúc thư mục chính

- `src/app` - khởi tạo ứng dụng, router, providers
- `src/components` - component dùng chung
- `src/contexts` - state toàn cục và auth
- `src/features` - service, controller, logic nghiệp vụ
- `src/Pages` - các màn hình theo route
- `src/styles` - CSS dùng chung

## Scripts

```bash
npm run dev
```
Chạy frontend và backend song song.

```bash
npm run start:frontend
```
Chạy React app.

```bash
npm run start:backend
```
Chạy backend Node.js.

```bash
npm run seed
```
Chạy seed dữ liệu mẫu.

## Môi trường cần thiết

Tạo file `.env` và cấu hình các biến môi trường cần thiết cho Firebase, backend và các dịch vụ liên quan.

## Hướng dẫn chạy dự án

1. Cài đặt dependencies

```bash
npm install
```

2. Khởi động dự án

```bash
npm run dev
```

3. Mở ứng dụng frontend theo địa chỉ hiển thị trong terminal.

## Ghi chú triển khai

- Dự án đang được tối ưu theo hướng nhẹ hơn, bảo mật hơn và đồng bộ giao diện hơn.
- Các route nhạy cảm được bảo vệ bằng `ProtectedRoute`.
- Một số tính năng có thể phụ thuộc vào Firebase và backend Node.js.

## Kế hoạch cải tiến tiếp theo

- Chuẩn hóa hệ thống component dùng chung
- Siết rule bảo mật Firebase/Firestore
- Tối ưu lazy load và render
- Đồng bộ UI across mọi trang
- Dọn dependency không dùng

## License

Private project.
