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

const ORDER_STATUS_SET = new Set(Object.values(ORDER_STATUS));
const PAYMENT_STATUS_SET = new Set(Object.values(PAYMENT_STATUS));
const PAYMENT_METHOD_SET = new Set(Object.values(PAYMENT_METHOD));
const PAYMENT_PROVIDER_SET = new Set(Object.values(PAYMENT_PROVIDER));

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
const normalizeOrderType = (type) => (type === 'DINE_IN' ? 'DINE_IN' : 'DELIVERY');

const ORDER_STATUS_TRANSITIONS_BY_TYPE = {
  DELIVERY: {
    [ORDER_STATUS.PENDING]: new Set([ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED, ORDER_STATUS.FAILED]),
    [ORDER_STATUS.WAITING_FOR_SHIPPER]: new Set([ORDER_STATUS.CONFIRMED, ORDER_STATUS.FAILED]),
    [ORDER_STATUS.CONFIRMED]: new Set([ORDER_STATUS.DELIVERING, ORDER_STATUS.FAILED]),
    [ORDER_STATUS.DELIVERING]: new Set([ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED]),
    [ORDER_STATUS.COMPLETED]: new Set(),
    [ORDER_STATUS.CANCELLED]: new Set(),
    [ORDER_STATUS.FAILED]: new Set(),
  },
  DINE_IN: {
    [ORDER_STATUS.PENDING]: new Set([ORDER_STATUS.CONFIRMED, ORDER_STATUS.FAILED]),
    [ORDER_STATUS.CONFIRMED]: new Set([ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED]),
    [ORDER_STATUS.COMPLETED]: new Set(),
    [ORDER_STATUS.CANCELLED]: new Set(),
    [ORDER_STATUS.FAILED]: new Set(),
  },
};

const canTransitionOrderStatus = (orderType, currentStatus, nextStatus) => {
  const type = normalizeOrderType(orderType);
  const mapByType = ORDER_STATUS_TRANSITIONS_BY_TYPE[type] || ORDER_STATUS_TRANSITIONS_BY_TYPE.DELIVERY;
  const allowed = mapByType[currentStatus];
  return Boolean(allowed && allowed.has(nextStatus));
};

const normalizeActorRole = (actorRole) => {
  const role = String(actorRole || 'staff').trim().toLowerCase();
  if (role === 'manager') return 'admin';
  if (role === 'employee') return 'staff';
  return role;
};

const appendStatusHistory = (orderData, fromStatus, toStatus, actor = 'system', note = '') => {
  const safeActor = normalizeActorRole(actor);
  const safeNote = String(note || '').trim().slice(0, 200);
  const currentHistory = Array.isArray(orderData.statusHistory) ? orderData.statusHistory : [];

  return [
    ...currentHistory,
    {
      from: fromStatus,
      to: toStatus,
      actor: safeActor,
      note: safeNote,
      at: new Date().toISOString(),
    },
  ];
};

const TRANSITION_ACTOR_RULES = {
  [ORDER_STATUS.CONFIRMED]: new Set(['admin', 'staff']),
  [ORDER_STATUS.WAITING_FOR_SHIPPER]: new Set(['admin', 'staff']),
  [ORDER_STATUS.DELIVERING]: new Set(['shipper', 'admin']),
  [ORDER_STATUS.COMPLETED]: new Set(['waiter', 'shipper', 'admin']),
  [ORDER_STATUS.FAILED]: new Set(['admin', 'staff', 'shipper']),
};

const assertActorCanSetStatus = (actorRole, nextStatus) => {
  const role = normalizeActorRole(actorRole);
  const allowed = TRANSITION_ACTOR_RULES[nextStatus];

  if (!allowed) throw new Error('Không có cấu hình quyền cho trạng thái đích!');
  if (!allowed.has(role)) throw new Error(`Vai trò ${role} không có quyền chuyển sang ${nextStatus}!`);

  return role;
};

