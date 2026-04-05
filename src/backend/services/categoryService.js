// ============================================================
// categoryService.js - Dịch vụ quản lý danh mục (Firestore)
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Tên collection danh mục trong Firestore
const COLLECTION_NAME = "categories";

// ---- Lấy tất cả danh mục (sắp xếp theo thứ tự) ----
export const getAllCategories = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Lấy danh mục theo ID ----
export const getCategoryById = async (categoryId) => {
  const docRef = doc(db, COLLECTION_NAME, categoryId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Danh mục không tồn tại!");
  return { id: snapshot.id, ...snapshot.data() };
};

// ---- Thêm danh mục mới ----
export const addCategory = async (categoryData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ---- Cập nhật danh mục ----
export const updateCategory = async (categoryId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, categoryId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

// ---- Xóa danh mục ----
export const deleteCategory = async (categoryId) => {
  const docRef = doc(db, COLLECTION_NAME, categoryId);
  await deleteDoc(docRef);
};
