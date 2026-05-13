import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase.Config';

export const NOTIFICATIONS_COLLECTION = 'notifications';

export const NOTIFICATION_AUDIENCE = {
  ALL: 'all',
  ADMIN: 'admin',
  USER: 'user',
};

export const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  CHAT_REPLIED: 'chat_replied',
  SYSTEM: 'system',
};

const sanitizeText = (value = '', maxLength = 240) => String(value ?? '').trim().slice(0, maxLength);
const sanitizeAudience = (value = NOTIFICATION_AUDIENCE.ALL) => Object.values(NOTIFICATION_AUDIENCE).includes(value) ? value : NOTIFICATION_AUDIENCE.ALL;
const sanitizeMeta = (meta = {}) => (meta && typeof meta === 'object' ? meta : {});

export const createNotification = async ({
  type = NOTIFICATION_TYPES.SYSTEM,
  title,
  message,
  audience = NOTIFICATION_AUDIENCE.ALL,
  userId = null,
  targetId = null,
  actorId = null,
  actorName = '',
  meta = {},
}) => {
  const payload = {
    type,
    title: sanitizeText(title, 120),
    message: sanitizeText(message, 240),
    audience: sanitizeAudience(audience),
    userId: userId ? String(userId).trim() : null,
    targetId: targetId ? String(targetId).trim() : null,
    actorId: actorId ? String(actorId).trim() : null,
    actorName: sanitizeText(actorName, 80),
    meta: sanitizeMeta(meta),
    isRead: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), payload);
  return docRef.id;
};

export const markNotificationsAsRead = async (notificationIds = []) => {
  const ids = Array.from(new Set(notificationIds.map((id) => String(id).trim()).filter(Boolean)));
  if (!ids.length) return 0;

  const batch = writeBatch(db);
  ids.forEach((id) => {
    batch.update(doc(db, NOTIFICATIONS_COLLECTION, id), { isRead: true, readAt: serverTimestamp() });
  });
  await batch.commit();
  return ids.length;
};

const mapNotifications = (snapshot) => snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

const filterByAudience = (items, audiences) => items.filter((item) => audiences.includes(item.audience));

export const getNotificationsByUser = async (userId, limitCount = 20) => {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return [];

  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', safeUserId),
    orderBy('createdAt', 'desc'),
    limit(limitCount * 3)
  );
  const snapshot = await getDocs(q);
  return filterByAudience(mapNotifications(snapshot), [NOTIFICATION_AUDIENCE.ALL, NOTIFICATION_AUDIENCE.USER]).slice(0, limitCount);
};

export const getAdminNotifications = async (limitCount = 30) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('audience', 'in', [NOTIFICATION_AUDIENCE.ALL, NOTIFICATION_AUDIENCE.ADMIN]),
    orderBy('createdAt', 'desc'),
    limit(limitCount * 3)
  );
  const snapshot = await getDocs(q);
  return filterByAudience(mapNotifications(snapshot), [NOTIFICATION_AUDIENCE.ALL, NOTIFICATION_AUDIENCE.ADMIN]).slice(0, limitCount);
};
