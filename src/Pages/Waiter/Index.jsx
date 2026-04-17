import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../backend/firebase/firebaseConfig';
import { updateOrderStatus, ORDER_STATUS } from '../../backend/services/orderService';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CARD_BORDER_COLOR = {
  success: '#198754',
  warning: '#fd7e14',
  secondary: '#6c757d',
};

// Chuyển snapshot Firestore thành mảng object.
const mapSnapshot = (snapshot) => snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

// Sort đơn mới nhất theo createdAt ngay trên client để tránh phụ thuộc index phức tạp.
const sortByCreatedAtDesc = (orders) =>
  [...orders].sort((a, b) => {
    const timeA = a.createdAt?.toDate?.()?.getTime?.() || 0;
    const timeB = b.createdAt?.toDate?.()?.getTime?.() || 0;
    return timeB - timeA;
  });

const getStatusMeta = (status) => {
  if (status === ORDER_STATUS.COMPLETED) {
    return { text: 'Đã xong', color: 'success', icon: 'bi-check-circle-fill' };
  }

  if (status === ORDER_STATUS.DELIVERING || status === ORDER_STATUS.CONFIRMED) {
    return { text: 'Đang phục vụ', color: 'warning', icon: 'bi-fire' };
  }

  return { text: 'Chờ', color: 'secondary', icon: 'bi-clock' };
};

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lọc DINE_IN ngay trong query để giảm dữ liệu tải về.
    const q = query(collection(db, 'orders'), where('type', '==', 'DINE_IN'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = sortByCreatedAtDesc(mapSnapshot(snapshot));
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleComplete = async (orderId) => {
    if (!window.confirm('Xác nhận khách đã thanh toán?')) return;

    try {
      await updateOrderStatus(orderId, ORDER_STATUS.COMPLETED);
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== ORDER_STATUS.COMPLETED),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === ORDER_STATUS.COMPLETED),
    [orders]
  );

  const stats = useMemo(
    () => [
      { label: 'Tổng đơn', value: orders.length, icon: 'bi-receipt', color: '#0d6efd' },
      { label: 'Đang phục vụ', value: activeOrders.length, icon: 'bi-cup-hot', color: '#fd7e14' },
      { label: 'Đã hoàn thành', value: completedOrders.length, icon: 'bi-check2-all', color: '#198754' },
    ],
    [orders.length, activeOrders.length, completedOrders.length]
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '70vh', background: '#fff8e1' }}>
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-muted">Đang tải đơn bàn...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff8e1', minHeight: '100vh' }}>
      <div className="container py-4 py-lg-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h1 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>
              <i className="bi bi-shop me-2 text-warning" />
              Quản lý Bàn Ăn
            </h1>
            <p className="text-muted mb-0">Theo dõi và xác nhận thanh toán tại quán</p>
          </div>
          <div className="text-end d-none d-md-block">
            <div className="small text-muted">Cập nhật</div>
            <div className="fw-semibold">{new Date().toLocaleTimeString('vi-VN')}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {stats.map((item) => (
            <div key={item.label} className="col-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44, background: `${item.color}15` }}
                    >
                      <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: '1.25rem' }} />
                    </div>
                    <div>
                      <div className="small text-muted">{item.label}</div>
                      <div className="h4 fw-bold mb-0">{item.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>🍽️</div>
            <h5 className="mt-3">Chưa có đơn nào</h5>
            <p className="text-muted">Đơn ăn tại quán sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => {
              const status = getStatusMeta(order.status);
              const isDone = order.status === ORDER_STATUS.COMPLETED;

              return (
                <div key={order.id} className="col-md-6 col-xl-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      borderRadius: '1.25rem',
                      borderTop: `4px solid ${CARD_BORDER_COLOR[status.color]}`,
                      opacity: isDone ? 0.85 : 1,
                    }}
                  >
                    <div className="card-body p-4">
                      {/* Top */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-warning bg-opacity-10 rounded-3 p-2">
                            <i className="bi bi-table text-warning fs-5" />
                          </div>
                          <div>
                            <h5 className="mb-0 fw-bold">Bàn {order.table_id || '?'}</h5>
                            <small className="text-muted">#{order.id.slice(-6).toUpperCase()}</small>
                          </div>
                        </div>
                        <span className={`badge bg-${status.color} bg-opacity-10 text-${status.color} border border-${status.color} border-opacity-25 px-2 py-1`}>
                          <i className={`bi ${status.icon} me-1`} />
                          {status.text}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mb-3" style={{ maxHeight: 140, overflowY: 'auto' }}>
                        {order.items?.map((item, index) => (
                          <div key={`${order.id}-${item.productId || item.productName}-${index}`} className="d-flex justify-content-between py-1 border-bottom border-light">
                            <span className="small">
                              <span className="badge bg-light text-dark me-2" style={{ minWidth: 24 }}>
                                {item.quantity}
                              </span>
                              {item.productName}
                            </span>
                            <span className="small text-muted">
                              {(item.price * item.quantity)?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="text-muted small">Tổng cộng</span>
                        <span className="h5 fw-bold text-danger mb-0">{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                      </div>

                      {/* Action */}
                      {!isDone ? (
                        <button
                          type="button"
                          className="btn btn-success w-100 mt-3 fw-semibold"
                          onClick={() => handleComplete(order.id)}
                          style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                        >
                          <i className="bi bi-cash-coin me-2" />
                          Xác nhận thanh toán
                        </button>
                      ) : (
                        <div className="text-center mt-3 text-success small fw-semibold">
                          <i className="bi bi-check-circle me-1" /> Đã thanh toán
                        </div>
                      )}

                      {order.createdAt?.toDate && (
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            <i className="bi bi-clock-history me-1" />
                            {order.createdAt.toDate().toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </small>
                        </div>
                      )}
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

export default WaiterDashboard;