const notifyOrderStatusChanged = async ({ orderId, orderData, fromStatus, toStatus, actorRole }) => {
  const userId = String(orderData.userId || '').trim() || null;
  const role = normalizeActorRole(actorRole);
  const orderCode = String(orderId).slice(-8).toUpperCase();
  const statusTextMap = {
    [ORDER_STATUS.CONFIRMED]: 'đang chuẩn bị',
    [ORDER_STATUS.DELIVERING]: 'đang giao',
    [ORDER_STATUS.COMPLETED]: 'đã hoàn thành',
    [ORDER_STATUS.CANCELLED]: 'đã hủy',
    [ORDER_STATUS.WAITING_FOR_SHIPPER]: 'đang chờ shipper',
    [ORDER_STATUS.FAILED]: 'đã thất bại',
  };
  const statusText = statusTextMap[toStatus] || toStatus;

  await Promise.allSettled([
    createNotification({
      type: toStatus === ORDER_STATUS.CANCELLED ? NOTIFICATION_TYPES.ORDER_CANCELLED : NOTIFICATION_TYPES.ORDER_UPDATED,
      title: `Đơn #${orderCode} cập nhật trạng thái`,
      message: `Đơn hàng của bạn hiện ${statusText}.`,
      audience: 'user',
      userId,
      targetId: orderId,
      actorId: role,
      actorName: role,
      meta: { orderId, fromStatus, toStatus },
    }),
    createNotification({
      type: toStatus === ORDER_STATUS.CANCELLED ? NOTIFICATION_TYPES.ORDER_CANCELLED : NOTIFICATION_TYPES.ORDER_UPDATED,
      title: `Đơn #${orderCode} chuyển ${fromStatus} → ${toStatus}`,
      message: `Vai trò ${role} đã cập nhật trạng thái đơn.`,
      audience: 'admin',
      targetId: orderId,
      actorId: role,
      actorName: role,
      meta: { orderId, fromStatus, toStatus },
    }),
  ]);
};

export const createOrder = async (orderData) => {
  return await runTransaction(db, async (transaction) => {
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    let backendSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) throw new Error(`Sản phẩm ${item.productName} không tồn tại!`);

      const productData = productSnap.data();
      const currentStock = productData.stock || 0;

      if (currentStock < item.quantity) {
        throw new Error(`Sản phẩm ${item.productName} vừa mới hết hàng hoặc không đủ số lượng (Chỉ còn ${currentStock}).`);
      }

      const price = productData.price || 0;
      backendSubtotal += price * item.quantity;
      validatedItems.push({ ...item, price });

      transaction.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: serverTimestamp(),
      });
    }

    let backendDiscountAmount = 0;
    if (orderData.couponId && orderData.couponCode) {
      const couponRef = doc(db, 'coupons', orderData.couponId);
      const couponSnap = await transaction.get(couponRef);

      if (couponSnap.exists()) {
        const couponData = couponSnap.data();
        if (couponData.isActive && couponData.code === orderData.couponCode) {
          if (couponData.minOrderValue && backendSubtotal < couponData.minOrderValue) {
            throw new Error('Đơn hàng không đủ điều kiện áp dụng mã giảm giá này!');
          }
          backendDiscountAmount =
            couponData.discountType === 'percent'
              ? Math.round(backendSubtotal * (couponData.discountValue / 100))
              : couponData.discountValue;
          backendDiscountAmount = Math.min(backendDiscountAmount, backendSubtotal);
        } else {
          throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
        }
      }
    }

    const backendTotalAmount = backendSubtotal - backendDiscountAmount;
    const orderRef = doc(collection(db, COLLECTION_NAME));
    const initialStatus = orderData.type === 'DINE_IN' ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING;

    const paymentMethod = normalizePaymentMethod(orderData.paymentMethod);
    const paymentProvider = normalizePaymentProvider(orderData.paymentProvider);
    const paymentStatus =
      paymentMethod === PAYMENT_METHOD.VNPAY && orderData.paymentStatus !== PAYMENT_STATUS.PAID
        ? PAYMENT_STATUS.PENDING
        : normalizePaymentStatus(orderData.paymentStatus);

    const sanitizedOrderData = {
      ...orderData,
      userId: String(orderData.userId || '').trim(),
      userName: String(orderData.userName || '').trim().slice(0, 60),
      phone: String(orderData.phone || '').trim().slice(0, 20),
      address: String(orderData.address || '').trim().slice(0, 250),
      note: String(orderData.note || '').trim().slice(0, 500),
      type: String(orderData.type || '').trim(),
      items: validatedItems,
      subtotal: backendSubtotal,
      discountAmount: backendDiscountAmount,
      totalAmount: backendTotalAmount,
      status: normalizeOrderStatus(initialStatus),
      paymentMethod,
      paymentStatus,
      paymentProvider,
    };

    transaction.set(orderRef, {
      ...sanitizedOrderData,
      tableVacated: sanitizedOrderData.type === 'DINE_IN' ? false : null,
      tableVacatedAt: null,
      statusHistory: [
        {
          from: null,
          to: sanitizedOrderData.status,
          actor: 'system',
          note: 'Tạo đơn hàng',
          at: new Date().toISOString(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const orderId = orderRef.id;

    createNotification({
      type: NOTIFICATION_TYPES.ORDER_CREATED,
      title: 'Đơn hàng mới đã được tạo',
      message: `Đơn ${String(orderId).slice(-8).toUpperCase()} với tổng ${backendTotalAmount.toLocaleString('vi-VN')}₫ đã được tạo.`,
      audience: 'admin',
      targetId: orderId,
      userId: sanitizedOrderData.userId,
      actorId: sanitizedOrderData.userId,
      actorName: sanitizedOrderData.userName,
      meta: { orderId, total: backendTotalAmount },
    }).catch((error) => console.error('Failed to create order notification', error));

    return orderId;
  });
};

export const cancelOrder = async (orderId, cancelReason = 'Hủy đơn hàng', actorRole = 'admin') => {
  const actor = normalizeActorRole(actorRole);
  let orderDataForNotify = null;
  let fromStatus = ORDER_STATUS.PENDING;

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    if (orderData.status === ORDER_STATUS.CANCELLED || orderData.status === ORDER_STATUS.COMPLETED) {
      throw new Error('Không thể hủy đơn hàng đang ở trạng thái hiện tại!');
    }

    if (!['admin', 'staff'].includes(actor)) throw new Error('Bạn không có quyền hủy đơn hàng!');

    fromStatus = normalizeOrderStatus(orderData.status);
    const statusHistory = appendStatusHistory(orderData, fromStatus, ORDER_STATUS.CANCELLED, actor, cancelReason || 'Hủy đơn hàng');

    transaction.update(orderRef, {
      status: ORDER_STATUS.CANCELLED,
      cancelReason,
      statusHistory,
      updatedAt: serverTimestamp(),
    });

    orderDataForNotify = orderData;

    const items = Array.isArray(orderData.items) ? orderData.items : [];
    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      transaction.update(productRef, {
        stock: increment(item.quantity),
        updatedAt: serverTimestamp(),
      });
    }
  });

  if (orderDataForNotify) {
    notifyOrderStatusChanged({
      orderId,
      orderData: orderDataForNotify,
      fromStatus,
      toStatus: ORDER_STATUS.CANCELLED,
      actorRole: actor,
    }).catch((error) => console.error('Failed to notify cancel order status', error));
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  await updateOrderDoc(orderId, { paymentStatus: normalizePaymentStatus(paymentStatus) });
};

