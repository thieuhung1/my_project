import React from 'react';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const raw = timestamp?.toDate ? timestamp.toDate() : timestamp;
  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const SupportChatList = ({ chats, selectedChat, onSelectChat }) => {
  return (
    <div className="chat-list-container flex-grow-1 overflow-auto">
      {chats.length === 0 ? (
        <div className="p-4 text-center text-muted small">Không có yêu cầu hỗ trợ nào.</div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item p-3 cursor-pointer border-bottom transition-all ${selectedChat?.id === chat.id ? 'bg-white border-start border-primary border-4 shadow-sm' : ''}`}
            onClick={() => onSelectChat(chat)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start mb-1">
              <span className={`fw-bold small ${selectedChat?.id === chat.id ? 'text-primary' : 'text-dark'}`}>
                {chat.userName || 'Khách #' + chat.id.slice(-4)}
              </span>
              <small className="text-muted" style={{ fontSize: '10px' }}>{formatTime(chat.lastMessageTime)}</small>
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
  );
};

export default SupportChatList;
