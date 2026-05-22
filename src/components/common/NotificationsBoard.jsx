// NotificationsBoard.jsx - Bảng hiển thị danh sách thông báo theo dạng khung lớn.
// File này dùng cho trang hoặc dashboard cần xem nhiều thông báo cùng lúc.

import React, { useEffect, useMemo, useState } from 'react';
import { getAdminNotifications, getNotificationsByAccount, NOTIFICATION_TYPES } from '../../features/controllers/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const TYPE_META = {
  [NOTIFICATION_TYPES.ORDER_CREATED]: { icon: 'bi-bag-check', color: 'success' },
  [NOTIFICATION_TYPES.ORDER_UPDATED]: { icon: 'bi-arrow-repeat', color: 'primary' },
  [NOTIFICATION_TYPES.PRODUCT_CREATED]: { icon: 'bi-basket2', color: 'info' },
  [NOTIFICATION_TYPES.PRODUCT_UPDATED]: { icon: 'bi-pencil-square', color: 'warning' },
  [NOTIFICATION_TYPES.CHAT_REPLIED]: { icon: 'bi-chat-dots', color: 'secondary' },
  [NOTIFICATION_TYPES.SYSTEM]: { icon: 'bi-bell', color: 'dark' },
};

const NotificationsBoard = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const resolvedIdentity = useMemo(() => ({
    userId: userProfile?.uid || user?.uid || '',
    email: userProfile?.email || user?.email || '',
    phone: userProfile?.phone || user?.phoneNumber || '',
    displayName: userProfile?.displayName || user?.displayName || '',
  }), [user?.email, user?.phoneNumber, user?.uid, user?.displayName, userProfile?.displayName, userProfile?.email, userProfile?.phone, userProfile?.uid]);

  const title = useMemo(() => (isAdmin ? 'Thông báo quản trị' : 'Thông báo của bạn'), [isAdmin]);
  const subtitle = useMemo(() => {
    if (isAdmin) return 'Bản tin hoạt động hệ thống';
    const name = userProfile?.displayName || user?.displayName || 'bạn';
    const role = userProfile?.role ? ` • ${userProfile.role}` : '';
    return `Xin chào ${name}${role}`;
  }, [isAdmin, user?.displayName, userProfile?.displayName, userProfile?.role]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = isAdmin ? await getAdminNotifications() : await getNotificationsByAccount(resolvedIdentity);
        if (mounted) setItems(data);
      } catch (error) {
        console.error('Failed to load notifications', error);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (resolvedIdentity.userId || isAdmin) load();
    else setLoading(false);

    return () => { mounted = false; };
  }, [resolvedIdentity, isAdmin]);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
        <div>
          <h5 className="mb-0 fw-bold">{title}</h5>
          <small className="text-muted">{subtitle}</small>
        </div>
        <span className="badge bg-light text-dark border">{items.length}</span>
      </div>

      <div className="card-body p-0" style={{ maxHeight: 520, overflowY: 'auto' }}>
        {loading ? (
          <div className="p-4 text-center text-muted">Đang tải thông báo...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-muted">Chưa có thông báo mới cho tài khoản này.</div>
        ) : (
          <div className="list-group list-group-flush">
            {items.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META[NOTIFICATION_TYPES.SYSTEM];
              return (
                <div key={item.id} className="list-group-item py-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className={`rounded-circle bg-${meta.color} bg-opacity-10 text-${meta.color} d-flex align-items-center justify-content-center`} style={{ width: 40, height: 40 }}>
                      <i className={`bi ${meta.icon}`} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between gap-2">
                        <div className="fw-semibold text-truncate">{item.title}</div>
                        <small className="text-muted flex-shrink-0">{item.createdAt?.toDate?.()?.toLocaleString('vi-VN')}</small>
                      </div>
                      <div className="text-muted small mt-1">{item.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsBoard;
