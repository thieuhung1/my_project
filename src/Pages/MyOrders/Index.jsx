import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useOrders from '../../features/hooks/useOrders';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../features/models/Order.model';

const PAYMENT_STATUS_LABEL = {
  UNPAID: 'Chưa thanh toán',
  PENDING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
};

const PAYMENT_STATUS_COLOR = {
  UNPAID: 'secondary',
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
};

const ORDER_STATUS_ICON = {
  PENDING: 'bi-hourglass-split',
  WAITING_FOR_SHIPPER: 'bi-person-walking',
  CONFIRMED: 'bi-check-circle',
  DELIVERING: 'bi-truck',
  COMPLETED: 'bi-bag-check',
  FAILED: 'bi-x-octagon',
  CANCELLED: 'bi-slash-circle',
};

const FILTER_TABS = [
  { key: 'ALL', label: 'Tất cả', icon: 'bi-list-ul' },
  { key: 'PENDING', label: 'Chờ xử lý', icon: 'bi-hourglass-split' },
  { key: 'WAITING_FOR_SHIPPER', label: 'Chờ shipper', icon: 'bi-person-walking' },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: 'bi-check-circle' },
  { key: 'DELIVERING', label: 'Đang giao', icon: 'bi-truck' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: 'bi-bag-check' },
  { key: 'FAILED', label: 'Thất bại', icon: 'bi-x-octagon' },
  { key: 'CANCELLED', label: 'Đã hủy', icon: 'bi-slash-circle' },
];

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'WAITING_FOR_SHIPPER', 'DELIVERING', 'COMPLETED'];

const fmt = (n) => (typeof n === 'number' ? `${n.toLocaleString('vi-VN')} VNĐ` : n);

const getOrderTime = (order) => order.createdAt?.toMillis?.() || (order.createdAt?.seconds ? order.createdAt.seconds * 1000 : 0);

const SkeletonOrderCard = () => (
  <div className="card border-0 shadow-sm p-3 placeholder-glow">
    <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
      <span className="placeholder col-4 rounded" />
      <span className="placeholder col-2 rounded" />
    </div>
    <span className="placeholder col-6 rounded mb-2" />
    <span className="placeholder col-8 rounded mb-2" />
    <span className="placeholder col-5 rounded mb-3" />
    <div className="d-flex justify-content-between align-items-center gap-3">
      <span className="placeholder col-2 rounded" />
      <span className="placeholder col-3 rounded" />
    </div>
  </div>
);

const LoginPrompt = () => (
  <div className="container my-5 text-center py-5">
    <i className="bi bi-box-arrow-in-right display-1 mb-3 opacity-50 d-block" />
    <h4>Vui lòng đăng nhập để xem lịch sử mua hàng</h4>
    <Link to="/signin" className="btn btn-warning btn-lg mt-3">
      <i className="bi bi-box-arrow-in-right me-2" />Đăng nhập
    </Link>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="container my-5 text-center">
    <div className="alert alert-danger d-inline-flex align-items-center gap-2 flex-wrap">
      <i className="bi bi-exclamation-triangle-fill fs-4" />
      <div>
        <strong>Lỗi:</strong> {error}
      </div>
      <button className="btn btn-outline-danger btn-sm ms-0 ms-sm-3" onClick={onRetry}>
        <i className="bi bi-arrow-clockwise me-1" />Thử lại
      </button>
    </div>
  </div>
);

