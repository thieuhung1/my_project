# 🔥 Backend - Firebase (Food Hub)

Thư mục này chứa toàn bộ logic backend của ứng dụng **Food Hub**, được xây dựng hoàn toàn trên nền tảng **Firebase**.

---

## 📁 Cấu trúc thư mục

```
src/backend/
│
├── firebase/
│   └── firebaseConfig.js       # Khởi tạo Firebase App, Auth, Firestore, Storage
│
├── services/
│   ├── authService.js          # Đăng ký, đăng nhập, đăng xuất, Google Auth
│   ├── userService.js          # CRUD hồ sơ người dùng, quản lý vai trò
│   ├── productService.js       # CRUD sản phẩm, lọc theo danh mục
│   ├── orderService.js         # Tạo & quản lý đơn hàng
│   ├── categoryService.js      # CRUD danh mục món ăn  
│   ├── reviewService.js        # Đánh giá & xếp hạng sản phẩm
│   └── storageService.js       # Upload/xóa ảnh lên Firebase Storage
│
├── models/
│   ├── Product.model.js        # Schema sản phẩm + helpers
│   ├── Order.model.js          # Schema đơn hàng + trạng thái
│   ├── User.model.js           # Schema người dùng + vai trò
│   └── Category.model.js       # Schema danh mục + mặc định
│
├── hooks/
│   ├── useAuth.js              # Hook theo dõi trạng thái đăng nhập
│   ├── useProducts.js          # Hook lấy & lọc sản phẩm
│   ├── useOrders.js            # Hook quản lý đơn hàng
│   └── useStorage.js           # Hook upload file với tiến trình
│
└── index.js                    # Export tập trung toàn bộ backend
```

---

## 🚀 Cách sử dụng

### Import từ backend (cách ngắn gọn nhất)
```js
import { useAuth, getAllProducts, ORDER_STATUS } from '../backend';
```

### Ví dụ: Đăng nhập bằng Email
```js
import { loginWithEmail } from '../backend';

const handleLogin = async () => {
  const user = await loginWithEmail(email, password);
  console.log("Đăng nhập thành công:", user.displayName);
};
```

### Ví dụ: Dùng Hook lấy sản phẩm
```js
import { useProducts } from '../backend';

const ProductList = () => {
  const { products, loading, error } = useProducts("burger");
  if (loading) return <p>Đang tải...</p>;
  return products.map(p => <div key={p.id}>{p.name}</div>);
};
```

### Ví dụ: Đặt đơn hàng
```js
import { useOrders } from '../backend';

const { placeOrder } = useOrders(userId);
await placeOrder({ userId, items, totalAmount, address });
```

---

## 🗄️ Cấu trúc Firestore Collections

| Collection   | Mô tả                          |
|--------------|-------------------------------|
| `users`      | Hồ sơ người dùng              |
| `products`   | Danh sách sản phẩm            |
| `orders`     | Đơn hàng                      |
| `categories` | Danh mục món ăn               |
| `reviews`    | Đánh giá sản phẩm             |

---

## 🔐 Firebase Services sử dụng

| Service              | Dùng cho                           |
|----------------------|------------------------------------|
| **Authentication**   | Đăng nhập Email, Google            |
| **Firestore**        | Lưu trữ dữ liệu (NoSQL)           |
| **Storage**          | Upload ảnh sản phẩm, avatar        |
| **Analytics**        | Theo dõi hành vi người dùng       |
