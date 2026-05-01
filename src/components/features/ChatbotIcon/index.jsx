import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/Chatbot.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp } from "firebase/firestore";

// TODO: SỬA ĐƯỜNG DẪN NÀY CHỈ ĐẾN FILE firebaseConfig.js CỦA BẠN
import { db } from '../../../firebase/firebase.Config'; 

// Khởi tạo Gemini AI từ file .env
const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
// console.log("API Key của tôi là:", apiKey); // THÊM DÒNG NÀY ĐỂ KIỂM TRA
const genAI = new GoogleGenerativeAI(apiKey);
// Đặt nhân vật cho Bot phù hợp với Đồ án "Food Hub"
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "Bạn là nhân viên tư vấn của ứng dụng đặt đồ ăn Food Hub. Hãy trả lời ngắn gọn, thân thiện, xưng em và gọi khách hàng là anh/chị. Hãy gợi ý các món ăn ngon, combo tiết kiệm và giải đáp thắc mắc về giao hàng."
});

const Chatbot = () => {
  const[isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const[input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatSession = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. KHI VỪA MỞ WEB: TẢI LỊCH SỬ TỪ FIREBASE
  useEffect(() => {
    const initChatAndLoadHistory = async () => {
      try {
        const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);
        
        const historyData = [];
        const geminiHistory =[];

        snapshot.forEach((doc) => {
          const data = doc.data();
          historyData.push(data);
          geminiHistory.push({
            role: data.isBot ? "model" : "user",
            parts: [{ text: data.text }]
          });
        });

        // Nếu chưa có tin nhắn, tự động chào
        if (historyData.length === 0) {
          historyData.push({ text: 'Dạ em chào anh/chị! Em có thể giúp gì cho mình ạ? Hôm nay anh/chị muốn ăn món gì?', isBot: true });
        }

        setMessages(historyData);

        // Nạp lịch sử vào bộ não AI
        chatSession.current = model.startChat({ history: geminiHistory });

      } catch (error) {
        console.error("Lỗi tải dữ liệu Firebase:", error);
      }
    };

    initChatAndLoadHistory();
  },[]);

  // 2. CUỘN XUỐNG CUỐI KHI CÓ TIN NHẮN MỚI
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 3. XỬ LÝ GỬI TIN NHẮN
  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSession.current) return;

    const userMsg = input.trim();
    // Hiện tin nhắn của user lên giao diện
    setMessages((prev) =>[...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      // Lưu tin nhắn User lên Firebase
      await addDoc(collection(db, "chats"), {
        text: userMsg,
        isBot: false,
        timestamp: serverTimestamp(),
      });

      // Gửi cho Gemini xử lý
      const result = await chatSession.current.sendMessage(userMsg);
      const botResponse = result.response.text();

      // Hiện câu trả lời của Bot lên giao diện
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);

      // Lưu câu trả lời của Bot lên Firebase
      await addDoc(collection(db, "chats"), {
        text: botResponse,
        isBot: true,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error('Lỗi Gemini AI:', error);
      setMessages((prev) =>[
        ...prev,
        { text: 'Xin lỗi anh/chị, hệ thống tư vấn đang bận. Vui lòng thử lại sau!', isBot: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <span className="chatbot-badge">
                <i className="bi bi-stars" />
              </span>
              <div>
                <h3>Tư vấn viên AI</h3>
                <p>Hỗ trợ Food Hub 24/7</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Đóng chat bot">✕</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="message bot">⏳ Đang suy nghĩ...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>
              Gửi
            </button>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Mở chat bot">
        <span className="chat-toggle-glow" />
        <i className="bi bi-robot" />
      </button>
    </div>
  );
};

export default Chatbot;