// NotificationsDropdown.jsx - Dropdown thông báo nằm trên header.
// File này tải danh sách thông báo, đếm unread và đánh dấu đã đọc khi mở dropdown.
// Nó hỗ trợ cả thông báo của user lẫn admin.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getAdminNotifications, getNotificationsByAccount, getNotificationsByUser, markNotificationsAsRead, NOTIFICATION_TYPES } from '../../features/controllers/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const TYPE_META = {
  [NOTIFICATION_TYPES.ORDER_CREATED]: { icon: 'bi-bag-check', color: 'success' },
  [NOTIFICATION_TYPES.ORDER_UPDATED]: { icon: 'bi-arrow-repeat', color: 'primary' },
  [NOTIFICATION_TYPES.ORDER_CANCELLED]: { icon: 'bi-x-circle', color: 'danger' },
  [NOTIFICATION_TYPES.ORDER_ASSIGNED]: { icon: 'bi-person-check', color: 'info' },
  [NOTIFICATION_TYPES.PRODUCT_CREATED]: { icon: 'bi-basket2', color: 'info' },
  [NOTIFICATION_TYPES.PRODUCT_UPDATED]: { icon: 'bi-pencil-square', color: 'warning' },
  [NOTIFICATION_TYPES.CHAT_REPLIED]: { icon: 'bi-chat-dots', color: 'secondary' },
  [NOTIFICATION_TYPES.SYSTEM]: { icon: 'bi-bell', color: 'dark' },
};

const formatTime = (value) => value?.toDate?.()?.toLocaleString('vi-VN') || 'Vừa xong';

const getTypeLabel = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ORDER_CREATED:
      return 'Đơn hàng mới';
    case NOTIFICATION_TYPES.ORDER_UPDATED:
      return 'Đơn hàng cập nhật';
    case NOTIFICATION_TYPES.ORDER_CANCELLED:
      return 'Đơn hàng đã hủy';
    case NOTIFICATION_TYPES.ORDER_ASSIGNED:
      return 'Phân công đơn hàng';
    case NOTIFICATION_TYPES.PRODUCT_CREATED:
      return 'Sản phẩm mới';
    case NOTIFICATION_TYPES.PRODUCT_UPDATED:
      return 'Sản phẩm cập nhật';
    case NOTIFICATION_TYPES.CHAT_REPLIED:
      return 'Hỗ trợ chat';
    default:
      return 'Thông báo hệ thống';
  }
};

const getNotificationContent = (item) => {
  const title = (item?.title || '').trim() || getTypeLabel(item?.type);
  const message = (item?.message || '').trim()
    || (item?.actorName ? `${item.actorName} vừa tạo một cập nhật mới.` : 'Bạn có một thông báo mới.');
  const actor = (item?.actorName || '').trim();
  return { title, message, actor };
};

const NotificationsDropdown = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const resolvedIdentity = useMemo(() => ({
    userId: userProfile?.uid || user?.uid || '',
    email: userProfile?.email || user?.email || '',
    phone: userProfile?.phone || user?.phoneNumber || '',
    displayName: userProfile?.displayName || user?.displayName || '',
  }), [user?.email, user?.phoneNumber, user?.uid, user?.displayName, userProfile?.displayName, userProfile?.email, userProfile?.phone, userProfile?.uid]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);
  const unreadIds = useMemo(() => items.filter((item) => !item.isRead).map((item) => item.id), [items]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    const resolvedUserId = userProfile?.uid || user?.uid;

    const load = async () => {
      if (!resolvedIdentity.userId && !isAdmin) {
        if (mounted) setItems([]);
        return;
      }

      setLoading(true);
      try {
        const data = isAdmin
          ? await getAdminNotifications(8)
          : await getNotificationsByAccount(resolvedIdentity, 8);
        if (mounted) setItems(data);
      } catch (error) {
        console.error('Failed to load notifications', error);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 30000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [resolvedIdentity, isAdmin]);

  useEffect(() => {
    if (!open || !unreadIds.length) return undefined;
    const timer = setTimeout(() => {
      markNotificationsAsRead(unreadIds)
        .then(() => {
          setItems((current) => current.map((item) => (unreadIds.includes(item.id) ? { ...item, isRead: true } : item)));
        })
        .catch((error) => console.error('Failed to mark notifications as read', error));
    }, 300);
    return () => clearTimeout(timer);
  }, [open, unreadIds]);

  return (
    <div className="position-relative" ref={wrapperRef}>
      <button
        type="button"
        className="btn btn-outline-light position-relative"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
      >
        <i className="bi bi-bell fs-5" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden"
          style={{ width: 360, maxWidth: 'calc(100vw - 24px)', zIndex: 1090 }}
        >
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-light">
            <div>
              <div className="fw-bold">Thông báo</div>
              <small className="text-muted">Cập nhật gần đây</small>
            </div>
            <span className="badge bg-warning text-white">{unreadCount}</span>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {loading ? (
              <div className="p-4 text-center text-muted">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center text-muted">Chưa có thông báo nào.</div>
            ) : (
              items.map((item) => {
                const meta = TYPE_META[item.type] || TYPE_META[NOTIFICATION_TYPES.SYSTEM];
                const content = getNotificationContent(item);
                return (
                  <div key={item.id} className={`px-3 py-3 border-bottom ${item.isRead ? 'bg-white' : 'bg-warning bg-opacity-10'}`}>
                    <div className="d-flex gap-3 align-items-start">
                      <div className={`rounded-circle bg-${meta.color} bg-opacity-10 text-${meta.color} d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 38, height: 38 }}>
                        <i className={`bi ${meta.icon}`} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="fw-semibold text-truncate">{content.title}</div>
                          <span className={`badge text-bg-${meta.color} bg-opacity-10 text-${meta.color} border border-${meta.color} border-opacity-25`}>
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                        <div className="small text-muted" style={{ lineHeight: 1.35 }}>
                          {content.message}
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-2">
                          <div className="small text-muted">
                            {content.actor ? `Bởi: ${content.actor}` : 'Hệ thống'}
                          </div>
                          <div className="small text-muted">{formatTime(item.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
