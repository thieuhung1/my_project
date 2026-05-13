import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const aiModel = genAI
  ? genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'Bạn là AI tư vấn của FoodHub. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt. Nếu người dùng hỏi về đơn hàng, thanh toán, khiếu nại hoặc yêu cầu gặp nhân viên thì khuyên chuyển sang admin.',
    })
  : null;

export const buildConversationContext = (messages = []) =>
  messages.slice(-12).map((msg) => ({
    role: msg.senderType === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text || '' }],
  }));
