export { app, analytics, auth, db, storage, rtdb } from "./firebase/firebaseConfig";

export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
} from "./services/authService";

export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./services/productService";

export { mapDocs, getDocDataOrThrow, buildTimestamps } from "./services/firestoreHelpers";

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
} from "./services/orderService";

export {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  createOrderModel,
  calculateTotal,
} from "./models/Order.model";

export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  toggleFavorite,
  getFavorites,
} from "./services/userService";

export {
  uploadProductImage,
  uploadUserAvatar,
  deleteFile,
  getFileURL,
} from "./services/storageService";

export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./services/categoryService";

export {
  getAllCoupons,
  getCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponByCode,
} from "./services/couponService";

export {
  getReviewsByProduct,
  addReview,
  deleteReview,
  hasUserReviewed,
  addReply,
  deleteReply,
} from "./services/reviewService";

export {
  getSupportChats,
  subscribeToSupportChats,
  getChatMessages,
  subscribeToMessages,
  updateChatLastMessage,
  sendSupportMessage,
  markChatAsRead,
} from "./services/supportChatService";

export {
  createProductModel,
  PRODUCT_CATEGORIES,
  calculateDiscountedPrice,
} from "./models/Product.model";

export {
  createOrderModel,
  ORDER_STATUS as ORDER_MODEL_STATUS,
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

export { default as useAuth } from "./hooks/useAuth";
export { default as useProducts } from "./hooks/useProducts";
export { default as useOrders } from "./hooks/useOrders";
export { default as useStorage } from "./hooks/useStorage";