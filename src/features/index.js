// features/index.js - File gom và xuất lại các service, model, hook dùng chung của ứng dụng.
//
// Mục tiêu của file này là tạo một điểm import duy nhất cho các phần khác của project.
// Thay vì import rải rác từ nhiều file con, code ở page/component chỉ cần import từ `src/features`.
// Điều này giúp giảm độ dài đường dẫn, dễ refactor và dễ thay thế implementation sau này.

// Xuất trực tiếp cấu hình Firebase để các tầng khác có thể dùng chung instance `auth`, `db`, `rtdb`, `storage`.
// Đây là các kết nối cốt lõi để đọc/ghi dữ liệu và xác thực người dùng.
export { app, analytics, auth, db, storage, rtdb } from "../firebase/firebase.Config";

// Xuất toàn bộ API liên quan đến xác thực người dùng.
// Nhóm này bao gồm đăng ký, đăng nhập, đăng xuất, reset mật khẩu, theo dõi trạng thái auth và đăng nhập ẩn danh.
// Các hàm này là đầu vào chính cho `AuthContext` và các form đăng nhập/đăng ký.
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChange,
  loginAnonymously,
  getCurrentUser,
} from "./controllers/authService";

// Xuất các hàm thao tác sản phẩm.
// Nhóm này dùng để lấy danh sách, lấy chi tiết, lọc theo danh mục, lấy sản phẩm nổi bật và CRUD sản phẩm.
// Đây là lớp giao tiếp trực tiếp với collection `products` trên Firestore.
export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./controllers/productService";

// Xuất các helper dùng chung cho Firestore.
// `mapDocs` chuyển snapshot thành mảng object dễ dùng.
// `getDocDataOrThrow` lấy dữ liệu từ document hoặc ném lỗi nếu không tồn tại.
// `buildTimestamps` chuẩn hóa `createdAt`/`updatedAt` trước khi ghi dữ liệu.
export { mapDocs, getDocDataOrThrow, buildTimestamps } from "./controllers/firestoreHelpers";

// Xuất các hàm xử lý đơn hàng.
// Bao gồm tạo đơn, lấy đơn, cập nhật trạng thái, gán shipper và cập nhật trạng thái thanh toán.
// `ORDER_COLLECTION_NAME` và `PRODUCTS_COLLECTION` là hằng số để các nơi khác dùng đúng tên collection.
export {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getOrdersByShipper,
  assignOrderToShipper,
  updatePaymentStatus,
  COLLECTION_NAME as ORDER_COLLECTION_NAME,
  PRODUCTS_COLLECTION,
} from "./controllers/orderService";

// Xuất các hằng số và hàm tính toán liên quan đến model đơn hàng.
// `ORDER_STATUS`, `PAYMENT_STATUS`, `PAYMENT_METHOD`, `PAYMENT_PROVIDER` là các enum trạng thái chuẩn.
// `ORDER_STATUS_LABEL` và `ORDER_STATUS_COLOR` dùng để render UI.
// `calculateTotal` là hàm tính tổng tiền đơn hàng từ items, phí và giảm giá.
export {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  calculateTotal,
} from "./models/Order.model";

// Xuất các hàm quản lý profile người dùng.
// Nhóm này lo việc tạo profile, đọc/cập nhật profile, lấy danh sách user, đổi role và quản lý favorite.
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  toggleFavorite,
  getFavorites,
} from "./controllers/userService";

// Xuất các hàm upload và quản lý file trên Firebase Storage.
// Bao gồm upload ảnh sản phẩm, avatar người dùng, xóa file và lấy URL công khai.
export {
  uploadProductImage,
  uploadUserAvatar,
  deleteFile,
  getFileURL,
} from "./controllers/storageService";

// Xuất toàn bộ API thao tác danh mục sản phẩm.
// Dùng cho màn hình admin và phần hiển thị filter ở frontend.
export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./controllers/categoryService";

// Xuất API quản lý coupon/mã giảm giá.
// Nhóm này cho phép lấy, thêm, sửa, xóa, bật/tắt coupon và tìm coupon theo mã.
export {
  getAllCoupons,
  getCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponByCode,
} from "./controllers/couponService";

// Xuất API cho review sản phẩm.
// Bao gồm lấy review theo sản phẩm, thêm/xóa review, kiểm tra user đã review chưa và quản lý phản hồi.
export {
  getReviewsByProduct,
  addReview,
  deleteReview,
  hasUserReviewed,
  addReply,
  deleteReply,
} from "./controllers/reviewService";

// Xuất toàn bộ API của support chat.
// Nhóm này dùng cho chatbot khách hàng và giao diện admin hỗ trợ.
// Nó bao gồm lấy danh sách chat, subscribe realtime, lấy/gửi tin nhắn và đánh dấu đã đọc.
export {
  getSupportChats,
  subscribeToSupportChats,
  getChatMessages,
  subscribeToMessages,
  updateChatLastMessage,
  sendSupportMessage,
  markChatAsRead,
} from './controllers/supportChatService';

// Xuất API thông báo.
// `createNotification` tạo thông báo mới, `getNotificationsByUser` và `getAdminNotifications` đọc thông báo theo vai trò.
// `NOTIFICATION_TYPES` là tập kiểu thông báo chuẩn hóa để đồng bộ toàn hệ thống.
export {
  createNotification,
  getNotificationsByUser,
  getAdminNotifications,
  NOTIFICATION_TYPES,
} from './controllers/notificationService';

// Xuất các helper/model cho sản phẩm.
// `createProductModel` tạo object sản phẩm chuẩn.
// `PRODUCT_CATEGORIES` là danh sách danh mục mặc định.
// `calculateDiscountedPrice` tính giá sau giảm nếu sản phẩm có khuyến mãi.
export {
  createProductModel,
  PRODUCT_CATEGORIES,
  calculateDiscountedPrice,
} from "./models/Product.model";

// Xuất model đơn hàng.
// `createOrderModel` tạo cấu trúc đơn hàng chuẩn theo domain.
// `ORDER_MODEL_STATUS` là alias của `ORDER_STATUS` để phân biệt rõ khi import ở tầng model.
export {
  createOrderModel,
  ORDER_STATUS as ORDER_MODEL_STATUS,
} from "./models/Order.model";

// Xuất model người dùng.
// `createUserModel` tạo user object chuẩn.
// `USER_ROLES` và `USER_ROLE_LABEL` hỗ trợ role-based UI.
// `getDefaultAddress` trả về địa chỉ mặc định an toàn khi profile chưa có dữ liệu.
export {
  createUserModel,
  USER_ROLES,
  USER_ROLE_LABEL,
  getDefaultAddress,
} from "./models/User.model";

// Xuất model danh mục.
// `createCategoryModel` tạo object category chuẩn, còn `DEFAULT_CATEGORIES` là bộ danh mục khởi tạo sẵn.
export {
  createCategoryModel,
  DEFAULT_CATEGORIES,
} from "./models/Category.model";

// Xuất các custom hooks dùng ở UI.
// `useAuth` cho trạng thái đăng nhập.
// `useProducts` cho danh sách sản phẩm.
// `useOrders` cho đơn hàng.
// `useStorage` cho upload/lấy file.
export { default as useAuth } from "./hooks/useAuth";
export { default as useProducts } from "./hooks/useProducts";
export { default as useOrders } from "./hooks/useOrders";
export { default as useStorage } from "./hooks/useStorage";
