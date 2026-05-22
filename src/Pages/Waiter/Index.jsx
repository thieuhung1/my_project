import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase.Config';
import { markTableVacated, updateOrderStatus } from '../../features/controllers/orderService';
import { ORDER_STATUS } from '../../features/models/Order.model';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CARD_BORDER_COLOR = {
  success: '#198754',
  warning: '#fd7e14',
  secondary: '#6c757d',
  info: '#0dcaf0',
  primary: '#0d6efd',
};

// Chuyển snapshot Firestore thành mảng object.
const mapSnapshot = (snapshot) => snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

const sortByCreatedAtDesc = (orders) =>
  [...orders].sort((a, b) => {
    const timeA = a.createdAt?.toDate?.()?.getTime?.() || 0;
    const timeB = b.createdAt?.toDate?.()?.getTime?.() || 0;
    return timeB - timeA;
  });

const getStatusMeta = (status) => {
  switch (status) {
    case ORDER_STATUS.COMPLETED:
      return { text: 'Đã xong', color: 'success', icon: 'bi-check-circle-fill' };
    case ORDER_STATUS.DELIVERING:
    case ORDER_STATUS.WAITING_FOR_SHIPPER: // For consistency
      return { text: 'Đang phục vụ', color: 'primary', icon: 'bi-cup-hot' };
    case ORDER_STATUS.CONFIRMED:
      return { text: 'Đang chuẩn bị', color: 'warning', icon: 'bi-fire' };
    case ORDER_STATUS.PENDING:
    default:
      return { text: 'Chờ chuẩn bị', color: 'secondary', icon: 'bi-hourglass-split' };
  }
};

const formatElapsedTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutes
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  const hours = Math.floor(diff / 60);
  return `${hours} giờ trước`;
};

// Toast Component
const Toast = ({ message, type = 'danger', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
      <div className={`toast show align-items-center text-white bg-${type} border-0`} role="alert">
        <div className="d-flex">
          <div className="toast-body">
            <i className={`bi ${type === 'danger' ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-2`} />
            {message}
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose}></button>
        </div>
      </div>
    </div>
  );
};

