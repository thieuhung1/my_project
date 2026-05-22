// ChatbotIcon/index.jsx - Cửa sổ chatbot nổi dùng để tư vấn khách hàng.
// File này quản lý mở/đóng chat, gửi tin nhắn và nhận phản hồi AI/admin.

import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/Chatbot.css';
import { subscribeToMessages, routeConversationMessage, ensureConversationThread } from '../../../features/controllers/supportChatService';
import { useAuth } from '../../../contexts/AuthContext';

const quickReplies = [
  { label: 'Đặt hàng', msg: 'Tôi muốn đặt món ăn' },
  { label: 'Theo dõi đơn', msg: 'Kiểm tra đơn hàng của tôi' },
  { label: 'Khuyến mãi', msg: 'Có ưu đãi gì hôm nay?' },
  { label: 'Gặp Admin', msg: 'Nhờ Admin hỗ trợ' },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHandedOff, setIsHandedOff] = useState(false);
  const [intentLabel] = useState('ai');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const chatId = user ? user.uid : 'guest';

  useEffect(() => {
    if (!isOpen) return undefined;

    let unsubscribe = () => {};
    let cancelled = false;

    const init = async () => {
      await ensureConversationThread({
        chatId,
        userId: user?.uid || chatId,
        userName: user?.displayName || user?.email?.split('@')[0] || 'Khách',
      });

      if (cancelled) return;
      setIsInitialized(true);
      unsubscribe = subscribeToMessages(chatId, (data) => {
        const sorted = (data || []).slice().sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(sorted);
        setIsHandedOff(sorted.some((msg) => msg.senderType === 'admin' || msg.routedToAdmin));
      }, user?.uid || chatId);
    };

    init().catch((error) => {
      console.error('Không thể khởi tạo cuộc trò chuyện:', error);
      setMessages([
        {
          id: 'system-error',
          text: 'Không thể khởi tạo cuộc trò chuyện lúc này. Vui lòng thử lại sau.',
          senderType: 'system',
          direction: 'system',
        },
      ]);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [chatId, isOpen, user]);

  useEffect(() => {
    if (!isOpen) return undefined;
    return () => {
      // Chỉ reset hiển thị khi đóng popup, KHÔNG xóa lịch sử trên database.
      setMessages([]);
      setIsInitialized(false);
      setIsHandedOff(false);
      setInput('');
    };
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textOverride) => {
    const userMsg = (textOverride ?? input).trim();
    if (!userMsg || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      await routeConversationMessage({
        chatId,
        text: userMsg,
        userId: user?.uid || chatId,
        userName: user?.displayName || user?.email?.split('@')[0] || 'Khách',
        messages,
      });
    } catch (error) {
      console.error('Lỗi xử lý hội thoại:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          text: 'Xin lỗi anh/chị, hệ thống tư vấn đang bận. Vui lòng thử lại sau!',
          senderType: 'system',
          direction: 'system',
        },
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
            <div className="chat-header-left">
              <div className="chat-avatar">
                <i className="bi bi-stars" />
              </div>
              <div>
                <div className="title-row">
                  <h3>Tư vấn FoodHub</h3>
                  <span className="handoff-pill">{isHandedOff ? 'admin' : 'ai'}</span>
                </div>
                <p>{isHandedOff ? 'Đang có admin tham gia cùng cuộc trò chuyện' : 'AI hỗ trợ nhanh, tự chuyển admin khi cần'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Đóng chat bot">✕</button>
          </div>

          <div className="chat-body">
            {!isInitialized || messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">
                  <i className="bi bi-chat-square-dots" />
                </div>
                <h4>Xin chào anh/chị</h4>
                <p>Chọn nhanh một nhu cầu hoặc nhắn trực tiếp, em sẽ hỗ trợ bằng AI và chuyển admin khi cần.</p>
                <div className="quick-replies">
                  {quickReplies.map((reply) => (
                    <button key={reply.label} onClick={() => handleSend(reply.msg)} disabled={isLoading}>
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isSystem = msg.senderType === 'system' || msg.direction === 'system';
                const isAi = msg.senderType === 'ai' || msg.direction === 'bot';
                const isAdmin = msg.senderType === 'admin' || msg.direction === 'admin';
                const isUser = msg.senderType === 'user' || msg.direction === 'user' || (!isAi && !isAdmin && !isSystem);

                if (isSystem) {
                  return (
                    <div key={msg.id || index} className="chat-system-note">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div key={msg.id || index} className={`message ${isUser ? 'user' : 'bot'} ${isAdmin ? 'admin' : ''}`}>
                    <div className="message-sender">
                      {isUser ? 'Bạn' : isAdmin ? 'Admin' : 'AI tư vấn'}
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                );
              })
            )}
            {isTyping && <div className="typing-indicator">Đang nhập...</div>}
            {isLoading && <div className="message bot">⏳ Đang suy nghĩ...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <div className="chat-handoff-hint">
              {isHandedOff ? 'Admin đang cùng tham gia cuộc trò chuyện này.' : 'Nhắn tin một lần, hệ thống tự quyết định AI hay admin.'}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
              />
              <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={() => setIsOpen((v) => !v)} aria-label="Mở chat bot">
        <span className="chat-toggle-glow" />
        <i className="bi bi-robot" />
      </button>
    </div>
  );
};

export default Chatbot;