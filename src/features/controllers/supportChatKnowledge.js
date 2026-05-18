import { getAllProducts } from './productService';
import { getOrderById, getOrdersByUser } from './orderService';
import { formatCurrency, formatChatTimestamp, normalizeText } from './supportChatUtils';

const AI_ROUTING_KEYWORDS = [
  'admin', 'nhân viên', 'hỗ trợ', 'khiếu nại', 'hoàn tiền', 'đổi món', 'đổi trả',
  'lỗi', 'sai đơn', 'không nhận được', 'giao chậm', 'thanh toán', 'hoá đơn', 'hóa đơn',
  'đơn hàng', 'trả hàng', 'gặp admin', 'liên hệ admin', 'người thật', 'tư vấn viên',
  'chuyển người thật', 'gọi admin', 'hỗ trợ trực tiếp',
];

export const INTENT_TYPES = {
  AI: 'ai',
  ADMIN: 'admin',
  SYSTEM: 'system',
};

const shouldRouteToAdmin = (text = '') => {
  const value = normalizeText(text);
  if (!value) return false;
  return AI_ROUTING_KEYWORDS.some((keyword) => value.includes(keyword));
};

export const classifyIntent = (text = '') => {
  const value = normalizeText(text);
  if (!value) return INTENT_TYPES.SYSTEM;
  if (shouldRouteToAdmin(value)) return INTENT_TYPES.ADMIN;
  return INTENT_TYPES.AI;
};

const summarizeProducts = (products = [], limit = 5) =>
  products.slice(0, limit).map((product) => ({
    id: product.id,
    name: product.name || product.title || 'Sản phẩm',
    price: formatCurrency(product.price || product.salePrice || 0),
    rawPrice: Number(product.price || product.salePrice || 0),
    category: product.category || 'Khác',
    featured: Boolean(product.featured),
    discount: Number(product.discount || 0),
  }));

const summarizeOrders = (orders = [], limit = 3) =>
  orders.slice(0, limit).map((order) => ({
    id: order.id,
    status: ({
      PENDING: 'Chờ xử lý',
      WAITING_FOR_SHIPPER: 'Chờ shipper',
      CONFIRMED: 'Đã xác nhận',
      DELIVERING: 'Đang giao hàng',
      COMPLETED: 'Hoàn thành',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy',
    }[String(order.status).toUpperCase()] || order.status || 'Không rõ'),
    total: formatCurrency(order.totalAmount || order.total || 0),
    createdAt: formatChatTimestamp(order.createdAt),
    itemCount: Array.isArray(order.items) ? order.items.length : 0,
  }));

const formatOrderAnswerById = (order) => {
  if (!order) return 'Mình chưa tìm thấy đơn hàng theo mã bạn cung cấp.';
  const items = Array.isArray(order.items) ? order.items : [];
  const topItems = items.slice(0, 5).map((item) => `- ${item.productName || item.name || 'Sản phẩm'} x${item.quantity || 1}`).join('\n');
  return [
    `Thông tin đơn ${order.id}`,
    `- Trạng thái: ${({
      PENDING: 'Chờ xử lý',
      WAITING_FOR_SHIPPER: 'Chờ shipper',
      CONFIRMED: 'Đã xác nhận',
      DELIVERING: 'Đang giao hàng',
      COMPLETED: 'Hoàn thành',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy',
    }[String(order.status).toUpperCase()] || order.status || 'Không rõ')}`,
    `- Tổng tiền: ${formatCurrency(order.totalAmount || order.total || 0)}`,
    order.paymentStatus ? `- Thanh toán: ${order.paymentStatus}` : null,
    order.createdAt ? `- Tạo lúc: ${formatChatTimestamp(order.createdAt)}` : null,
    topItems ? `- Món trong đơn:\n${topItems}` : null,
  ].filter(Boolean).join('\n');
};

const formatRecentOrdersAnswer = (orders = []) => {
  if (!orders.length) return 'Mình chưa thấy đơn hàng nào của bạn trong hệ thống.';
  const lines = summarizeOrders(orders, 3)
    .map((order, index) => `${index + 1}. Đơn ${order.id}\n   Trạng thái: ${order.status}\n   Tổng tiền: ${order.total}${order.createdAt ? `\n   Cập nhật: ${order.createdAt}` : ''}`)
    .join('\n\n');
  return `Mình tìm thấy ${orders.length} đơn gần đây của bạn:\n\n${lines}`;
};

const formatProductAnswer = (products = [], queryText = '') => {
  if (!products.length) return 'Mình chưa thấy sản phẩm nào trong menu lúc này.';
  const value = normalizeText(queryText);
  const list = summarizeProducts(products, 5);
  const saleItems = products.filter((product) => Number(product.discount || 0) > 0 || (Number(product.salePrice || 0) > 0 && Number(product.salePrice || 0) < Number(product.price || 0)));
  const featuredItems = products.filter((product) => product.featured || product.isFeatured);

  const formatListBlock = (title, items) => {
    if (!items.length) return `${title}: chưa có dữ liệu nổi bật.`;
    return `${title}:\n${items.map((item, index) => `${index + 1}. ${item.name} • ${item.price}${item.category ? ` • ${item.category}` : ''}`).join('\n')}`;
  };

  if (value.includes('khuyen mai') || value.includes('giảm giá') || value.includes('giam gia')) {
    return [
      `Hiện có ${saleItems.length} sản phẩm đang ưu đãi.`,
      formatListBlock('Danh sách ưu đãi', summarizeProducts(saleItems, 5)),
    ].join('\n\n');
  }

  if (value.includes('hot') || value.includes('noi bat') || value.includes('nổi bật')) {
    return [
      `Hiện có ${featuredItems.length} sản phẩm nổi bật.`,
      formatListBlock('Danh sách nổi bật', summarizeProducts(featuredItems, 5)),
    ].join('\n\n');
  }

  return [
    `Mình đang có ${products.length} sản phẩm trong menu.`,
    formatListBlock('Một vài món tiêu biểu', list),
  ].join('\n\n');
};

export const resolveKnowledge = async ({ text, userId }) => {
  const value = normalizeText(text);

  if (value.includes('don') || value.includes('order') || value.includes('trang thai') || value.includes('trạng thái') || value.includes('my order')) {
    const orderCodeMatch = value.match(/\b[a-zA-Z0-9_-]{8,}\b/);
    if (orderCodeMatch) {
      const orderId = orderCodeMatch[0];
      try {
        const order = await getOrderById(orderId);
        return { type: 'order', data: order, summary: formatOrderAnswerById(order) };
      } catch {
        return { type: 'order', data: null, summary: 'Mình chưa tìm thấy đơn hàng theo mã bạn cung cấp.' };
      }
    }

    if (userId) {
      try {
        const orders = await getOrdersByUser(userId);
        return { type: 'order', data: orders, summary: formatRecentOrdersAnswer(orders) };
      } catch {
        return { type: 'order', data: null, summary: 'Mình chưa đọc được lịch sử đơn hàng của bạn lúc này.' };
      }
    }
  }

  if (value.includes('mon') || value.includes('menu') || value.includes('san pham') || value.includes('sản phẩm') || value.includes('khuyen mai') || value.includes('giảm giá') || value.includes('giam gia') || value.includes('hot')) {
    try {
      const products = await getAllProducts();
      return { type: 'menu', data: products, summary: formatProductAnswer(products, value) };
    } catch {
      return { type: 'menu', data: null, summary: 'Mình chưa đọc được dữ liệu menu từ Firebase lúc này.' };
    }
  }

  return null;
};
