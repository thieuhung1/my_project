// ============================================================
// productService.js - Dịch vụ quản lý sản phẩm (Firestore)
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
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Tên collection sản phẩm trong Firestore
const COLLECTION_NAME = "products";

// ---- Lấy tất cả sản phẩm ----
export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Lấy sản phẩm theo ID ----
export const getProductById = async (productId) => {
  const docRef = doc(db, COLLECTION_NAME, productId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Sản phẩm không tồn tại!");
  return { id: snapshot.id, ...snapshot.data() };
};

// ---- Lấy sản phẩm theo danh mục ----
export const getProductsByCategory = async (category) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Lấy sản phẩm nổi bật (giới hạn số lượng) ----
export const getFeaturedProducts = async (limitCount = 8) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("featured", "==", true),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Thêm sản phẩm mới ----
export const addProduct = async (productData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ---- Cập nhật sản phẩm ----
export const updateProduct = async (productId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, productId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

// ---- Xóa sản phẩm ----
export const deleteProduct = async (productId) => {
  const docRef = doc(db, COLLECTION_NAME, productId);
  await deleteDoc(docRef);
};
