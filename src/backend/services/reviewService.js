// ============================================================
// reviewService.js - Dịch vụ quản lý đánh giá sản phẩm (Firestore)
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { mapDocs } from "./firestoreHelpers";

const REVIEW_COLLECTION = "reviews";
const PRODUCT_COLLECTION = "products";

// ---- Lấy tất cả đánh giá của một sản phẩm ----
export const getReviewsByProduct = async (productId) => {
  // Bỏ orderBy để tránh phụ thuộc index, rồi sort lại bằng JS.
  const q = query(
    collection(db, REVIEW_COLLECTION),
    where("productId", "==", productId)
  );
  const snapshot = await getDocs(q);
  const reviews = mapDocs(snapshot);

  return reviews.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
    const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
    return dateB - dateA;
  });
};

// ---- Thêm đánh giá mới và cập nhật điểm trung bình sản phẩm ----
export const addReview = async (reviewData) => {
  const { productId, rating } = reviewData;

  // Thêm đánh giá vào collection reviews.
  const docRef = await addDoc(collection(db, REVIEW_COLLECTION), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });

  // Cập nhật rating và reviewCount của sản phẩm nhưng không làm hỏng luồng chính nếu thất bại.
  try {
    const productRef = doc(db, PRODUCT_COLLECTION, productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const productData = productSnap.data();
      const currentReviewCount = productData.reviewCount || 0;
      const currentRating = productData.rating || 0;

      // Tính lại rating trung bình theo công thức cộng dồn.
      const newReviewCount = currentReviewCount + 1;
      const newRating = ((currentRating * currentReviewCount) + rating) / newReviewCount;

      await updateDoc(productRef, {
        reviewCount: newReviewCount,
        rating: newRating,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (productError) {
    console.warn("Không cập nhật được rating sản phẩm:", productError);
  }

  return docRef.id;
};

// ---- Xóa đánh giá ----
export const deleteReview = async (reviewId) => {
  const docRef = doc(db, REVIEW_COLLECTION, reviewId);
  await deleteDoc(docRef);
};

// ---- Kiểm tra người dùng đã đánh giá sản phẩm chưa ----
export const hasUserReviewed = async (productId, userId) => {
  // Lấy tất cả reviews của sản phẩm rồi lọc bằng JS để tránh lỗi index.
  const q = query(
    collection(db, REVIEW_COLLECTION),
    where("productId", "==", productId)
  );
  const snapshot = await getDocs(q);
  const reviews = mapDocs(snapshot);

  return reviews.some((review) => review.userId === userId);
};

// ---- Thêm/reply cho đánh giá ----
export const addReply = async (reviewId, replyData) => {
  const docRef = doc(db, REVIEW_COLLECTION, reviewId);
  await updateDoc(docRef, {
    replies: arrayUnion({
      ...replyData,
      createdAt: new Date().toISOString(),
    }),
  });
};

// ---- Xóa reply khỏi đánh giá ----
export const deleteReply = async (reviewId, replyIndex) => {
  const docRef = doc(db, REVIEW_COLLECTION, reviewId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const review = snapshot.data();
    const newReplies = [...(review.replies || [])];
    newReplies.splice(replyIndex, 1);
    await updateDoc(docRef, { replies: newReplies });
  }
};
