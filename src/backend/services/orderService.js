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
  runTransaction,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Tên collection đơn hàng trong Firestore
const COLLECTION_NAME = "orders";
const PRODUCTS_COLLECTION = "products";

// Schema note: now supports couponId, couponCode, discountAmount, subtotal


// ---- Tạo đơn hàng mới với tính năng trừ tồn kho (Stock decrement) ----
export const createOrder = async (orderData) => {
  return await runTransaction(db, async (transaction) => {
    // 1. Kiểm tra tồn kho cho tất cả sản phẩm trong đơn hàng
    for (const item of orderData.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnap = await transaction.get(productRef);
      
      if (!productSnap.exists()) {
        throw new Error(`Sản phẩm ${item.productName} không tồn tại!`);
      }
      
      const currentStock = productSnap.data().stock || 0;
      if (currentStock < item.quantity) {
        throw new Error(`Sản phẩm ${item.productName} vừa mới hết hàng hoặc không đủ số lượng (Chỉ còn ${currentStock}).`);
      }
    }

    // 2. Trừ tồn kho
    for (const item of orderData.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      transaction.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: serverTimestamp()
      });
    }

    // 3. Tạo document đơn hàng
    const orderRef = doc(collection(db, COLLECTION_NAME));
    transaction.set(orderRef, {
      ...orderData,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return orderRef.id;
  });
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

// ---- Lấy đơn hàng theo Shipper ----
export const getOrdersByShipper = async (shipperId) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("shipperId", "==", shipperId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ---- Phân công Shipper cho đơn hàng ----
export const assignOrderToShipper = async (orderId, shipperId, shipperName) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(docRef, {
    shipperId,
    shipperName: shipperName || '',
    status: "confirmed",
    updatedAt: serverTimestamp(),
  });
};
