// ============================================================
// userService.js - Dịch vụ quản lý thông tin người dùng (Firestore)
// ============================================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Tên collection người dùng trong Firestore
const COLLECTION_NAME = "users";

// ---- Tạo hồ sơ người dùng sau khi đăng ký ----
export const createUserProfile = async (userId, userData) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(docRef, {
    ...userData,
    role: "customer",             // Vai trò mặc định: khách hàng
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// ---- Lấy thông tin hồ sơ người dùng theo ID ----
export const getUserProfile = async (userId) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Người dùng không tồn tại!");
  return { id: snapshot.id, ...snapshot.data() };
};

// ---- Cập nhật thông tin hồ sơ người dùng ----
export const updateUserProfile = async (userId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

// ---- Lấy tất cả người dùng (dành cho Admin) ----
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Cập nhật vai trò người dùng ----
// role: "customer" | "admin" | "staff"
export const updateUserRole = async (userId, role) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp(),
  });
};

// ---- Lấy người dùng theo vai trò ----
export const getUsersByRole = async (role) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("role", "==", role)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};
