// orderService.js - Tầng truy cập dữ liệu cho đơn hàng.
// File này lo toàn bộ CRUD đơn hàng, kiểm tra tồn kho, cập nhật trạng thái,
// gán shipper và phát thông báo khi có đơn mới.
//
// Tất cả hàm quan trọng đều được bọc bằng Firestore transaction hoặc helper normalize
// để đảm bảo dữ liệu đơn hàng nhất quán và tránh lưu trạng thái sai.

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
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.Config';
import { getDocDataOrThrow, mapDocs } from './firestoreHelpers';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
} from '../models/Order.model';
import { createNotification, NOTIFICATION_TYPES } from './notificationService';

export const COLLECTION_NAME = 'orders';
export const PRODUCTS_COLLECTION = 'products';

// Các Set này dùng để kiểm tra nhanh trạng thái đầu vào có hợp lệ hay không.
// Nhờ vậy các hàm normalize bên dưới có thể trả về giá trị mặc định an toàn nếu dữ liệu sai.
const ORDER_STATUS_SET = new Set(Object.values(ORDER_STATUS));
const PAYMENT_STATUS_SET = new Set(Object.values(PAYMENT_STATUS));
const PAYMENT_METHOD_SET = new Set(Object.values(PAYMENT_METHOD));
const PAYMENT_PROVIDER_SET = new Set(Object.values(PAYMENT_PROVIDER));

// Hàm kiểm tra tồn kho của từng sản phẩm trong transaction.
// Input: transaction Firestore và một item trong giỏ.
// Output: không trả về gì, nhưng sẽ throw lỗi nếu sản phẩm không tồn tại hoặc không đủ số lượng.
// Lý do dùng transaction là để đọc stock nhất quán trước khi trừ hàng.
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

// Hàm trừ số lượng tồn kho sau khi đã kiểm tra đủ hàng.
// Input: transaction Firestore và item đặt hàng.
// Side effect: cập nhật trực tiếp field `stock` và `updatedAt` của sản phẩm.
const decrementProductStock = (transaction, item) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
  transaction.update(productRef, {
    stock: increment(-item.quantity),
    updatedAt: serverTimestamp(),
  });
};

// Hàm cập nhật một document đơn hàng và luôn gắn lại `updatedAt`.
// Input: orderId và object dữ liệu cần cập nhật.
// Side effect: ghi trực tiếp vào Firestore collection `orders`.
const updateOrderDoc = async (orderId, data) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Các hàm normalize này đảm bảo dữ liệu đầu vào luôn rơi về giá trị hợp lệ.
// Chúng giúp tránh việc lưu trạng thái sai vào Firestore khi caller truyền dữ liệu lỗi.
const normalizeOrderStatus = (status) => (ORDER_STATUS_SET.has(status) ? status : ORDER_STATUS.PENDING);
const normalizePaymentStatus = (status) => (PAYMENT_STATUS_SET.has(status) ? status : PAYMENT_STATUS.UNPAID);
const normalizePaymentMethod = (method) => (PAYMENT_METHOD_SET.has(method) ? method : PAYMENT_METHOD.COD);
const normalizePaymentProvider = (provider) => (PAYMENT_PROVIDER_SET.has(provider) ? provider : PAYMENT_PROVIDER.LOCAL);

