// ============================================================
// couponService.js - Dịch vụ quản lý mã giảm giá (Firestore)
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase.Config";
import { buildTimestamps, getDocDataOrThrow, mapDocs } from "./firestoreHelpers";

const COLLECTION_NAME = "coupons";

// ---- Lấy tất cả mã giảm giá ----
export const getAllCoupons = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return mapDocs(snapshot);
};

// ---- Lấy mã giảm giá theo ID ----
export const getCouponById = async (couponId) => {
  const docRef = doc(db, COLLECTION_NAME, couponId);
  const snapshot = await getDoc(docRef);
  return getDocDataOrThrow(snapshot, "Mã giảm giá không tồn tại!");
};

// ---- Thêm mã giảm giá mới ----
export const addCoupon = async (couponData) => {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    buildTimestamps(couponData, true)
  );
  return docRef.id;
};

// ---- Cập nhật mã giảm giá ----
export const updateCoupon = async (couponId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, couponId);
  await updateDoc(docRef, buildTimestamps(updatedData));
};

// ---- Xóa mã giảm giá ----
export const deleteCoupon = async (couponId) => {
  await deleteDoc(doc(db, COLLECTION_NAME, couponId));
};

// ---- Kích hoạt/tắt mã giảm giá ----
export const toggleCouponStatus = async (couponId) => {
  const coupon = await getCouponById(couponId);
  await updateCoupon(couponId, { isActive: !coupon.isActive });
};

// ---- Lấy mã giảm giá theo code ----
export const getCouponByCode = async (code) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("code", "==", code),
    where("isActive", "==", true)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};


