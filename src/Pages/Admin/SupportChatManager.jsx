import React, { useState, useEffect, useRef } from 'react';
import { subscribeToSupportChats, subscribeToMessages, sendSupportMessage, markChatAsRead } from '../../features/controllers/supportChatService';
import { serverTimestamp } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { createNotification, NOTIFICATION_TYPES } from '../../features/controllers/notificationService';
import SupportChatList from './SupportChatList';
import SupportChatBubble from './SupportChatBubble';
import { formatChatTimestamp } from '../../features/controllers/supportChatUtils';

const SupportChatManager = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const { userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const hasLoadedMessagesRef = useRef(false);

  const isAdmin = userProfile?.role === 'admin';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (authLoading) return undefined;

    if (!isAuthenticated || !isAdmin) {
      setError('Bạn cần đăng nhập bằng tài khoản admin để xem danh sách hỗ trợ.');
      setLoading(false);
      return undefined;
    }

    setError('');
    setLoading(true);
    const unsubscribe = subscribeToSupportChats((chatData) => {
      setChats(chatData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  useEffect(() => {
    if (!selectedChat) return undefined;

    previousMessageCountRef.current = 0;
    hasLoadedMessagesRef.current = false;
    markChatAsRead(selectedChat.id);

    const unsubscribe = subscribeToMessages(selectedChat.id, (msgs) => {
      const sortedMsgs = (msgs || []).slice().sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      const previousCount = previousMessageCountRef.current;
      setMessages(sortedMsgs);

      if (hasLoadedMessagesRef.current && sortedMsgs.length > previousCount) {
        requestAnimationFrame(scrollToBottom);
      }

      previousMessageCountRef.current = sortedMsgs.length;
      hasLoadedMessagesRef.current = true;
    });

    return () => unsubscribe();
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
        senderType: 'admin',
        direction: 'admin',
        timestamp: serverTimestamp(),
      });

      createNotification({
        type: NOTIFICATION_TYPES.CHAT_REPLIED,
        title: 'Admin đã trả lời chat',
        message: `Đã phản hồi khách ${selectedChat.userName || selectedChat.id.slice(-4)}.`,
        audience: 'user',
        userId: selectedChat.userId,
        targetId: selectedChat.id,
        actorId: userProfile?.uid || 'admin',
        actorName: userProfile?.displayName || 'Quản trị viên',
        meta: { chatId: selectedChat.id },
      }).catch((error) => console.error('Failed to create chat notification', error));
    } catch (err) {
      console.error(err);
      alert('Gửi trả lời thất bại: ' + err.message);
    }
  };

  const releaseToAI = async () => {
    if (!selectedChat) return;
    try {
      await sendSupportMessage(selectedChat.id, {
        text: 'Admin đã chuyển lại cho AI hỗ trợ.',
        userId: userProfile?.uid || 'admin',
        userName: userProfile?.displayName || 'Quản trị viên',
        senderType: 'system',
        direction: 'system',
        timestamp: serverTimestamp(),
      });
      setSelectedChat((current) => (current ? { ...current, routedToAdmin: false, assignedTo: 'ai' } : current));
    } catch (err) {
      console.error(err);
      alert('Không thể chuyển lại AI: ' + err.message);
    }
  };

  const formatTime = formatChatTimestamp;

  if (authLoading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center text-danger">
        <i className="bi bi-shield-lock fs-1 d-block mb-3" />
        <h5>Không có quyền truy cập</h5>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

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
        <div className="col-md-4 col-lg-3 border-end h-100 d-flex flex-column bg-light">
          <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Tin Nhắn ({chats.length})</h6>
            <span className="badge bg-primary rounded-pill">{chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} mới</span>
          </div>
          <SupportChatList chats={chats} selectedChat={selectedChat} onSelectChat={setSelectedChat} />
        </div>

        <div className="col-md-8 col-lg-9 h-100 d-flex flex-column">
          {selectedChat ? (
            <>
              <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    {(selectedChat.userName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{selectedChat.userName || 'Khách #' + selectedChat.id.slice(-4)}</h6>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <small className={`small d-flex align-items-center ${selectedChat.routedToAdmin ? 'text-warning' : 'text-success'}`}>
                        <span className={`${selectedChat.routedToAdmin ? 'bg-warning' : 'bg-success'} rounded-circle me-1`} style={{ width: '8px', height: '8px' }}></span>
                        {selectedChat.routedToAdmin ? 'Đang ở chế độ admin' : 'Đang hỗ trợ AI'}
                      </small>
                      <span className="badge bg-light text-dark border">Assigned: {selectedChat.assignedTo || 'ai'}</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={releaseToAI} disabled={!selectedChat?.routedToAdmin}>
                    Chuyển lại AI
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill">
                    <i className="bi bi-info-circle"></i> Chi tiết
                  </button>
                </div>
              </div>

              <div className="flex-grow-1 p-4 overflow-auto bg-light d-flex flex-column gap-3">
                {messages.length === 0 ? (
                  <div className="text-center my-auto text-muted">
                    <p>Bắt đầu hỗ trợ khách hàng ngay.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <SupportChatBubble key={msg.id || idx} msg={msg} isAdmin={msg.direction === 'admin'} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

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
                  <button className="btn btn-primary px-4" type="submit" style={{ borderRadius: '0 20px 20px 0' }} disabled={!replyText.trim()}>
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
        .rounded-message-sent { border-radius: 18px 18px 4px 18px; }
        .rounded-message-received { border-radius: 18px 18px 18px 4px; }
        .chat-item:hover { background-color: #f1f3f9; }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
};

export default SupportChatManager;