// Tạo đơn hàng mới.
// Hàm này chạy trong Firestore transaction để đảm bảo:
// 1) kiểm tra đủ tồn kho cho tất cả sản phẩm
// 2) trừ kho atomically
// 3) lưu đơn hàng với dữ liệu đã chuẩn hóa
// 4) tạo notification cho admin
// Input: orderData chứa items, user info, payment info và metadata đơn.
// Output: trả về `orderId` vừa tạo.
export const createOrder = async (orderData) => {
  return await runTransaction(db, async (transaction) => {
    const items = Array.isArray(orderData.items) ? orderData.items : [];

    // Bước 1: kiểm tra tồn kho trước để tránh trừ hàng khi có sản phẩm hết.
    for (const item of items) {
      await ensureProductStock(transaction, item);
    }

    // Bước 2: trừ kho cho từng sản phẩm sau khi đã xác nhận đủ hàng.
    for (const item of items) {
      decrementProductStock(transaction, item);
    }

    const orderRef = doc(collection(db, COLLECTION_NAME));
    const initialStatus = orderData.type === 'DINE_IN' ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING;

    const paymentMethod = normalizePaymentMethod(orderData.paymentMethod);
    const paymentProvider = normalizePaymentProvider(orderData.paymentProvider);
    const paymentStatus =
      paymentMethod === PAYMENT_METHOD.VNPAY && orderData.paymentStatus !== PAYMENT_STATUS.PAID
        ? PAYMENT_STATUS.PENDING
        : normalizePaymentStatus(orderData.paymentStatus);

    // Chuẩn hóa dữ liệu đầu vào trước khi ghi vào DB.
    const sanitizedOrderData = {
      ...orderData,
      userId: String(orderData.userId || '').trim(),
      userName: String(orderData.userName || '').trim().slice(0, 60),
      phone: String(orderData.phone || '').trim().slice(0, 20),
      address: String(orderData.address || '').trim().slice(0, 250),
      note: String(orderData.note || '').trim().slice(0, 500),
      type: String(orderData.type || '').trim(),
      items,
      status: normalizeOrderStatus(initialStatus),
      paymentMethod,
      paymentStatus,
      paymentProvider,
    };

    // Ghi đơn hàng mới vào Firestore.
    transaction.set(orderRef, {
      ...sanitizedOrderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const orderId = orderRef.id;
    const orderTotal = Number(sanitizedOrderData.totalAmount || sanitizedOrderData.total || 0);

    // Tạo notification không chặn luồng chính.
    // Nếu notification lỗi thì log ra console, nhưng không làm fail việc tạo đơn.
    createNotification({
      type: NOTIFICATION_TYPES.ORDER_CREATED,
      title: 'Đơn hàng mới đã được tạo',
      message: `Đơn ${String(orderId).slice(-8).toUpperCase()} với tổng ${orderTotal.toLocaleString('vi-VN')}₫ đã được tạo.`,
      audience: 'admin',
      targetId: orderId,
      userId: sanitizedOrderData.userId,
      actorId: sanitizedOrderData.userId,
      actorName: sanitizedOrderData.userName,
      meta: { orderId, total: orderTotal },
    }).catch((error) => console.error('Failed to create order notification', error));

    return orderId;
  });
};

// Cập nhật trạng thái thanh toán của một đơn.
// Hàm này chỉ normalize trạng thái trước khi ghi để tránh payment status sai định dạng.
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  await updateOrderDoc(orderId, { paymentStatus: normalizePaymentStatus(paymentStatus) });
};

// Lấy chi tiết một đơn theo ID.
// Input: orderId.
// Output: object đơn hàng, hoặc throw lỗi nếu không tồn tại.
export const getOrderById = async (orderId) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  const snapshot = await getDoc(docRef);
  return getDocDataOrThrow(snapshot, "Đơn hàng không tồn tại!");
};

// Lấy danh sách đơn của một người dùng.
// Dữ liệu được sắp xếp theo `createdAt` giảm dần để đơn mới nhất nằm trên cùng.
export const getOrdersByUser = async (userId) => {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

// Lấy toàn bộ đơn hàng trong hệ thống.
// Đây thường là API cho trang admin quản lý đơn.
export const getAllOrders = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

// Cập nhật trạng thái xử lý của đơn hàng.
// Hàm này normalize trạng thái trước khi ghi để tránh lưu giá trị không hợp lệ.
export const updateOrderStatus = async (orderId, status) => {
  await updateOrderDoc(orderId, { status: normalizeOrderStatus(status) });
};

// Lấy danh sách đơn đang gán cho một shipper.
// Dùng cho màn hình shipper để xem các đơn được phân công.
export const getOrdersByShipper = async (shipperId) => {
  const q = query(collection(db, COLLECTION_NAME), where("shipperId", "==", shipperId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

// Gán đơn cho shipper.
// Side effect: cập nhật `shipperId`, `shipperName` và đẩy trạng thái về `CONFIRMED`.
export const assignOrderToShipper = async (orderId, shipperId, shipperName) => {
  await updateOrderDoc(orderId, {
    shipperId,
    shipperName: shipperName || "",
    status: ORDER_STATUS.CONFIRMED,
  });
};
