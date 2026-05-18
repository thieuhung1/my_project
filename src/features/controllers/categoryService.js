// categoryService.js - Tầng làm việc với collection danh mục trên Firestore.
// File này chịu trách nhiệm lấy danh sách danh mục, lấy chi tiết, thêm/sửa/xóa.
//
// Các hàm ở đây đều bọc Firestore API để phần UI không phải tự viết query lặp lại.

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
} from "firebase/firestore";
import { db } from "../../firebase/firebase.Config";
import { buildTimestamps, mapDocs } from "./firestoreHelpers";

const COLLECTION_NAME = "categories";

export const getAllCategories = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const getCategoryById = async (categoryId) => {
  const docRef = doc(db, COLLECTION_NAME, categoryId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error("Danh mục không tồn tại!");
  }

  return { id: snapshot.id, ...snapshot.data() };
};

export const addCategory = async (categoryData) => {
  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    buildTimestamps(categoryData, true)
  );
  return docRef.id;
};

export const updateCategory = async (categoryId, updatedData) => {
  const docRef = doc(db, COLLECTION_NAME, categoryId);
  await updateDoc(docRef, buildTimestamps(updatedData));
};

export const deleteCategory = async (categoryId) => {
  await deleteDoc(doc(db, COLLECTION_NAME, categoryId));
};
