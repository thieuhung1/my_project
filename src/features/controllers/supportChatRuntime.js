import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const aiModel = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'Bạn là AI tư vấn của FoodHub. Trả lời ngắn gọn, thân thiện, đúng trọng tâm và bằng tiếng Việt. Ưu tiên gợi ý món, giải thích rõ giá/khuyến mãi/đơn hàng nếu có đủ dữ liệu. Nếu người dùng hỏi về đơn hàng, thanh toán, khiếu nại, hoàn tiền, lỗi đơn hoặc muốn gặp nhân viên, hãy hướng họ sang admin. Nếu thiếu thông tin, hãy hỏi lại tối đa 1 câu ngắn gọn thay vì trả lời lan man.',
    })
  : null;

export const buildConversationContext = (messages = []) =>
  messages.slice(-16).map((msg) => ({
    role: msg.senderType === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text || '' }],
  }));
