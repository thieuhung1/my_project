import { getAllProducts } from './productService';
import { getOrderById, getOrdersByUser } from './orderService';
import { normalizeText } from './supportChatUtils';

// Chỉ route sang admin khi thực sự cần người thật — không route các câu hỏi thông thường
const HARD_ADMIN_KEYWORDS = [
  'khieu nai', 'khiếu nại',
  'hoan tien', 'hoàn tiền',
  'doi tra', 'đổi trả',
  'sai don', 'sai đơn',
  'mat don', 'mất đơn',
  'gap admin', 'gặp admin',
  'nguoi that', 'người thật',
  'chuyen nguoi that', 'chuyển người thật',
  'goi admin', 'gọi admin',
  'ho tro truc tiep', 'hỗ trợ trực tiếp',
  'lien he admin', 'liên hệ admin',
  'tu van vien', 'tư vấn viên',
];

export const INTENT_TYPES = {
  AI: 'ai',
  ADMIN: 'admin',
  SYSTEM: 'system',
};

export const classifyIntent = (text = '') => {
  const value = normalizeText(text);
  if (!value) return INTENT_TYPES.SYSTEM;
  // Chỉ route admin khi match keyword cứng — để AI xử lý mọi thứ còn lại
  if (HARD_ADMIN_KEYWORDS.some((kw) => value.includes(kw))) return INTENT_TYPES.ADMIN;
  return INTENT_TYPES.AI;
};

// Phát hiện loại câu hỏi để fetch đúng dữ liệu cho AI
export const detectDataNeeds = (text = '') => {
  const v = normalizeText(text);
  const needs = { products: false, orders: false, orderId: null };

  // Hỏi về menu/món ăn
  if (
    v.includes('mon') || v.includes('menu') || v.includes('an gi') || v.includes('ăn gì') ||
    v.includes('san pham') || v.includes('sản phẩm') || v.includes('khuyen mai') ||
    v.includes('giam gia') || v.includes('giảm giá') || v.includes('hot') ||
    v.includes('ngon') || v.includes('gia') || v.includes('giá') || v.includes('bao nhieu') ||
    v.includes('bao nhiêu') || v.includes('combo') || v.includes('goi y') || v.includes('gợi ý')
  ) {
    needs.products = true;
  }

  // Hỏi về đơn hàng
  if (
    v.includes('don') || v.includes('đơn') || v.includes('order') ||
    v.includes('trang thai') || v.includes('trạng thái') || v.includes('giao hang') ||
    v.includes('giao hàng') || v.includes('lich su') || v.includes('lịch sử') ||
    v.includes('dang giao') || v.includes('đang giao') || v.includes('hoan thanh') ||
    v.includes('hoàn thành') || v.includes('cho xu ly') || v.includes('chờ xử lý')
  ) {
    needs.orders = true;
    // Tìm mã đơn cụ thể (8+ ký tự alphanumeric)
    const match = text.match(/\b[a-zA-Z0-9]{8,}\b/);
    if (match) needs.orderId = match[0];
  }

  return needs;
};

// Fetch dữ liệu thực từ Firebase để đưa vào context AI
export const fetchContextData = async ({ needs, userId }) => {
  const context = {};

  const fetches = [];

  if (needs.products) {
    fetches.push(
      getAllProducts()
        .then((products) => { context.products = products; })
        .catch(() => {})
    );
  }

  if (needs.orders) {
    if (needs.orderId) {
      fetches.push(
        getOrderById(needs.orderId)
          .then((order) => { context.singleOrder = order; })
          .catch(() => {})
      );
    } else if (userId && userId !== 'guest') {
      fetches.push(
        getOrdersByUser(userId)
          .then((orders) => { context.orders = orders; })
          .catch(() => {})
      );
    }
  }

  await Promise.all(fetches);
  return Object.keys(context).length > 0 ? context : null;
};
