// orderHelpers.js - Các hàm tiện ích cho xử lý và hiển thị dữ liệu đơn hàng.
// File này giúp map snapshot, sắp xếp theo thời gian và format text ngắn gọn cho UI.

const toTimestamp = (value) => value?.toDate?.()?.getTime?.() || 0;

export const mapSnapshot = (snapshot = { docs: [] }) =>
  snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

export const sortByCreatedAtDesc = (list = []) =>
  [...list].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

export const formatRelativeTime = (createdAt) => {
  const date = createdAt?.toDate?.();
  if (!date) return '';

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ trước`;

  return `${Math.floor(diffMinutes / 1440)} ngày trước`;
};

export const formatItemsSummary = (items = []) =>
  items
    .map((item) => `${item.quantity || 0}x ${item.productName || 'Sản phẩm'}`)
    .filter(Boolean)
    .join(', ');
