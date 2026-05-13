import React from 'react';
import { formatChatTimestamp } from '../../features/controllers/supportChatUtils';

const SupportChatBubble = ({ msg, isAdmin }) => {
  const isSystem = msg.direction === 'system';

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <span className="badge bg-light text-muted fw-normal rounded-pill shadow-sm py-2 px-3 border">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`d-flex ${isAdmin ? 'justify-content-end' : 'justify-content-start'}`}>
      <div className={`message-bubble p-3 shadow-sm ${isAdmin ? 'bg-primary text-white rounded-message-sent' : 'bg-white text-dark rounded-message-received'}`} style={{ maxWidth: '70%', position: 'relative' }}>
        <div className="mb-1 fw-bold small opacity-75 d-block">
          {isAdmin ? 'Bạn (Admin)' : msg.userName || 'Khách'}
        </div>
        <div className="message-text">{msg.text}</div>
        <div className="text-end mt-1 small opacity-50" style={{ fontSize: '10px' }}>
          {formatChatTimestamp(msg.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default SupportChatBubble;
