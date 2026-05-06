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
import { db } from "../../firebase/firebase.Config";
import { getDocDataOrThrow, mapDocs } from "./firestoreHelpers";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
} from "../models/Order.model";

export const COLLECTION_NAME = "orders";
export const PRODUCTS_COLLECTION = "products";

const ORDER_STATUS_SET = new Set(Object.values(ORDER_STATUS));
const PAYMENT_STATUS_SET = new Set(Object.values(PAYMENT_STATUS));
const PAYMENT_METHOD_SET = new Set(Object.values(PAYMENT_METHOD));
const PAYMENT_PROVIDER_SET = new Set(Object.values(PAYMENT_PROVIDER));

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

const normalizeOrderStatus = (status) => (ORDER_STATUS_SET.has(status) ? status : ORDER_STATUS.PENDING);
const normalizePaymentStatus = (status) => (PAYMENT_STATUS_SET.has(status) ? status : PAYMENT_STATUS.UNPAID);
const normalizePaymentMethod = (method) => (PAYMENT_METHOD_SET.has(method) ? method : PAYMENT_METHOD.COD);
const normalizePaymentProvider = (provider) => (PAYMENT_PROVIDER_SET.has(provider) ? provider : PAYMENT_PROVIDER.LOCAL);

export const createOrder = async (orderData) => {
  return await runTransaction(db, async (transaction) => {
    const items = Array.isArray(orderData.items) ? orderData.items : [];

    for (const item of items) {
      await ensureProductStock(transaction, item);
    }

    for (const item of items) {
      decrementProductStock(transaction, item);
    }

    const orderRef = doc(collection(db, COLLECTION_NAME));
    const initialStatus = orderData.type === "DINE_IN" ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING;
    const paymentMethod = normalizePaymentMethod(orderData.paymentMethod);
    const paymentProvider = normalizePaymentProvider(orderData.paymentProvider);
    const paymentStatus =
      paymentMethod === PAYMENT_METHOD.VNPAY && orderData.paymentStatus !== PAYMENT_STATUS.PAID
        ? PAYMENT_STATUS.PENDING
        : normalizePaymentStatus(orderData.paymentStatus);

    transaction.set(orderRef, {
      ...orderData,
      items,
      status: normalizeOrderStatus(initialStatus),
      paymentMethod,
      paymentStatus,
      paymentProvider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return orderRef.id;
  });
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  await updateOrderDoc(orderId, { paymentStatus: normalizePaymentStatus(paymentStatus) });
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
  await updateOrderDoc(orderId, { status: normalizeOrderStatus(status) });
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
