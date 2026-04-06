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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const COLLECTION_NAME = "coupons";

// ---- Lấy tất cả mã giảm giá ----
export const getAllCoupons = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Lấy mã giảm giá theo ID ----
export const getCouponById = async (couponId) => {
  const docRef = doc(db, COLLECTION_NAME, couponId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Mã giảm giá không tồn tại!");
  return { id: snapshot.id, ...snapshot.data() };
};

// ---- Thêm mã giảm giá mới ----
export const addCoupon = async (couponData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...couponData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ---- Cập nhật mã giảm giá ----
export const updateCoupon = async (couponId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, couponId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

// ---- Xóa mã giảm giá ----
export const deleteCoupon = async (couponId) => {
  const docRef = doc(db, COLLECTION_NAME, couponId);
  await deleteDoc(docRef);
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
  if (snapshot.empty) throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};


