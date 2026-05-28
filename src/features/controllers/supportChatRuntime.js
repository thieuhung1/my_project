import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// System prompt chi tiết — AI biết đầy đủ về FoodHub
const SYSTEM_PROMPT = `Bạn là trợ lý AI tên "Hubi" của FoodHub — ứng dụng đặt đồ ăn tại Nghệ An, Việt Nam.

## VAI TRÒ
Bạn là nhân viên tư vấn thông minh, nhiệt tình, am hiểu toàn bộ menu và quy trình đặt hàng.

## THÔNG TIN FOODHUB
- Giao hàng: nội thành TP Vinh, Nghệ An — miễn phí, 30-45 phút
- Ăn tại quán: chọn bàn (Bàn 1–20), đặt trước qua app
- Thanh toán: COD (tiền mặt khi nhận) hoặc VNPay (online)
- Mã giảm giá: nhập ở trang giỏ hàng trước khi đặt
- Trạng thái đơn: Chờ xử lý → Đã xác nhận → Đang giao → Hoàn thành

## PHONG CÁCH
- Xưng "em", gọi khách "anh/chị"
- Thân thiện, nhiệt tình như nhân viên phục vụ thật
- Ngắn gọn, đúng trọng tâm — tối đa 3-4 câu/tin nhắn
- Dùng emoji tự nhiên: 🍜🔥💰✅🎉 (không lạm dụng)
- Luôn kết thúc bằng câu hỏi hoặc gợi ý hành động tiếp theo

## KHI CÓ DỮ LIỆU THỰC (được cung cấp trong tin nhắn)
- Ưu tiên dùng dữ liệu thực để trả lời chính xác
- Gợi ý món cụ thể kèm giá, lý do nên thử
- Nếu có đơn hàng, giải thích trạng thái rõ ràng và thân thiện

## UPSELL TỰ NHIÊN
- Khi khách hỏi 1 món → gợi thêm món phù hợp hoặc combo
- Khi khách hỏi giá → đề xuất món tương tự giá tốt hơn
- Khi khách sắp đặt → nhắc mã giảm giá nếu có

## CHUYỂN ADMIN KHI
- Khách khiếu nại, yêu cầu hoàn tiền, đổi trả
- Sai đơn, mất đơn, lỗi thanh toán nghiêm trọng
- Khách yêu cầu gặp người thật rõ ràng

## KHÔNG LÀM
- Không bịa thông tin khi không có dữ liệu
- Không hứa thời gian cụ thể nếu không chắc
- Không trả lời dài dòng quá 4 câu`;

export const buildSystemPromptWithContext = (contextData = null) => {
  if (!contextData) return SYSTEM_PROMPT;

  let extra = '';

  if (contextData.products?.length) {
    const lines = contextData.products.slice(0, 10).map(
      (p) => `- ${p.name} | ${Number(p.price || 0).toLocaleString('vi-VN')}đ | ${p.category || 'Khác'}${p.featured ? ' ⭐' : ''}${p.discount ? ` | Giảm ${p.discount}%` : ''}`
    ).join('\n');
    extra += `\n\n## MENU HIỆN TẠI (${contextData.products.length} món)\n${lines}`;
  }

  if (contextData.orders?.length) {
    const lines = contextData.orders.slice(0, 5).map((o) => {
      const statusMap = {
        PENDING: 'Chờ xử lý', WAITING_FOR_SHIPPER: 'Chờ shipper',
        CONFIRMED: 'Đã xác nhận', DELIVERING: 'Đang giao',
        COMPLETED: 'Hoàn thành', FAILED: 'Thất bại', CANCELLED: 'Đã hủy',
      };
      return `- Đơn #${o.id?.slice(-6).toUpperCase()} | ${statusMap[o.status] || o.status} | ${Number(o.totalAmount || 0).toLocaleString('vi-VN')}đ`;
    }).join('\n');
    extra += `\n\n## ĐƠN HÀNG GẦN ĐÂY CỦA KHÁCH\n${lines}`;
  }

  if (contextData.singleOrder) {
    const o = contextData.singleOrder;
    const statusMap = {
      PENDING: 'Chờ xử lý', WAITING_FOR_SHIPPER: 'Chờ shipper',
      CONFIRMED: 'Đã xác nhận', DELIVERING: 'Đang giao',
      COMPLETED: 'Hoàn thành', FAILED: 'Thất bại', CANCELLED: 'Đã hủy',
    };
    const items = (o.items || []).slice(0, 5).map((i) => `  • ${i.productName || i.name} x${i.quantity}`).join('\n');
    extra += `\n\n## THÔNG TIN ĐƠN HÀNG\n- Mã: #${o.id?.slice(-6).toUpperCase()}\n- Trạng thái: ${statusMap[o.status] || o.status}\n- Tổng: ${Number(o.totalAmount || 0).toLocaleString('vi-VN')}đ\n- Món:\n${items}`;
  }

  return SYSTEM_PROMPT + extra;
};

export const createAiModel = (contextData = null) => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPromptWithContext(contextData),
  });
};

// Model mặc định không có context (dùng khi không cần dữ liệu thực)
export const aiModel = genAI
  ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM_PROMPT })
  : null;

export const buildConversationContext = (messages = []) =>
  messages
    .filter((m) => m.senderType === 'user' || m.senderType === 'ai')
    .slice(-24)
    .map((msg) => ({
      role: msg.senderType === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || '' }],
    }));