export const getOrderById = async (orderId) => {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  const snapshot = await getDoc(docRef);
  return getDocDataOrThrow(snapshot, 'Đơn hàng không tồn tại!');
};

export const getOrdersByUser = async (userId) => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const getAllOrders = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const updateOrderStatus = async (orderId, status, actorRole = 'staff') => {
  const normStatus = normalizeOrderStatus(status);
  if (normStatus !== status) throw new Error('Trạng thái đơn hàng không hợp lệ!');
  if (normStatus === ORDER_STATUS.CANCELLED) {
    throw new Error('Vui lòng sử dụng hàm cancelOrder() để hủy đơn hàng và hoàn trả tồn kho!');
  }

  const actor = assertActorCanSetStatus(actorRole, normStatus);
  let fromStatus = ORDER_STATUS.PENDING;
  let orderDataForNotify = null;

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    const currentStatus = normalizeOrderStatus(orderData.status);
    const orderType = normalizeOrderType(orderData.type);

    if (currentStatus === normStatus) return;

    if (!canTransitionOrderStatus(orderType, currentStatus, normStatus)) {
      throw new Error(`Không thể chuyển trạng thái từ ${currentStatus} sang ${normStatus} cho đơn ${orderType}!`);
    }

    const statusHistory = appendStatusHistory(orderData, currentStatus, normStatus, actor, 'Cập nhật trạng thái đơn');

    transaction.update(orderRef, {
      status: normStatus,
      statusHistory,
      updatedAt: serverTimestamp(),
    });

    fromStatus = currentStatus;
    orderDataForNotify = orderData;
  });

  if (orderDataForNotify) {
    notifyOrderStatusChanged({
      orderId,
      orderData: orderDataForNotify,
      fromStatus,
      toStatus: normStatus,
      actorRole: actor,
    }).catch((error) => console.error('Failed to notify order status changed', error));
  }
};

export const getOrdersByShipper = async (shipperId) => {
  const q = query(collection(db, COLLECTION_NAME), where('shipperId', '==', shipperId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return mapDocs(snapshot);
};

export const markTableVacated = async (orderId, actorRole = 'waiter') => {
  const actor = normalizeActorRole(actorRole);
  if (!['waiter', 'admin', 'staff'].includes(actor)) {
    throw new Error('Bạn không có quyền xác nhận khách đã về!');
  }

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    if (orderData.type !== 'DINE_IN') {
      throw new Error('Chỉ đơn ăn tại quán mới có thao tác khách đã về!');
    }

    if (normalizeOrderStatus(orderData.status) !== ORDER_STATUS.COMPLETED) {
      throw new Error('Đơn chưa hoàn tất thanh toán, chưa thể xác nhận khách đã về!');
    }

    if (orderData.tableVacated === true) {
      return;
    }

    const statusHistory = appendStatusHistory(
      orderData,
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.COMPLETED,
      actor,
      'Khách đã rời bàn'
    );

    transaction.update(orderRef, {
      tableVacated: true,
      tableVacatedAt: serverTimestamp(),
      statusHistory,
      updatedAt: serverTimestamp(),
    });
  });
};

