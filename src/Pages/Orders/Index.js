import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import useOrders from '../../backend/hooks/useOrders';

const fmt = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VNĐ' : n);
const ORDER_STATUS_LABEL = {
  PENDING: 'Chờ xử lý',
  WAITING_FOR_SHIPPER: 'Chờ shipper',
  CONFIRMED: 'Đã xác nhận',
  DELIVERING: 'Đang giao',
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

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, finalTotal, appliedCoupon, checkout, subtotal } = useCart();
  const navigate = useNavigate();
  const { orders, error } = useOrders(user?.uid);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderType, setOrderType] = useState('DELIVERY'); // 'DELIVERY' or 'DINE_IN'
  const [tableId, setTableId] = useState('');
  const [note, setNote] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Track loading from hook
  useEffect(() => {
    // Simulate loading complete after orders load (since loading not destructured)
    const timer = setTimeout(() => setIsLoadingOrders(false), 500);
    return () => clearTimeout(timer);
  }, [orders]);

  if (!isAuthenticated) {
    return <div className="container my-5 text-center"><h2>Vui lòng <Link to="/signin">đăng nhập</Link> để thanh toán</h2></div>;
  }

  if (cart.length === 0) {
    if (error) return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger">
          <h5>Lỗi tải đơn hàng: {error}</h5>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );

    return (
      <div className="container my-5 animate__animated animate__fadeIn">
        <h1 className="fw-bold mb-3">Đơn hàng của tôi</h1>
        {isLoadingOrders ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
            <p className="mt-3">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted py-5">
            <div className="display-6 mb-2">🧾</div>
            Bạn chưa có đơn hàng nào.
            <div className="mt-3"><Link to="/products" className="btn btn-warning">Bắt đầu mua sắm</Link></div>
          </div>
        ) : (
          <div className="row g-3">
            {orders.map(order => (
              <div key={order.id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0 text-warning">Đơn #{order.id.slice(-6).toUpperCase()}</h6>
                      <span className={`badge bg-${ORDER_STATUS_COLOR[order.status] || 'secondary'}`}>{ORDER_STATUS_LABEL[order.status] || order.status}</span>
                    </div>
                    <p className="small text-muted mb-1">
                      Ngày đặt: {order.createdAt?.toDate()?.toLocaleDateString('vi-VN') || new Date().toLocaleDateString('vi-VN')}
                    </p>
                    <p className="fw-bold mb-2 small">
                      {order.subtotal !== undefined && order.discountAmount > 0 && (
                        <>
                          <span className="text-decoration-line-through text-muted me-1">{fmt(order.subtotal || 0)}</span>
                        </>
                      )}
                      <span className="text-danger">{fmt(order.totalAmount || 0)}</span>
                    </p>
                    {order.couponCode && <div className="small text-success mb-2">Mã: {order.couponCode}</div>}
                    <div className="border-top pt-2 small text-truncate">📍 {order.address}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Checkout form
  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    if (orderType === 'DELIVERY') {
      if (!phone || !address) {
        setCheckoutError('Vui lòng nhập số điện thoại và địa chỉ!');
        return;
      }
      if (!address.toLowerCase().includes('nghệ an')) {
        setCheckoutError('Rất tiếc, FoodHub hiện chỉ hỗ trợ giao hàng tại tỉnh Nghệ An.');
        return;
      }
    } else {
      if (!tableId) {
        setCheckoutError('Vui lòng nhập số bàn!');
        return;
      }
    }

    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      await checkout({
        type: orderType,
        tableId: orderType === 'DINE_IN' ? tableId : null,
        phone: phone || '',
        address: address || '',
        paymentMethod: orderType === 'DINE_IN' ? 'CASH' : paymentMethod,
        note,
        coupon: appliedCoupon || null
      });
      setOrderType('DELIVERY'); // Reset after checkout to show orders list
      setPhone('');
      setAddress('');
      setTableId('');
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="d-flex align-items-center mb-4">
        <Link to="/cart" className="btn btn-outline-secondary btn-sm me-3">
          <i className="bi bi-arrow-left" /> Giỏ hàng
        </Link>
        <h1 className="fw-bold m-0 flex-grow-1">Thanh toán</h1>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex gap-2 mb-4">
                <button 
                  className={`btn flex-grow-1 ${orderType === 'DELIVERY' ? 'btn-warning shadow-orange' : 'btn-outline-warning'}`}
                  onClick={() => setOrderType('DELIVERY')}
                >
                  <i className="bi bi-truck me-2" /> Giao hàng
                </button>
                <button 
                  className={`btn flex-grow-1 ${orderType === 'DINE_IN' ? 'btn-warning shadow-orange' : 'btn-outline-warning'}`}
                  onClick={() => setOrderType('DINE_IN')}
                >
                  <i className="bi bi-shop me-2" /> Ăn tại quán
                </button>
              </div>

              <h5 className="fw-bold mb-3">
                {orderType === 'DELIVERY' ? '📍 Thông tin giao hàng' : '🪑 Thông tin bàn'}
              </h5>
              <form onSubmit={handleCheckout}>
                <div className="row g-3">
                  {orderType === 'DELIVERY' ? (
                    <>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Số điện thoại *</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="09xxxxxxxx"
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phương thức thanh toán</label>
                        <select 
                          className="form-select" 
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="COD">💰 Thanh toán khi nhận hàng (COD)</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Địa chỉ giao hàng *</label>
                        <textarea 
                          className="form-control" 
                          rows="2"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Số nhà, đường, phường, quận, thành phố (Nghệ An)"
                          required 
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Chọn bàn / Nhập số bàn *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={tableId}
                        onChange={(e) => setTableId(e.target.value)}
                        placeholder="Ví dụ: Bàn 5, Bàn 12..."
                        required 
                      />
                      <div className="form-text mt-1 text-muted">
                        * Nhân viên sẽ hỗ trợ phục vụ tại bàn ngay sau khi bạn đặt món.
                      </div>
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Yêu cầu đặc biệt (ăn chay, ít cay...)"
                    />
                  </div>
                </div>
                {checkoutError && <div className="alert alert-danger mt-3">{checkoutError}</div>}
                <button 
                  type="submit" 
                  className="btn btn-success btn-lg w-100 mt-4 shadow-sm"
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    `Đặt hàng (${fmt(finalTotal)})`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 sticky-top" style={{top: '1rem'}}>
            <div className="card-body">
              <h5 className="fw-bold mb-3">📦 Đơn hàng</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính ({cart.length} món)</span>
                <span className="fw-semibold">{fmt(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2 text-success fw-semibold">
                  <span>Mã {appliedCoupon.code}</span>
                  <span>-{fmt(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Phí ship</span>
                <span>Miễn phí</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-0">
                <span className="h5 fw-bold mb-0">Tổng cộng</span>
                <span className="h4 text-danger fw-bold">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;

