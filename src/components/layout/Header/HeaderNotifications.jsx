// HeaderNotifications.jsx - Wrapper cho dropdown thông báo trong header.
// File này giúp header dùng chung một component thông báo ở nhiều vị trí.

import React from 'react';
import NotificationsDropdown from '../../common/NotificationsDropdown';

const HeaderNotifications = ({ onAnyAction }) => {
  return <NotificationsDropdown onAnyAction={onAnyAction} />;
};

export default HeaderNotifications;