const OrderTimeline = ({ order }) => {
  const currentStep = STATUS_STEPS.indexOf((order.status || '').toUpperCase());
  const orderStatus = (order.status || '').toUpperCase();

  return (
    <div className="position-relative my-3 px-1">
      <div className="position-absolute top-50 start-0 end-0 border-top" style={{ zIndex: 0 }} />
      <div className="d-flex justify-content-between gap-2 position-relative" style={{ zIndex: 1 }}>
        {STATUS_STEPS.map((step, index) => {
          const active = index <= currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={step} className="d-flex flex-column align-items-center text-center" style={{ minWidth: 56 }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center border ${active ? 'bg-warning text-white border-warning' : 'bg-light text-muted'}`}
                style={{ width: 30, height: 30 }}
                title={ORDER_STATUS_LABEL[step] || step}
              >
                <i className={`bi ${ORDER_STATUS_ICON[step]} small`} />
              </div>
              <small className={`mt-1 ${isCurrent ? 'fw-semibold text-dark' : 'text-muted'}`} style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                {ORDER_STATUS_LABEL[step] || step}
              </small>
            </div>
          );
        })}
      </div>
      {['FAILED', 'CANCELLED'].includes(orderStatus) && (
        <div className="alert alert-light border mt-3 mb-0 py-2 small">
          <i className={`bi ${ORDER_STATUS_ICON[orderStatus] || 'bi-info-circle'} me-1`} />
          Đơn hàng đã được cập nhật sang trạng thái {ORDER_STATUS_LABEL[orderStatus] || orderStatus || 'không xác định'}.
        </div>
      )}
    </div>
  );
};

const MyOrders = () => {
  const { user } = useAuth();
  const { orders = [], loading, error, refetch } = useOrders(user?.uid);
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    const upper = filterStatus.toUpperCase();
    return [...orders]
      .filter((order) => upper === 'ALL' || (order.status || '').toUpperCase() === upper)
      .sort((a, b) => getOrderTime(b) - getOrderTime(a));
  }, [orders, filterStatus]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING' || o.status === 'WAITING_FOR_SHIPPER').length,
    delivering: orders.filter((o) => o.status === 'DELIVERING' || o.status === 'CONFIRMED').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED' || o.status === 'FAILED').length,
  }), [orders]);

  if (!user) return <LoginPrompt />;
  if (loading) {
    return (
      <div className="container my-5 animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-4 gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Link to="/products" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left" /> Mua sắm
            </Link>
            <h1 className="fw-bold mb-0 fs-3">📋 Lịch sử mua hàng</h1>
          </div>
        </div>
        <div className="row g-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12">
              <SkeletonOrderCard />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const getFilterCount = (key) => {
    if (key === 'ALL') return orders.length;
    return orders.filter((order) => (order.status || '').toUpperCase() === key).length;
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link to="/products" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left" /> Mua sắm
          </Link>
          <h1 className="fw-bold mb-0 fs-3">📋 Lịch sử mua hàng</h1>
          <span className="badge bg-warning text-dark fs-6">{filteredOrders.length}</span>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="d-flex gap-2 flex-wrap overflow-auto pb-1">
            {FILTER_TABS.map((tab) => {
              const count = getFilterCount(tab.key);
              const active = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 flex-shrink-0 ${active ? 'btn-warning text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterStatus(tab.key)}
                >
                  <i className={`bi ${tab.icon} me-1`} />
                  {tab.label}
                  <span className={`ms-2 badge ${active ? 'bg-white text-dark' : 'bg-light text-dark'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="row g-2 mb-4">
          {[
            { label: 'Tổng đơn', value: stats.total, color: 'primary', icon: 'bi-receipt' },
            { label: 'Chờ xử lý', value: stats.pending, color: 'warning', icon: 'bi-hourglass-split' },
            { label: 'Đang giao', value: stats.delivering, color: 'info', icon: 'bi-truck' },
            { label: 'Hoàn thành', value: stats.completed, color: 'success', icon: 'bi-check-circle' },
            { label: 'Đã hủy', value: stats.cancelled, color: 'danger', icon: 'bi-x-circle' },
          ].map((s) => (
            <div key={s.label} className="col-6 col-lg-2">
              <div className={`card border-0 bg-${s.color} bg-opacity-10 text-center py-2 h-100`}>
                <div className={`text-${s.color} fw-bold fs-4`}>
                  <i className={`bi ${s.icon} me-1`} />{s.value}
                </div>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-receipt display-1 mb-3 opacity-50 d-block" />
          <h4>{filterStatus === 'ALL' ? 'Chưa có đơn hàng nào' : 'Không có đơn nào ở trạng thái này'}</h4>
          <Link to="/products" className="btn btn-warning mt-2">
            <i className="bi bi-cart-plus me-1" />Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const statusKey = (order.status || '').toUpperCase();
            const statusColor = ORDER_STATUS_COLOR[statusKey] || 'secondary';
            const statusLabel = ORDER_STATUS_LABEL[statusKey] || order.status || 'N/A';
            const statusIcon = ORDER_STATUS_ICON[statusKey] || 'bi-question-circle';
            const paymentKey = (order.paymentStatus || '').toUpperCase();
            const paymentColor = PAYMENT_STATUS_COLOR[paymentKey] || 'secondary';
            const primaryItem = order.items?.[0];

            return (
              <div key={order.id} className={`card shadow-sm border-start border-4 border-${statusColor}`} style={{ overflow: 'hidden' }}>
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <h6 className="mb-0 fw-bold" style={{ color: 'var(--primary-orange, #ff6b35)' }}>
                          Đơn #{String(order.id).slice(-8).toUpperCase()}
                        </h6>
                        <span className={`badge bg-${statusColor} d-inline-flex align-items-center gap-1`}>
                          <i className={`bi ${statusIcon}`} />
                          {statusLabel}
                        </span>
                        <span className={`badge bg-${paymentColor} bg-opacity-10 text-${paymentColor} border`}>
                          <i className="bi bi-shield-check me-1" />
                          {PAYMENT_STATUS_LABEL[paymentKey] || order.paymentStatus || 'Chưa thanh toán'}
                        </span>
                        <span className={`badge bg-light text-dark border`}>
                          <i className={`bi ${order.type === 'DINE_IN' ? 'bi-shop' : 'bi-truck'} me-1`} />
                          {order.type === 'DINE_IN' ? 'Tại quán' : 'Giao hàng'}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-3 text-muted small mb-3">
                        <span>
                          <i className="bi bi-calendar3 me-1" />
                          {order.createdAt?.toDate?.()
                            ? order.createdAt.toDate().toLocaleString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                        <span>
                          <i className={`bi ${order.type === 'DINE_IN' ? 'bi-geo-alt' : 'bi-house-door'} me-1`} />
                          {order.address || (order.table_id ? `Bàn ${order.table_id}` : 'N/A')}
                        </span>
                      </div>

                      <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <div className="rounded-3 overflow-hidden bg-light border" style={{ width: 72, height: 72, flexShrink: 0 }}>
                            {primaryItem?.imageUrl ? (
                              <img
                                src={primaryItem.imageUrl}
                                alt={primaryItem.productName || 'Sản phẩm'}
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                <i className="bi bi-image" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="fw-semibold">{primaryItem ? primaryItem.productName : 'Đơn hàng của bạn'}</div>
                            <div className="text-muted small">
                              {order.items?.length || 0} món • {fmt(order.totalAmount || 0)}
                            </div>
                            {order.couponCode && (
                              <div className="small text-success mt-1">
                                <i className="bi bi-tag-fill me-1" />Mã: {order.couponCode}
                                {order.discountAmount > 0 && ` (-${fmt(order.discountAmount)})`}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-sm-end">
                          <div className="text-muted small">Tổng cộng</div>
                          {order.subtotal && order.discountAmount > 0 && (
                            <div className="text-decoration-line-through text-muted small">{fmt(order.subtotal)}</div>
                          )}
                          <div className="h5 mb-0 fw-bold text-danger">{fmt(order.totalAmount || 0)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2" style={{ minWidth: 180 }}>
                      {order.paymentStatus !== 'PAID' && (
                        <button
                          type="button"
                          className="btn btn-warning text-white btn-sm"
                          onClick={() => navigate(`/checkout/${order.id}`)}
                        >
                          Thanh toán ngay
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn btn-sm ${isExpanded ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`} />
                        {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="card-footer bg-light border-top p-3 p-md-4" style={{ animation: 'fadeIn 0.3s ease' }}>
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-list-ul me-1" />Danh sách món:
                    </h6>

                    <div className="list-group list-group-flush mb-3">
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
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                            <div className="fw-bold small text-end">{fmt(item.price * item.quantity)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <OrderTimeline order={order} />

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

                    {order.note && (
                      <div className="mt-3 p-2 bg-white rounded border">
                        <small className="text-muted d-block mb-1">
                          <i className="bi bi-chat-left-text me-1" />Ghi chú:
                        </small>
                        <div className="small">{order.note}</div>
                      </div>
                    )}

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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
