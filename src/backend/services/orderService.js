import {
  collection,
  doc,
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
import { getDocDataOrThrow, mapDocs } from "./firestoreHelpers";

export const ORDER_STATUS = {
  PENDING: "PENDING",
  WAITING_FOR_SHIPPER: "WAITING_FOR_SHIPPER",
  CONFIRMED: "CONFIRMED",
  DELIVERING: "DELIVERING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
};

export const PAYMENT_METHOD = {
  COD: "COD",
};

export const PAYMENT_PROVIDER = {
  LOCAL: "LOCAL",
};

export const COLLECTION_NAME = "orders";
export const PRODUCTS_COLLECTION = "products";

const ensureProductStock = async (transaction, item) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
  const productSnap = await transaction.get(productRef);

  if (!productSnap.exists()) {
    throw new Error(`Sản phẩm ${item.productName} không tồn tại!`);
  }

  const currentStock = productSnap.data().stock || 0;
  if (currentStock < item.quantity) {
    throw new Error(`Sản phẩm ${item.productName} vừa mới hết hàng hoặc không đủ số lượng (Chỉ còn ${currentStock}).`);
  }
};

const decrementProductStock = (transaction, item) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
  transaction.update(productRef, {
    stock: increment(-item.quantity),
    updatedAt: serverTimestamp(),
  });
};

const updateOrderDoc = async (orderId, data) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const createOrder = async (orderData) => {
  return await runTransaction(db, async (transaction) => {
    for (const item of orderData.items) {
      await ensureProductStock(transaction, item);
    }

    for (const item of orderData.items) {
      decrementProductStock(transaction, item);
    }

    const orderRef = doc(collection(db, COLLECTION_NAME));
    const initialStatus = orderData.type === "DINE_IN" ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING;

    transaction.set(orderRef, {
      ...orderData,
      status: initialStatus,
      paymentStatus: orderData.paymentStatus || PAYMENT_STATUS.UNPAID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return orderRef.id;
  });
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  await updateOrderDoc(orderId, { paymentStatus });
};

export const getOrderById = async (orderId) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  const snapshot = await getDoc(docRef);
  return getDocDataOrThrow(snapshot, "Đơn hàng không tồn tại!");
};

export const getOrdersByUser = async (userId) => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const getAllOrders = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const updateOrderStatus = async (orderId, status) => {
  await updateOrderDoc(orderId, { status });
};

export const getOrdersByShipper = async (shipperId) => {
  const q = query(collection(db, COLLECTION_NAME), where("shipperId", "==", shipperId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const assignOrderToShipper = async (orderId, shipperId, shipperName) => {
  await updateOrderDoc(orderId, {
    shipperId,
    shipperName: shipperName || "",
    status: ORDER_STATUS.CONFIRMED,
  });
};
