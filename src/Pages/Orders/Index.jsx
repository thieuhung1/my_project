import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const fmt = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') + 'đ' : n);
const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Orders = () => {
  const { isAuthenticated, userProfile } = useAuth();
  const { cart, finalTotal, appliedCoupon, checkout, subtotal } = useCart();
  const navigate = useNavigate();
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderType, setOrderType] = useState('DELIVERY');
  const [tableId, setTableId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  useEffect(() => { if (error) setError(''); }, [phone, address, tableId]);

  if (!isAuthenticated) {
    return (
      <div className="container my-5 text-center py-5 fade-in-up">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{width:80, height:80, background:'var(--light-orange)'}}>
          <i className="bi bi-lock fs-1" style={{color:'var(--primary-orange)'}}></i>
        </div>
        <h3 className="fw-bold">Đăng nhập để thanh toán</h3>
        <Link to="/signin" className="btn btn-warning text-white rounded-pill px-4 mt-3 shadow-orange btn-ripple">Đăng nhập</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container my-5 text-center fade-in-up">
        <div className="py-5">
          <div className="display-1 mb-3">🛒</div>
          <h3 className="fw-bold">Giỏ hàng trống</h3>
          <p className="text-muted">Thêm món trước khi thanh toán nhé</p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/products" className="btn btn-warning text-white rounded-pill px-4 shadow-orange"><i className="bi bi-cart-plus me-2"/>Mua sắm</Link>
            <Link to="/my-orders" className="btn btn-outline-primary rounded-pill px-4"><i className="bi bi-receipt me-2"/>Lịch sử</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (orderType === 'DELIVERY') {
      if (!phoneRegex.test(phone)) { setError('Số điện thoại không hợp lệ'); return; }
      if (!address || address.length < 10) { setError('Vui lòng nhập địa chỉ chi tiết'); return; }
      if (!address.toLowerCase().includes('nghệ an')) { setError('FoodHub chỉ giao trong Nghệ An'); return; }
    } else {
      if (!tableId.trim()) { setError('Vui lòng nhập số bàn'); return; }
    }

    setLoading(true);
    try {
      const resolvedPaymentMethod = orderType === 'DINE_IN' ? 'COD' : paymentMethod;
      const orderId = await checkout({
        type: orderType,
        tableId: orderType === 'DINE_IN' ? tableId : null,
        phone,
        address,
        paymentMethod: resolvedPaymentMethod,
        note,
        coupon: appliedCoupon || null,
      });

      if (orderType !== 'DINE_IN' && resolvedPaymentMethod === 'VNPAY') {
        const response = await fetch(`${API_BASE}/api/vnpay/create-payment-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount: finalTotal,
            orderInfo: `Thanh toan don hang ${orderId}`,
            locale: 'vn',
          }),
        });

        const data = await response.json();
        if (!response.ok || !data?.success || !data?.paymentUrl) {
          throw new Error(data?.message || 'Không tạo được URL thanh toán VNPay');
        }

        window.location.href = data.paymentUrl;
        return;
      }

      navigate(`/checkout/${orderId}?status=success`, { replace: true });
    } catch (err) {
      setError(err.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5 fade-in-up">
      <div className="d-flex align-items-center mb-4">
        <Link to="/cart" className="btn btn-outline-secondary btn-sm rounded-pill me-3"><i className="bi bi-arrow-left"/> Giỏ</Link>
        <h1 className="fw-bold m-0 flex-grow-1 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>Thanh toán</h1>
        <Link to="/my-orders" className="btn btn-outline-primary btn-sm rounded-pill"><i className="bi bi-receipt me-1"/>Lịch sử</Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex gap-2 mb-4">
                {['DELIVERY','DINE_IN'].map(t => (
                  <button key={t} type="button" onClick={()=>setOrderType(t)}
                    className={`btn flex-grow-1 rounded-pill btn-ripple ${orderType===t?'btn-warning text-white shadow-orange':'btn-outline-warning'}`}>
                    <i className={`bi ${t==='DELIVERY'?'bi-truck':'bi-shop'} me-2`}/>{t==='DELIVERY'?'Giao hàng':'Ăn tại quán'}
                  </button>
                ))}
              </div>

              <h5 className="fw-bold mb-3">{orderType==='DELIVERY'?'📍 Thông tin giao hàng':'🪑 Thông tin bàn'}</h5>
              
              {error && <div className="alert alert-danger slide-in-right" style={{borderRadius:12}}>{error}</div>}

              <form onSubmit={handleCheckout}>
                <div className="row g-3">
                  {orderType==='DELIVERY' ? <>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Số điện thoại *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white"><i className="bi bi-telephone" style={{color:'var(--primary-orange)'}}/></span>
                        <input type="tel" className="form-control" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0912345678" required/>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Thanh toán</label>
                      <select className="form-select" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                        <option value="COD">Tiền mặt khi nhận</option>
                        <option value="VNPAY">VNPay</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Địa chỉ *</label>
                      <textarea className="form-control" rows="2" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Số nhà, đường, phường - TP Vinh, Nghệ An" required/>
                      <div className="form-text">Giao trong 30-45 phút, miễn phí nội thành Vinh</div>
                    </div>
                  </> : <>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Số bàn *</label>
                      <input className="form-control form-control-lg" value={tableId} onChange={e=>setTableId(e.target.value)} placeholder="Ví dụ: Bàn 5" required style={{borderRadius:12}}/>
                    </div>
                  </>}
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <input className="form-control" value={note} onChange={e=>setNote(e.target.value)} placeholder="Ít cay, không hành..."/>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-success btn-lg w-100 mt-4 rounded-pill shadow-sm btn-ripple">
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Đang xử lý...</> : `Đặt hàng - ${fmt(finalTotal)}`}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{top:90, borderRadius:'var(--border-radius)'}}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">Đơn hàng</h5>
                <span className="badge badge-gradient rounded-pill">{cart.length} món</span>
              </div>

              <div className="mb-3" style={{maxHeight:280, overflowY:'auto'}}>
                {cart.map(item=>(
                  <div key={item.id} className="d-flex gap-2 mb-2 pb-2 border-bottom">
                    <img src={item.imageUrl||item.image||'/ASSETS/Images/placeholder.jpg'} alt={item.name} className="rounded blur-up" style={{width:48,height:48,objectFit:'cover'}} onLoad={e=>e.currentTarget.classList.add('loaded')}/>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-truncate" style={{maxWidth:150}}>{item.name}</div>
                      <div className="text-muted" style={{fontSize:12}}>x{item.quantity}</div>
                    </div>
                    <div className="small fw-bold">{fmt(item.price*item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Tạm tính</span><span>{fmt(subtotal)}</span></div>
              {appliedCoupon && <div className="d-flex justify-content-between mb-2 text-success"><span>Giảm {appliedCoupon.code}</span><span>-{fmt(appliedCoupon.discountAmount)}</span></div>}
              <div className="d-flex justify-content-between mb-2 text-success"><span>Phí ship</span><span>Miễn phí</span></div>
              <hr/>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Tổng</span>
                <span className="h4 mb-0 fw-bold" style={{color:'var(--primary-orange)'}}>{fmt(finalTotal)}</span>
              </div>
              <div className="text-center mt-2"><small className="text-muted"><i className="bi bi-clock me-1"/>Dự kiến: 30-45 phút</small></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;