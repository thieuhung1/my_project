import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const fmt = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VNĐ' : n);

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const { cart, finalTotal, appliedCoupon, checkout, subtotal } = useCart();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderType, setOrderType] = useState('DELIVERY');
  const [tableId, setTableId] = useState('');
  const [note, setNote] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // ── Chưa đăng nhập ──
  if (!isAuthenticated) {
    return (
      <div className="container my-5 text-center">
        <h2>Vui lòng <Link to="/signin">đăng nhập</Link> để thanh toán</h2>
      </div>
    );
  }

  // ── Giỏ hàng trống → chuyển sang lịch sử đơn hàng ──
  if (cart.length === 0) {
    return (
      <div className="container my-5 text-center animate__animated animate__fadeIn">
        <div className="py-5">
          <div className="display-4 mb-3">🛒</div>
          <h3 className="fw-bold mb-2">Giỏ hàng trống</h3>
          <p className="text-muted mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng để thanh toán.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/products" className="btn btn-warning px-4">
              <i className="bi bi-cart-plus me-2" />Mua sắm ngay
            </Link>
            <Link to="/my-orders" className="btn btn-outline-primary px-4">
              <i className="bi bi-receipt me-2" />Xem lịch sử mua hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Xử lý đặt hàng ──
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
      // Đặt hàng thành công → chuyển sang trang lịch sử
      navigate('/my-orders');
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
        <Link to="/my-orders" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-receipt me-1" />Lịch sử đơn
        </Link>
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
          <div className="card shadow-sm border-0 sticky-top" style={{top: '5rem'}}>
            <div className="card-body">
              <h5 className="fw-bold mb-3">📦 Đơn hàng</h5>
              {/* Danh sách sản phẩm trong giỏ */}
              <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item.id} className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                    <div style={{ width: 40, height: 40, flexShrink: 0 }}>
                      {(item.imageUrl || item.image) ? (
                        <img
                          src={item.imageUrl || item.image}
                          alt={item.name}
                          className="rounded"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                          <i className="bi bi-image text-muted small" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-truncate" style={{ maxWidth: '140px' }}>{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>x{item.quantity}</div>
                    </div>
                    <div className="small fw-bold">{fmt(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
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
