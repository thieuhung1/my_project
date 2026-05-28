import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/Chatbot.css';
import { subscribeToMessages, routeConversationMessage, ensureConversationThread } from '../../../features/controllers/supportChatService';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Quick replies theo ngữ cảnh trang
const getContextualQuickReplies = (pathname) => {
  if (pathname.includes('/products') || pathname.includes('/menu')) {
    return [
      { label: '🍜 Món ngon hôm nay', msg: 'Hôm nay có món gì ngon không em?' },
      { label: '💰 Món dưới 50k', msg: 'Gợi ý món ăn dưới 50.000đ cho em' },
      { label: '🔥 Món bán chạy', msg: 'Món nào đang bán chạy nhất?' },
      { label: '🎁 Khuyến mãi', msg: 'Có khuyến mãi gì hôm nay không?' },
    ];
  }
  if (pathname.includes('/orders') || pathname.includes('/cart')) {
    return [
      { label: '🪑 Chọn bàn', msg: 'Hướng dẫn em chọn bàn ăn tại quán' },
      { label: '💳 Thanh toán VNPay', msg: 'Thanh toán VNPay như thế nào?' },
      { label: '🚚 Phí giao hàng', msg: 'Phí giao hàng tính như thế nào?' },
      { label: '🎟️ Dùng mã giảm giá', msg: 'Cách dùng mã giảm giá?' },
    ];
  }
  if (pathname.includes('/my-orders')) {
    return [
      { label: '📦 Xem đơn của tôi', msg: 'Cho em xem đơn hàng gần nhất' },
      { label: '⏱️ Đơn đang giao', msg: 'Đơn hàng của em đang ở đâu rồi?' },
      { label: '❌ Hủy đơn', msg: 'Em muốn hủy đơn hàng' },
      { label: '🔄 Đặt lại', msg: 'Em muốn đặt lại đơn cũ' },
    ];
  }
  return [
    { label: '🍜 Gợi ý món', msg: 'Gợi ý món ăn ngon cho em' },
    { label: '📦 Đơn hàng', msg: 'Kiểm tra đơn hàng của em' },
    { label: '🎁 Ưu đãi hôm nay', msg: 'Có ưu đãi gì hôm nay không?' },
    { label: '🧑‍💼 Gặp nhân viên', msg: 'Em muốn gặp nhân viên hỗ trợ' },
  ];
};

// Lời chào theo thời gian
const getGreeting = (name) => {
  const hour = new Date().getHours();
  const timeGreet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const displayName = name ? ` ${name.split(' ').pop()}` : '';
  return `${timeGreet}${displayName}! 👋`;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHandedOff, setIsHandedOff] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const { user } = useAuth();
  const location = useLocation();

  const chatId = user ? user.uid : 'guest';
  const quickReplies = getContextualQuickReplies(location.pathname);

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

    init().catch(() => {
      setMessages([{
        id: 'system-error',
        text: 'Không thể khởi tạo cuộc trò chuyện lúc này. Vui lòng thử lại sau.',
        senderType: 'system',
        direction: 'system',
      }]);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [chatId, isOpen, user]);

  // Đếm tin nhắn mới khi chat đóng
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      prevMsgCountRef.current = messages.length;
      return;
    }
    const newCount = messages.length - prevMsgCountRef.current;
    if (newCount > 0) setUnreadCount(v => v + newCount);
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    return () => {
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
    } catch {
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

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
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
                  <span className={`handoff-pill ${isHandedOff ? 'handoff-pill--admin' : ''}`}>
                    {isHandedOff ? '👤 admin' : '🤖 AI'}
                  </span>
                </div>
                <p>{isHandedOff ? 'Nhân viên đang hỗ trợ bạn' : 'Trả lời tức thì • Chuyển admin khi cần'}</p>
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
                <h4>{getGreeting(user?.displayName)}</h4>
                <p>Em là trợ lý AI của FoodHub. Anh/chị cần gì em giúp ngay nhé!</p>
                <div className="quick-replies">
                  {quickReplies.map((reply) => (
                    <button key={reply.label} onClick={() => handleSend(reply.msg)} disabled={isLoading}>
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isSystem = msg.senderType === 'system' || msg.direction === 'system';
                  const isAi = msg.senderType === 'ai' || msg.direction === 'bot';
                  const isAdmin = msg.senderType === 'admin' || msg.direction === 'admin';
                  const isUser = !isAi && !isAdmin && !isSystem;

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
                        {isUser ? '🧑 Bạn' : isAdmin ? '👤 Nhân viên' : '🤖 AI FoodHub'}
                      </div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  );
                })}
                {/* Quick replies sau tin nhắn cuối của bot */}
                {!isLoading && messages.length > 0 && !isHandedOff && (
                  <div className="chat-quick-suggest">
                    {quickReplies.slice(0, 2).map((reply) => (
                      <button key={reply.label} onClick={() => handleSend(reply.msg)} disabled={isLoading}>
                        {reply.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {isLoading && (
              <div className="message bot">
                <div className="message-sender">🤖 AI FoodHub</div>
                <div className="typing-dots"><span/><span/><span/></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <div className="chat-handoff-hint">
              {isHandedOff
                ? '👤 Nhân viên đang tham gia hỗ trợ bạn'
                : '⚡ AI phản hồi tức thì — tự chuyển nhân viên khi cần'}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isHandedOff ? 'Nhắn với nhân viên...' : 'Hỏi về món ăn, đơn hàng...'}
                disabled={isLoading}
              />
              <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                <i className="bi bi-send-fill" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={handleOpen} aria-label="Mở chat bot">
        <span className="chat-toggle-glow" />
        <i className="bi bi-robot" />
        {unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
    </div>
  );
};

export default Chatbot;