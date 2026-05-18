// productService.js - Tầng truy cập dữ liệu cho sản phẩm.
// File này chịu trách nhiệm đọc, lọc, thêm, sửa và xóa sản phẩm trong Firestore.
//
// Các hàm ở đây được thiết kế để UI chỉ cần gọi API cấp cao mà không phải tự viết query.

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
} from "firebase/firestore";
import { db } from "../../firebase/firebase.Config";
import { buildTimestamps, mapDocs } from "./firestoreHelpers";

// Tên collection dùng chung cho dữ liệu sản phẩm trong Firestore.
const COLLECTION_NAME = "products";

export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return mapDocs(snapshot);
};

export const getProductById = async (productId) => {
  const docRef = doc(db, COLLECTION_NAME, productId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error("Sản phẩm không tồn tại!");
  }

  return { id: snapshot.id, ...snapshot.data() };
};

export const getProductsByCategory = async (category) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const getFeaturedProducts = async (limitCount = 8) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("featured", "==", true),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const addProduct = async (productData) => {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    buildTimestamps(productData, true)
  );
  return docRef.id;
};

export const updateProduct = async (productId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, productId);
  await updateDoc(docRef, buildTimestamps(updatedData));
};

export const deleteProduct = async (productId) => {
  await deleteDoc(doc(db, COLLECTION_NAME, productId));
};