export const claimDeliveryOrder = async (orderId, shipperId, shipperName) => {
  if (!shipperId) throw new Error('Thiếu thông tin shipper!');

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    if (normalizeOrderType(orderData.type) !== 'DELIVERY') {
      throw new Error('Chỉ đơn giao hàng mới có thể nhận bởi shipper!');
    }

    const currentStatus = normalizeOrderStatus(orderData.status);
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.WAITING_FOR_SHIPPER].includes(currentStatus)) {
      throw new Error('Đơn không còn ở trạng thái có thể nhận!');
    }

    const statusHistory = appendStatusHistory(orderData, currentStatus, ORDER_STATUS.CONFIRMED, 'shipper', 'Shipper nhận đơn');

    transaction.update(orderRef, {
      shipperId,
      shipperName: shipperName || 'Shipper',
      status: ORDER_STATUS.CONFIRMED,
      statusHistory,
      updatedAt: serverTimestamp(),
    });
  });
};

export const startDeliveringOrder = async (orderId, shipperId) => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    if (orderData.shipperId !== shipperId) {
      throw new Error('Bạn không được phép thao tác đơn của shipper khác!');
    }

    if (normalizeOrderStatus(orderData.status) !== ORDER_STATUS.CONFIRMED) {
      throw new Error('Đơn chưa ở trạng thái đã nhận!');
    }

    const statusHistory = appendStatusHistory(orderData, ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING, 'shipper', 'Bắt đầu giao hàng');

    transaction.update(orderRef, {
      status: ORDER_STATUS.DELIVERING,
      statusHistory,
      updatedAt: serverTimestamp(),
    });
  });
};

export const completeDeliveryOrder = async (orderId, shipperId) => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    if (orderData.shipperId !== shipperId) {
      throw new Error('Bạn không được phép thao tác đơn của shipper khác!');
    }

    if (normalizeOrderStatus(orderData.status) !== ORDER_STATUS.DELIVERING) {
      throw new Error('Đơn chưa ở trạng thái đang giao!');
    }

    const statusHistory = appendStatusHistory(orderData, ORDER_STATUS.DELIVERING, ORDER_STATUS.COMPLETED, 'shipper', 'Giao hàng thành công');

    transaction.update(orderRef, {
      status: ORDER_STATUS.COMPLETED,
      statusHistory,
      updatedAt: serverTimestamp(),
    });
  });
};

export const assignOrderToShipper = async (orderId, shipperId, shipperName, actorRole = 'admin') => {
  const actor = normalizeActorRole(actorRole);
  if (!['admin', 'staff'].includes(actor)) {
    throw new Error('Bạn không có quyền gán shipper cho đơn hàng!');
  }

  let orderDataForNotify = null;

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');

    const orderData = orderSnap.data();
    if (orderData.status !== ORDER_STATUS.WAITING_FOR_SHIPPER) {
      throw new Error('Đơn hàng đã được nhận bởi người khác hoặc không còn chờ giao!');
    }

    const statusHistory = appendStatusHistory(orderData, ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED, actor, 'Gán shipper');

    transaction.update(orderRef, {
      shipperId,
      shipperName: shipperName || '',
      status: ORDER_STATUS.CONFIRMED,
      statusHistory,
      updatedAt: serverTimestamp(),
    });

    orderDataForNotify = orderData;
  });

  const orderCode = String(orderId).slice(-8).toUpperCase();
  await Promise.allSettled([
    createNotification({
      type: NOTIFICATION_TYPES.ORDER_ASSIGNED,
      title: `Đơn #${orderCode} đã được gán shipper`,
      message: `Đơn hàng đang được chuẩn bị giao.`,
      audience: 'admin',
      targetId: orderId,
      actorId: actor,
      actorName: actor,
      meta: { orderId, shipperId, shipperName: shipperName || '' },
    }),
    orderDataForNotify
      ? notifyOrderStatusChanged({
          orderId,
          orderData: orderDataForNotify,
          fromStatus: ORDER_STATUS.WAITING_FOR_SHIPPER,
          toStatus: ORDER_STATUS.CONFIRMED,
          actorRole: actor,
        })
      : Promise.resolve(),
  ]);
};
