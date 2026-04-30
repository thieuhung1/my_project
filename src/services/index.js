export { app, analytics, auth, db, storage, rtdb } from "../firebase/firebase.Config";

export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
} from "../features/controllers/authService";

export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../features/controllers/productService";

export { mapDocs, getDocDataOrThrow, buildTimestamps } from "../features/controllers/firestoreHelpers";

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
} from "../features/controllers/orderService";

export {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  calculateTotal,
} from "../features/models/Order.model";

export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  toggleFavorite,
  getFavorites,
} from "../features/controllers/userService";

export {
  uploadProductImage,
  uploadUserAvatar,
  deleteFile,
  getFileURL,
} from "../features/controllers/storageService";

export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../features/controllers/categoryService";

export {
  getAllCoupons,
  getCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponByCode,
} from "../features/controllers/couponService";

export {
  getReviewsByProduct,
  addReview,
  deleteReview,
  hasUserReviewed,
  addReply,
  deleteReply,
} from "../features/controllers/reviewService";

export {
  getSupportChats,
  subscribeToSupportChats,
  getChatMessages,
  subscribeToMessages,
  updateChatLastMessage,
  sendSupportMessage,
  markChatAsRead,
} from "../features/controllers/supportChatService";

export {
  createProductModel,
  PRODUCT_CATEGORIES,
  calculateDiscountedPrice,
} from "../features/models/Product.model";

export {
  createOrderModel,
  ORDER_STATUS as ORDER_MODEL_STATUS,
} from "../features/models/Order.model";

export {
  createUserModel,
  USER_ROLES,
  USER_ROLE_LABEL,
  getDefaultAddress,
} from "../features/models/User.model";

export {
  createCategoryModel,
  DEFAULT_CATEGORIES,
} from "../features/models/Category.model";

export { default as useAuth } from "../features/hooks/useAuth";
export { default as useProducts } from "../features/hooks/useProducts";
export { default as useOrders } from "../features/hooks/useOrders";
export { default as useStorage } from "../features/hooks/useStorage";