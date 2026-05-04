export { app, analytics, auth, db, storage, rtdb } from "../../firebase/firebase.Config";

export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
} from "../controllers/authService";

export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productService";

export { mapDocs, getDocDataOrThrow, buildTimestamps } from "../controllers/firestoreHelpers";

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
} from "../controllers/orderService";

export {
  createVnpayPaymentUrl,
  openVnpayPayment,
  syncVnpayOrderPayment,
} from "../controllers/paymentService";

export {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  calculateTotal,
} from "../models/Order.model";

export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  toggleFavorite,
  getFavorites,
} from "../controllers/userService";

export {
  uploadProductImage,
  uploadUserAvatar,
  deleteFile,
  getFileURL,
} from "../controllers/storageService";

export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryService";

export {
  getAllCoupons,
  getCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponByCode,
} from "../controllers/couponService";

export {
  getReviewsByProduct,
  addReview,
  deleteReview,
  hasUserReviewed,
  addReply,
  deleteReply,
} from "../controllers/reviewService";

export {
  getSupportChats,
  subscribeToSupportChats,
  getChatMessages,
  subscribeToMessages,
  updateChatLastMessage,
  sendSupportMessage,
  markChatAsRead,
} from "../controllers/supportChatService";

export {
  createProductModel,
  PRODUCT_CATEGORIES,
  calculateDiscountedPrice,
} from "../models/Product.model";

export {
  createOrderModel,
  ORDER_STATUS as ORDER_MODEL_STATUS,
} from "../models/Order.model";

export {
  createUserModel,
  USER_ROLES,
  USER_ROLE_LABEL,
  getDefaultAddress,
} from "../models/User.model";

export {
  createCategoryModel,
  DEFAULT_CATEGORIES,
} from "../models/Category.model";

export { default as useAuth } from "../hooks/useAuth";
export { default as useProducts } from "../hooks/useProducts";
export { default as useOrders } from "../hooks/useOrders";
export { default as useStorage } from "../hooks/useStorage";
