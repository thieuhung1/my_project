import React, { useState, useEffect, useRef } from 'react';
import { 
  subscribeToSupportChats, 
  subscribeToMessages, 
  sendSupportMessage, 
  markChatAsRead 
} from '../../backend/services/supportChatService';
import { serverTimestamp } from 'firebase/database';
import useAuth from '../../backend/hooks/useAuth';

const SupportChatManager = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const { userProfile } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load all support chats (real-time)
  useEffect(() => {
    const unsubscribe = subscribeToSupportChats((chatData) => {
      setChats(chatData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Set first chat as selected initial if none
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  // Load selected chat messages
  useEffect(() => {
    if (selectedChat) {
      // Mark as read
      markChatAsRead(selectedChat.id);

      const unsubscribe = subscribeToMessages(selectedChat.id, (msgs) => {
        // Sort messages by timestamp manually if needed, 
        // though RTDB push keys are generally chronological
        const sortedMsgs = msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(sortedMsgs);
        setTimeout(scrollToBottom, 100);
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);

  const sendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const text = replyText.trim();
    setReplyText('');

    try {
      await sendSupportMessage(selectedChat.id, {
        text,
        userId: userProfile?.uid || 'admin',
        userName: userProfile?.displayName || 'Quản trị viên',
        direction: 'admin', // Admin sent this
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      alert('Gửi trả lời thất bại: ' + err.message);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      // RTDB timestamp is often a number (ms)
      const date = new Date(timestamp);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Đang tải danh sách hỗ trợ...</p>
      </div>
    );
  }

  return (
    <div className="chat-manager-wrapper card border-0 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)', background: '#fff' }}>
      <div className="row g-0 h-100">
        {/* Chat List */}
        <div className="col-md-4 col-lg-3 border-end h-100 d-flex flex-column bg-light">
          <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Tin Nhắn ({chats.length})</h6>
            <span className="badge bg-primary rounded-pill">
              {chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} mới
            </span>
          </div>
          <div className="chat-list-container flex-grow-1 overflow-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-muted small">Không có yêu cầu hỗ trợ nào.</div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item p-3 cursor-pointer border-bottom transition-all ${selectedChat?.id === chat.id ? 'bg-white border-start border-primary border-4 shadow-sm' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className={`fw-bold small ${selectedChat?.id === chat.id ? 'text-primary' : 'text-dark'}`}>
                      {chat.userName || 'Khách #' + chat.id.slice(-4)}
                    </span>
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      {formatTime(chat.lastMessageTime)}
                    </small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="small text-muted mb-0 text-truncate" style={{ maxWidth: '160px' }}>
                      {chat.lastMessage || 'Chưa có tin nhắn'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="badge bg-danger rounded-circle p-1" style={{ width: '18px', height: '18px', fontSize: '10px' }}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="col-md-8 col-lg-9 h-100 d-flex flex-column">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    {(selectedChat.userName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{selectedChat.userName || 'Khách #' + selectedChat.id.slice(-4)}</h6>
                    <small className="text-success small d-flex align-items-center">
                      <span className="bg-success rounded-circle me-1" style={{ width: '8px', height: '8px' }}></span>
                      Đang kết nối
                    </small>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-secondary rounded-pill">
                  <i className="bi bi-info-circle"></i> Chi tiết
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-grow-1 p-4 overflow-auto bg-light d-flex flex-column gap-3">
                {messages.length === 0 ? (
                  <div className="text-center my-auto text-muted">
                    <p>Bắt đầu hỗ trợ khách hàng ngay.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSystem = msg.direction === 'system';
                    const isAdmin = msg.direction === 'admin';
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id || idx} className="text-center my-2">
                          <span className="badge bg-light text-muted fw-normal rounded-pill shadow-sm py-2 px-3 border">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id || idx} className={`d-flex ${isAdmin ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className={`message-bubble p-3 shadow-sm ${isAdmin ? 'bg-primary text-white rounded-message-sent' : 'bg-white text-dark rounded-message-received'}`} 
                             style={{ maxWidth: '70%', position: 'relative' }}>
                          <div className="mb-1 fw-bold small opacity-75 d-block">
                            {isAdmin ? 'Bạn (Admin)' : msg.userName || 'Khách'}
                          </div>
                          <div className="message-text">{msg.text}</div>
                          <div className={`text-end mt-1 small opacity-50`} style={{ fontSize: '10px' }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-top bg-white">
                <form onSubmit={sendReply} className="input-group">
                  <input
                    type="text"
                    className="form-control border-end-0 py-2"
                    placeholder="Nhập nội dung trả lời..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ borderRadius: '20px 0 0 20px', background: '#f8f9fa' }}
                  />
                  <button 
                    className="btn btn-primary px-4" 
                    type="submit"
                    style={{ borderRadius: '0 20px 20px 0' }}
                    disabled={!replyText.trim()}
                  >
                    <i className="bi bi-send-fill me-2"></i>Gửi
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
              <div className="bg-light rounded-circle p-4 mb-3">
                <i className="bi bi-chat-square-dots fs-1 text-primary opacity-25"></i>
              </div>
              <h5>Hỗ trợ khách hàng</h5>
              <p className="small">Vui lòng chọn một cuộc trò chuyện để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .rounded-message-sent {
          border-radius: 18px 18px 4px 18px;
        }
        .rounded-message-received {
          border-radius: 18px 18px 18px 4px;
        }
        .chat-item:hover {
          background-color: #f1f3f9;
        }
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default SupportChatManager;
