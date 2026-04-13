# 🍽️ FoodHub - Hệ Thống Quản Lý & Giao Đồ Ăn Toàn Diện

> **Tài liệu Hướng dẫn Phát triển & Vận hành (Phiên bản 2.0)**  
> *Được tối ưu hóa cho hiệu suất, bảo mật và trải nghiệm người dùng thực tế.*

---

## 📖 1. Tổng Quan Dự Án
**FoodHub** là nền tảng thương mại điện tử chuyên biệt cho lĩnh vực ẩm thực Việt Nam. Hệ thống không chỉ dừng lại ở việc đặt hàng online mà còn tích hợp quy trình vận hành khép kín từ khâu quản lý tại quán (Waiter), giao hàng (Shipper) đến quản trị hệ thống (Admin).

### 🚀 Công Nghệ Sử Dụng (Tech Stack)
- **Frontend**: React 19, Bootstrap 5 (Responsive), Context API (State Management).
- **Backend (Serverless)**: 
  - **Firebase Auth**: Quản lý định danh người dùng.
  - **Cloud Firestore**: Cơ sở dữ liệu NoSQL thời gian thực.
  - **Firebase Storage**: Lưu trữ hình ảnh sản phẩm & avatar.
  - **Realtime Database**: Hệ thống Chat hỗ trợ khách hàng.
  - **Firebase Hosting**: Triển khai ứng dụng lên môi trường Web.

---

## 🛠️ 2. Hướng Dẫn Cài Đặt & Cấu Hình

### 2.1 Chuẩn bị môi trường
1. Cài đặt **Node.js** (Phiên bản mới nhất).
2. Cài đặt **Firebase CLI**: `npm install -g firebase-tools`.

### 2.2 Các bước cài đặt
```bash
# 1. Clone hoặc tải mã nguồn về máy
# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Đăng nhập Firebase
firebase login

# 4. Khởi chạy dự án ở chế độ phát triển
npm start
```

### 2.3 Cấu hình Kết nối Firebase
File cấu hình tại `src/backend/firebase/firebaseConfig.js` cần chứa các thông tin từ Firebase Console của bạn:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 🗄️ 3. Cấu Trúc Dữ Liệu (Firestore Collections)

Hệ thống được thiết kế với cấu trúc dữ liệu linh hoạt nhưng chặt chẽ:

| Collection | Mục đích | Các trường chính |
| :--- | :--- | :--- |
| `users` | Thông tin người dùng | `uid`, `email`, `role` (ADMIN/USER/SHIPPER/WAITER), `address` |
| `products` | Danh sách món ăn | `name`, `price`, `category`, `stock`, `image`, `description` |
| `orders` | Lịch sử đơn hàng | `id`, `items`, `total`, `status`, `userId`, `type` (DELIVERY/DINE_IN) |
| `categories` | Phân loại món ăn | `id`, `name`, `icon`, `orderIndex` |
| `coupons` | Mã giảm giá | `code`, `discountValue`, `minOrder`, `expiryDate` |
| `chats` | Tin nhắn hỗ trợ | `messages[]`, `lastUpdated`, `status` |

---

## 🌟 4. Các Tính Năng Cốt Lõi (Phân Hệ)

### 👤 4.1 Phân hệ Người Dùng (Client)
- **Duyệt & Tìm kiếm**: Lọc món ăn theo danh mục, giá cả và từ khóa.
- **Giỏ hàng thông minh**: Tự động tính toán tổng tiền, áp dụng mã giảm giá.
- **Quy trình Thanh toán**: 
  - Tích hợp kiểm tra địa chỉ (Hỗ trợ tốt nhất tại khu vực **Nghệ An**).
  - Tùy chọn đặt hàng giao tận nơi hoặc ăn tại quán thông qua mã bàn.
- **Hỗ trợ trực tuyến**: Chat trực tiếp với Admin thông qua Realtime Chat.

### 🛡️ 4.2 Phân hệ Quản Trị (Admin Panel)
- **Dashboard Thống kê**: Biểu đồ doanh thu, số lượng đơn hàng và người dùng mới theo thời gian thực.
- **Quản lý Kho**: Cập nhật số lượng tồn kho ngay lập tức, ngăn chặn đặt hàng quá mức.
- **Quản lý Khuyến mãi**: Tạo và quản lý mã giảm giá theo % hoặc số tiền cố định.
- **Trung tâm Hỗ trợ**: Tiếp nhận và phản hồi chat của khách hàng tập trung.

### 🛵 4.3 Phân hệ Giao Hàng (Shipper App)
- **Nhận đơn tự động**: Shipper chọn đơn từ danh sách "Đang chờ shipper".
- **Giới hạn nhận đơn**: Mỗi shipper nhận tối đa 03 đơn cùng lúc để đảm bảo tốc độ.
- **Cập nhật trạng thái**: Chuyển đổi trạng thái đơn từ `CONFIRMED` -> `DELIVERING` -> `COMPLETED`.
- **Thanh toán COD**: Xác nhận đã thu tiền khi hoàn thành đơn giao tận nơi.

### 🤵 4.4 Phân hệ Nhân Viên Quán (Waiter Area)
- **Quản lý Bàn**: Theo dõi các đơn hàng ăn tại quán (`DINE_IN`).
- **Thanh toán tại chỗ**: Chốt đơn và cập nhật trạng thái đã thanh toán ngay khi khách hoàn thành bữa ăn.

---

## 🔐 5. Bảo Mật & Quy Tắc Dữ Liệu

Dự án sử dụng **Firestore Security Rules** để bảo vệ dữ liệu tuyệt đối:
- **Người dùng**: Chỉ có thể xem/đổi thông tin của chính mình.
- **Admin**: Có toàn quyền đối với tất cả các collections.
- **Shipper**: Chỉ có quyền cập nhật trạng thái các đơn hàng mà mình đã nhận.
- **Xác thực**: Bắt buộc đăng nhập cho các thao tác đặt hàng và thanh toán.

---

## 🚀 6. Triển Khai (Deployment)

Để đưa trang web lên môi trường internet (Firebase Hosting):
1. Chạy lệnh build: `npm run build`.
2. Chạy lệnh deploy: `firebase deploy`.

---

> **Lưu ý**: Để đảm bảo hệ thống vận hành trơn tru, hãy kiểm tra kỹ các chỉ mục (Indexes) trong `firestore.indexes.json` để tránh lỗi khi thực hiện các câu truy vấn phức tạp (như lọc sản phẩm theo giá và danh mục cùng lúc).

**© 2024 FoodHub Project. Phát triển bởi Đội ngũ kỹ thuật.**
