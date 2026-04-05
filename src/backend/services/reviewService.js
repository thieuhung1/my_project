// ============================================================
// reviewService.js - Dịch vụ quản lý đánh giá sản phẩm (Firestore)
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const REVIEW_COLLECTION = "reviews";
const PRODUCT_COLLECTION = "products";

// ---- Lấy tất cả đánh giá của một sản phẩm ----
export const getReviewsByProduct = async (productId) => {
  const q = query(
    collection(db, REVIEW_COLLECTION),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Thêm đánh giá mới và cập nhật điểm trung bình sản phẩm ----
export const addReview = async (reviewData) => {
  const { productId, rating } = reviewData;

  // Thêm đánh giá vào collection reviews
  const docRef = await addDoc(collection(db, REVIEW_COLLECTION), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });

  // Cập nhật rating và reviewCount của sản phẩm
  const productRef = doc(db, PRODUCT_COLLECTION, productId);
  await updateDoc(productRef, {
    reviewCount: increment(1),
    // Lưu ý: rating trung bình cần tính lại sau khi thêm
    rating: rating,
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

// ---- Xóa đánh giá ----
export const deleteReview = async (reviewId) => {
  const docRef = doc(db, REVIEW_COLLECTION, reviewId);
  await deleteDoc(docRef);
};

// ---- Kiểm tra người dùng đã đánh giá sản phẩm chưa ----
export const hasUserReviewed = async (productId, userId) => {
  const q = query(
    collection(db, REVIEW_COLLECTION),
    where("productId", "==", productId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
