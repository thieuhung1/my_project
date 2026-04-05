// ============================================================
// orderService.js - Dịch vụ quản lý đơn hàng (Firestore)
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Tên collection đơn hàng trong Firestore
const COLLECTION_NAME = "orders";

// ---- Tạo đơn hàng mới ----
export const createOrder = async (orderData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...orderData,
    status: "pending",         // Trạng thái mặc định: chờ xử lý
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ---- Lấy đơn hàng theo ID ----
export const getOrderById = async (orderId) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Đơn hàng không tồn tại!");
  return { id: snapshot.id, ...snapshot.data() };
};

// ---- Lấy tất cả đơn hàng của một người dùng ----
export const getOrdersByUser = async (userId) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Lấy tất cả đơn hàng (dành cho Admin) ----
export const getAllOrders = async () => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ---- Cập nhật trạng thái đơn hàng ----
// status: "pending" | "confirmed" | "delivering" | "delivered" | "cancelled"
export const updateOrderStatus = async (orderId, status) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};
