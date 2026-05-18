// NotificationsDropdown.jsx - Dropdown thông báo nằm trên header.
// File này tải danh sách thông báo, đếm unread và đánh dấu đã đọc khi mở dropdown.
// Nó hỗ trợ cả thông báo của user lẫn admin.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getAdminNotifications, getNotificationsByUser, markNotificationsAsRead, NOTIFICATION_TYPES } from '../../features/controllers/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const TYPE_META = {
  [NOTIFICATION_TYPES.ORDER_CREATED]: { icon: 'bi-bag-check', color: 'success' },
  [NOTIFICATION_TYPES.ORDER_UPDATED]: { icon: 'bi-arrow-repeat', color: 'primary' },
  [NOTIFICATION_TYPES.PRODUCT_CREATED]: { icon: 'bi-basket2', color: 'info' },
  [NOTIFICATION_TYPES.PRODUCT_UPDATED]: { icon: 'bi-pencil-square', color: 'warning' },
  [NOTIFICATION_TYPES.CHAT_REPLIED]: { icon: 'bi-chat-dots', color: 'secondary' },
  [NOTIFICATION_TYPES.SYSTEM]: { icon: 'bi-bell', color: 'dark' },
};

const formatTime = (value) => value?.toDate?.()?.toLocaleString('vi-VN') || '';

const NotificationsDropdown = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

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

    const load = async () => {
      if (!user?.uid && !isAdmin) {
        if (mounted) setItems([]);
        return;
      }

      setLoading(true);
      try {
        const data = isAdmin
          ? await getAdminNotifications(8)
          : await getNotificationsByUser(userProfile?.uid || user?.uid, 8);
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
  }, [user?.uid, isAdmin]);

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
                return (
                  <div key={item.id} className={`px-3 py-3 border-bottom ${item.isRead ? 'bg-white' : 'bg-warning bg-opacity-10'}`}>
                    <div className="d-flex gap-3 align-items-start">
                      <div className={`rounded-circle bg-${meta.color} bg-opacity-10 text-${meta.color} d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 38, height: 38 }}>
                        <i className={`bi ${meta.icon}`} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold text-truncate">{item.title}</div>
                        <div className="small text-muted mt-1" style={{ lineHeight: 1.35 }}>
                          {item.message}
                        </div>
                        <div className="small text-muted mt-1">{formatTime(item.createdAt)}</div>
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
