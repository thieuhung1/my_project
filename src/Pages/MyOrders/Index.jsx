import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useOrders from '../../backend/hooks/useOrders';

// ── Hằng số trạng thái (UPPERCASE — khớp với orderService.js) ──
const ORDER_STATUS_LABEL = {
  PENDING: 'Chờ xử lý',
  WAITING_FOR_SHIPPER: 'Chờ shipper',
  CONFIRMED: 'Đã xác nhận',
  DELIVERING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy'
};

const ORDER_STATUS_COLOR = {
  PENDING: 'warning',
  WAITING_FOR_SHIPPER: 'secondary',
  CONFIRMED: 'info',
  DELIVERING: 'primary',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'dark'
};

const ORDER_STATUS_ICON = {
  PENDING: 'bi-hourglass-split',
  WAITING_FOR_SHIPPER: 'bi-person-walking',
  CONFIRMED: 'bi-check-circle',
  DELIVERING: 'bi-truck',
  COMPLETED: 'bi-bag-check',
  FAILED: 'bi-x-octagon',
  CANCELLED: 'bi-slash-circle'
};

const fmt = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VNĐ' : n);

const MyOrders = () => {
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useOrders(user?.uid);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (orders) {
      const normalizedFolderStatus = filterStatus.toUpperCase();
      const filtered = orders.filter(o => {
        const s = (o.status || '').toUpperCase();
        return normalizedFolderStatus === 'ALL' || s === normalizedFolderStatus;
      });
      // Sắp xếp theo thời gian mới nhất
      setFilteredOrders(
        [...filtered].sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        })
      );
    }
  }, [orders, filterStatus]);

  // ── Loading state ──
  if (loading) return (
    <div className="container my-5 text-center py-5">
      <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">Đang tải lịch sử đơn hàng...</p>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div className="container my-5 text-center">
      <div className="alert alert-danger d-inline-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill fs-4" />
        <div>
          <strong>Lỗi:</strong> {error}
        </div>
        <button className="btn btn-outline-danger btn-sm ms-3" onClick={refetch}>
          <i className="bi bi-arrow-clockwise me-1" />Thử lại
        </button>
      </div>
    </div>
  );

  // ── Thống kê nhanh ──
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING' || o.status === 'WAITING_FOR_SHIPPER').length,
    delivering: orders.filter(o => o.status === 'DELIVERING' || o.status === 'CONFIRMED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED' || o.status === 'FAILED').length,
  };

  // ── No user / No orders check ──
  if (!user) {
    return (
      <div className="container my-5 text-center py-5">
        <i className="bi bi-box-arrow-in-right display-1 mb-3 opacity-50 d-block" />
        <h4>Vui lòng đăng nhập để xem lịch sử mua hàng</h4>
        <Link to="/signin" className="btn btn-warning btn-lg mt-3">
          <i className="bi bi-box-arrow-in-right me-2" />Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
  
      {/* ── Header ── */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div className="d-flex align-items-center gap-2">
          <Link to="/products" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left" /> Mua sắm
          </Link>
          <h1 className="fw-bold mb-0 fs-3">📋 Lịch sử mua hàng</h1>
          <span className="badge bg-warning text-dark fs-6">{filteredOrders.length}</span>
        </div>
        <select
          className="form-select w-auto"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="WAITING_FOR_SHIPPER">Chờ shipper</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="DELIVERING">Đang giao</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="FAILED">Thất bại</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* ── Thống kê nhanh ── */}
      {orders.length > 0 && (
        <div className="row g-2 mb-4">
          {[
            { label: 'Tổng đơn', value: stats.total, color: 'primary', icon: 'bi-receipt' },
            { label: 'Chờ xử lý', value: stats.pending, color: 'warning', icon: 'bi-hourglass-split' },
            { label: 'Đang giao', value: stats.delivering, color: 'info', icon: 'bi-truck' },
            { label: 'Hoàn thành', value: stats.completed, color: 'success', icon: 'bi-check-circle' },
            { label: 'Đã hủy', value: stats.cancelled, color: 'danger', icon: 'bi-x-circle' },
          ].map((s, idx) => (
            <div key={idx} className="col">
              <div className={`card border-0 bg-${s.color} bg-opacity-10 text-center py-2`}>
                <div className={`text-${s.color} fw-bold fs-4`}>
                  <i className={`bi ${s.icon} me-1`} />{s.value}
                </div>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Danh sách đơn hàng ── */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-receipt display-1 mb-3 opacity-50 d-block" />
          <h4>{filterStatus === 'ALL' ? 'Chưa có đơn hàng nào' : 'Không có đơn nào ở trạng thái này'}</h4>
          <Link to="/products" className="btn btn-warning mt-2">
            <i className="bi bi-cart-plus me-1" />Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrder === order.id;
            const statusKey = (order.status || '').toUpperCase();
            const statusColor = ORDER_STATUS_COLOR[statusKey] || 'secondary';
            const statusLabel = ORDER_STATUS_LABEL[statusKey] || order.status || 'N/A';
            const statusIcon = ORDER_STATUS_ICON[statusKey] || 'bi-question-circle';

            return (
              <div key={order.id} className="col-lg-6 col-xl-4">
                <div
                  className={`card shadow-sm h-100 border-start border-4 border-${statusColor}`}
                  style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  {/* Card Header */}
                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <div>
                      <h6 className="mb-0 fw-bold" style={{ color: 'var(--primary-orange, #ff6b35)' }}>
                        Đơn #{order.id.slice(-8).toUpperCase()}
                      </h6>
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1" />
                        {order.createdAt?.toDate?.()
                          ? order.createdAt.toDate().toLocaleString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : 'N/A'
                        }
                      </small>
                    </div>
                    <span className={`badge bg-${statusColor} d-flex align-items-center gap-1`}>
                      <i className={`bi ${statusIcon}`} />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body pb-2">
                    {/* Loại đơn */}
                    <div className="mb-2">
                      <span className={`badge bg-light text-dark border me-1`}>
                        <i className={`bi ${order.type === 'DINE_IN' ? 'bi-shop' : 'bi-truck'} me-1`} />
                        {order.type === 'DINE_IN' ? 'Tại quán' : 'Giao hàng'}
                      </span>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-wallet2 me-1" />
                        {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod || 'Tiền mặt'}
                      </span>
                    </div>

                    {/* Mã giảm giá */}
                    {order.couponCode && (
                      <div className="mb-2">
                        <span className="badge bg-success bg-opacity-10 text-success border border-success">
                          <i className="bi bi-tag-fill me-1" />Mã: {order.couponCode}
                          {order.discountAmount > 0 && ` (-${fmt(order.discountAmount)})`}
                        </span>
                      </div>
                    )}

                    {/* Địa chỉ / Bàn */}
                    <div className="small text-muted mb-2 text-truncate">
                      <i className={`bi ${order.type === 'DINE_IN' ? 'bi-geo-alt' : 'bi-house-door'} me-1`} />
                      {order.address || (order.table_id ? `Bàn ${order.table_id}` : 'N/A')}
                    </div>

                    {/* Giá */}
                    <div className="d-flex justify-content-between align-items-end">
                      <small className="text-muted">{order.items?.length || 0} món</small>
                      <div className="text-end">
                        {order.subtotal && order.discountAmount > 0 && (
                          <div className="text-decoration-line-through text-muted small">{fmt(order.subtotal)}</div>
                        )}
                        <div className="h5 mb-0 fw-bold text-danger">{fmt(order.totalAmount || 0)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle chi tiết */}
                  <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
                    <button
                      className={`btn btn-sm w-100 ${isExpanded ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`} />
                      {isExpanded ? 'Ẩn chi tiết' : `Xem chi tiết (${order.items?.length || 0} món)`}
                    </button>
                  </div>

                  {/* Chi tiết đơn hàng (expanded) */}
                  {isExpanded && (
                    <div className="card-footer bg-light border-top p-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3">
                        <i className="bi bi-list-ul me-1" />Danh sách món:
                      </h6>
                      <div className="list-group list-group-flush">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="list-group-item bg-transparent px-0 py-2 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 48, height: 48, flexShrink: 0 }}>
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="rounded"
                                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                    <i className="bi bi-image text-muted" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-semibold small">{item.productName}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {fmt(item.price)} × {item.quantity}
                                </div>
                              </div>
                              <div className="fw-bold small text-end">
                                {fmt(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tổng kết */}
                      <div className="mt-3 pt-2 border-top">
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted">Tạm tính:</span>
                          <span>{fmt(order.subtotal || order.totalAmount || 0)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="d-flex justify-content-between small text-success">
                            <span>Giảm giá:</span>
                            <span>-{fmt(order.discountAmount)}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold mt-1">
                          <span>Tổng cộng:</span>
                          <span className="text-danger">{fmt(order.totalAmount || 0)}</span>
                        </div>
                      </div>

                      {/* Ghi chú */}
                      {order.note && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <small className="text-muted d-block mb-1">
                            <i className="bi bi-chat-left-text me-1" />Ghi chú:
                          </small>
                          <div className="small">{order.note}</div>
                        </div>
                      )}

                      {/* Thông tin shipper */}
                      {order.shipperName && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <small className="text-muted d-block mb-1">
                            <i className="bi bi-person-badge me-1" />Shipper:
                          </small>
                          <div className="small fw-semibold">{order.shipperName}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
