// ============================================================
// index.js - Điểm xuất tập trung cho toàn bộ backend
// Dùng để import gọn gàng trong các component React
//
// Ví dụ sử dụng:
//   import { useAuth, getAllProducts, ORDER_STATUS } from '../backend';
// ============================================================

// --- Firebase Core ---
export { app, analytics, auth, db, storage, rtdb } from "./firebase/firebaseConfig";

// --- Auth Service ---
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
} from "./services/authService";

// --- Product Service ---
export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./services/productService";

// --- Order Service ---
export {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getOrdersByShipper,
  assignOrderToShipper,
} from "./services/orderService";

// --- User Service ---
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
} from "./services/userService";

// --- Storage Service ---
export {
  uploadProductImage,
  uploadUserAvatar,
  deleteFile,
  getFileURL,
} from "./services/storageService";

// --- Category Service ---
export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./services/categoryService";

// --- Coupon Service ---
export {
  getAllCoupons,
  getCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "./services/couponService";

// --- Review Service ---
export {
  getReviewsByProduct,
  addReview,
  deleteReview,
  hasUserReviewed,
} from "./services/reviewService";

// --- Support Chat Service ---
export {
  getSupportChats,
  subscribeToSupportChats,
  getChatMessages,
  subscribeToMessages,
  sendSupportMessage,
  markChatAsRead,
} from "./services/supportChatService";

// --- Models ---
export {
  createProductModel,
  PRODUCT_CATEGORIES,
  calculateDiscountedPrice,
} from "./models/Product.model";

export {
  createOrderModel,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  calculateTotal,
} from "./models/Order.model";

export {
  createUserModel,
  USER_ROLES,
  USER_ROLE_LABEL,
  getDefaultAddress,
} from "./models/User.model";

export {
  createCategoryModel,
  DEFAULT_CATEGORIES,
} from "./models/Category.model";

// --- Custom Hooks ---
export { default as useAuth } from "./hooks/useAuth";
export { default as useProducts } from "./hooks/useProducts";
export { default as useOrders } from "./hooks/useOrders";
export { default as useStorage } from "./hooks/useStorage";