// OrderCard Component to manage inline state
const OrderCard = ({ order, onComplete, onVacated }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const status = getStatusMeta(order.status);
  const isDone = order.status === ORDER_STATUS.COMPLETED;
  const isVacated = order.tableVacated === true;
  
  // Tránh lỗi null items
  const items = order.items || [];
  const displayItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  const handleAction = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    setLoading(true);
    await onComplete(order.id);
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div
      className="card border-0 shadow-sm h-100"
      style={{
        borderRadius: '1.25rem',
        borderTop: `4px solid ${CARD_BORDER_COLOR[status.color] || '#6c757d'}`,
        opacity: isDone ? 0.85 : 1,
        transition: 'transform 0.2s',
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
        <div className="mb-3">
          {displayItems.map((item, index) => (
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
          {hasMore && !expanded && (
            <div 
              className="text-center mt-2 small text-primary" 
              style={{cursor: 'pointer'}} 
              onClick={() => setExpanded(true)}
            >
              + {items.length - 3} món nữa (Xem thêm)
            </div>
          )}
          {hasMore && expanded && (
            <div 
              className="text-center mt-2 small text-secondary" 
              style={{cursor: 'pointer'}} 
              onClick={() => setExpanded(false)}
            >
              Thu gọn
            </div>
          )}
        </div>

        {/* Total */}
        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
          <span className="text-muted small">Tổng cộng</span>
          <span className="h5 fw-bold text-danger mb-0">{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
        </div>

        {/* Action */}
        {!isDone ? (
          <div className="mt-3">
            {showConfirm ? (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-success flex-grow-1 fw-semibold"
                  onClick={handleAction}
                  disabled={loading}
                  style={{ borderRadius: '0.75rem' }}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" /> : 'Chắc chắn?'}
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  style={{ borderRadius: '0.75rem' }}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline-success w-100 fw-semibold"
                onClick={handleAction}
                style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
              >
                <i className="bi bi-cash-coin me-2" />
                Xác nhận thanh toán
              </button>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-center text-success small fw-semibold mb-2">
              <i className="bi bi-check-circle me-1" /> Đã thanh toán
            </div>
            {!isVacated ? (
              <button
                type="button"
                className="btn btn-outline-primary w-100 fw-semibold"
                onClick={() => onVacated(order.id)}
                style={{ borderRadius: '0.75rem', padding: '0.65rem' }}
              >
                <i className="bi bi-door-open me-2" /> Khách đã về
              </button>
            ) : (
              <div className="text-center small text-muted">
                <i className="bi bi-check2-square me-1" /> Bàn đã trống
              </div>
            )}
          </div>
        )}

        {/* Created At - Elapsed */}
        {order.createdAt?.toDate && (
          <div className="text-center mt-3">
            <small className="text-muted">
              <i className="bi bi-clock-history me-1" />
              {formatElapsedTime(order.createdAt.toDate())}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Filters
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, ACTIVE, DONE
  const [searchTable, setSearchTable] = useState('');
  
  // Toast
  const [toastInfo, setToastInfo] = useState(null);

  useEffect(() => {
    // Cập nhật đồng hồ mỗi giây
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Lọc DINE_IN ngay trong query để giảm dữ liệu tải về.
    const q = query(collection(db, 'orders'), where('type', '==', 'DINE_IN'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = sortByCreatedAtDesc(mapSnapshot(snapshot));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      setToastInfo({ message: 'Lỗi khi tải dữ liệu: ' + error.message, type: 'danger' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleComplete = async (orderId) => {
    try {
      const currentOrder = orders.find((o) => o.id === orderId);
      const currentStatus = currentOrder?.status;

      if (![ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING].includes(currentStatus)) {
        throw new Error('Đơn chưa ở trạng thái phục vụ, không thể xác nhận thanh toán!');
      }

      await updateOrderStatus(orderId, ORDER_STATUS.COMPLETED, 'waiter');
      setToastInfo({ message: 'Đã xác nhận thanh toán thành công!', type: 'success' });
    } catch (error) {
      setToastInfo({ message: `Lỗi: ${error.message}`, type: 'danger' });
    }
  };

  const handleVacated = async (orderId) => {
    try {
      await markTableVacated(orderId, 'waiter');
      setToastInfo({ message: 'Đã cập nhật: khách đã rời bàn!', type: 'success' });
    } catch (error) {
      setToastInfo({ message: `Lỗi: ${error.message}`, type: 'danger' });
    }
  };

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.CANCELLED),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === ORDER_STATUS.COMPLETED),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Tab Filter
    if (filterTab === 'ACTIVE') result = activeOrders;
    if (filterTab === 'DONE') result = completedOrders;
    
    // Search Filter
    if (searchTable.trim()) {
      result = result.filter(o => o.table_id && String(o.table_id).toLowerCase().includes(searchTable.toLowerCase()));
    }
    
    return result;
  }, [orders, activeOrders, completedOrders, filterTab, searchTable]);

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
            <div className="small text-muted">Cập nhật lúc</div>
            <div className="fw-semibold">{currentTime.toLocaleTimeString('vi-VN')}</div>
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

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-3 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
            <div className="d-flex gap-2">
              <button 
                className={`btn btn-sm px-3 rounded-pill ${filterTab === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilterTab('ALL')}
              >
                Tất cả ({orders.length})
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-pill ${filterTab === 'ACTIVE' ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                onClick={() => setFilterTab('ACTIVE')}
              >
                Đang phục vụ ({activeOrders.length})
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-pill ${filterTab === 'DONE' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setFilterTab('DONE')}
              >
                Đã xong ({completedOrders.length})
              </button>
            </div>
            <div className="position-relative" style={{ maxWidth: '300px' }}>
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-light border-0" 
                placeholder="Tìm số bàn..." 
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5 bg-white shadow-sm" style={{ borderRadius: '1.25rem' }}>
            <div style={{ fontSize: '4rem', opacity: 0.5 }}>🍽️</div>
            <h5 className="mt-3">Không tìm thấy đơn nào</h5>
            <p className="text-muted">
              {orders.length === 0 ? 'Chưa có khách nào đặt bàn.' : 'Không có đơn nào khớp với bộ lọc hiện tại.'}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="col-md-6 col-xl-4">
                <OrderCard order={order} onComplete={handleComplete} onVacated={handleVacated} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastInfo && (
        <Toast 
          message={toastInfo.message} 
          type={toastInfo.type} 
          onClose={() => setToastInfo(null)} 
        />
      )}
    </div>
  );
};

export default WaiterDashboard;
