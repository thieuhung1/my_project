import React, { useState, useEffect, useRef } from 'react';
import { subscribeToMessages, sendSupportMessage } from '../../backend/services/supportChatService';
import { serverTimestamp } from 'firebase/database';
import useAuth from '../../backend/hooks/useAuth';
import './SupportChat.css';

const SupportChatIcon = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // anon id ổn định
  const anonId = localStorage.getItem('anon_chat_id') || Math.random().toString(36).substring(2, 9);
  if (!localStorage.getItem('anon_chat_id')) localStorage.setItem('anon_chat_id', anonId);
  const chatId = user ? user.uid : `anon-${anonId}`;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, chatOpen]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatId, (data) => {
      const sorted = (data || []).slice().sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setMessages(sorted);
      // giả lập trạng thái "đang trả lời" nếu tin cuối là của user
      const last = sorted[sorted.length - 1];
      setIsTyping(last?.direction === 'user');
      const t = setTimeout(() => setIsTyping(false), 1200);
      return () => clearTimeout(t);
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    try {
      await sendSupportMessage(chatId, {
        text,
        userId: user?.uid || chatId,
        userName: user?.displayName || user?.email?.split('@')[0] || 'Khách',
        direction: 'user',
        timestamp: serverTimestamp()
      });
    } catch (err) {
      setInput(text);
      alert('Gửi thất bại: ' + err.message);
    }
  };

  const quickReplies = [
    { label: 'Đặt hàng', msg: 'Tôi muốn đặt món ăn' },
    { label: 'Theo dõi đơn', msg: 'Kiểm tra đơn hàng của tôi' },
    { label: 'Khuyến mãi', msg: 'Có ưu đãi gì hôm nay?' },
    { label: 'Gặp Admin', msg: 'Nhờ Admin hỗ trợ' }
  ];

  return (
    <>
      {/* Floating button */}
      {!chatOpen && (
        <button
          className="chat-fab"
          onClick={() => setChatOpen(true)}
          title="Nhắn tin hỗ trợ"
          aria-label="Chat hỗ trợ"
        >
          <span className="chat-fab-pulse" />
          <i className="bi bi-chat-dots-fill" />
        </button>
      )}

      {/* Chat window */}
      {chatOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="avatar-ring">
                <i className="bi bi-headset" />
              </div>
              <div>
                <div className="title">Hỗ trợ FoodHub</div>
                <div className="subtitle">
                  <span className="dot-online" /> Đang hoạt động
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setChatOpen(false)} aria-label="Đóng">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-body">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="empty-icon"><i className="bi bi-chat-left-dots" /></div>
                <p>Chào bạn! Mình có thể giúp gì cho bạn hôm nay?</p>
                <div className="quick-replies">
                  {quickReplies.map((reply, idx) => (
                    <button key={idx} onClick={() => setInput(reply.msg)}>
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`bubble ${msg.direction === 'user' ? 'me' : 'them'}`}
                  >
                    <div className="bubble-text">{msg.text}</div>
                    <div className="bubble-meta">
                      {msg.direction === 'user' ? 'Bạn' : 'Hỗ trợ'}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="bubble them typing">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <div className="input-wrap">
              <button className="icon-btn" onClick={() => setInput((v)=> v + ' 😊')} title="Emoji">
                <i className="bi bi-emoji-smile" />
              </button>
              <input
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim()} title="Gửi">
                <i className="bi bi-send-fill" />
              </button>
            </div>
            <div className="hint">Realtime • Nhấn Enter để gửi</div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatIcon;