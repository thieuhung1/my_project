import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    dispatch,
    subtotal,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
    finalTotal
  } = useCart();

  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const fmt = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') + '₫' : n);

  const handleApplyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    try {
      setLoadingCoupon(true);
      setCouponError('');
      await applyCoupon(code);
      setCoupon('');
    } catch (error) {
      setCouponError(error.message || 'Mã không hợp lệ');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const updateQty = (id, qty) => {
    const q = Math.max(1, parseInt(qty || '1', 10));
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: q } });
  };

  if (cart.length === 0) {
    return (
      <div className="container my-5 text-center fade-in-up">
        <div className="py-5" style={{maxWidth:'560px', margin:'0 auto'}}>
          <div className="mb-4" style={{
            width:120, height:120, margin:'0 auto',
            background:'linear-gradient(135deg, var(--light-orange), #fff)',
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'var(--shadow-md)'
          }}>
            <i className="bi bi-cart3" style={{fontSize:'3rem', color:'var(--primary-orange)'}}></i>
          </div>
          <h2 className="fw-bold mb-2" style={{fontFamily:'Roboto Condensed, sans-serif'}}>Giỏ hàng trống</h2>
          <p className="text-muted mb-4">Bạn chưa thêm món nào. Khám phá menu và chọn món yêu thích nhé!</p>
          <Link to="/products" className="btn btn-warning text-white btn-lg rounded-pill px-4 shadow-orange">
            <i className="bi bi-bag-plus me-2" /> Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="container my-5 fade-in-up">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
        <div>
          <h1 className="fw-bold m-0 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>
            <i className="bi bi-cart-check me-2"></i>Giỏ Hàng
          </h1>
          <p className="text-muted mb-0 mt-1">{totalItems} sản phẩm trong giỏ</p>
        </div>
        <button className="btn btn-outline-danger btn-sm rounded-pill mt-2 mt-md-0" onClick={() => dispatch({type:'CLEAR_CART'})}>
          <i className="bi bi-trash me-1" /> Xóa tất cả
        </button>
      </div>

      <div className="row g-4">
        {/* List */}
        <div className="col-lg-8">
          {/* Desktop table */}
          <div className="d-none d-md-block">
            <div className="card border-0 shadow-sm" style={{borderRadius:'var(--border-radius)'}}>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead style={{background:'var(--gray-light)'}}>
                    <tr>
                      <th className="ps-4" style={{width:'50%'}}>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th style={{width:150}}>Số lượng</th>
                      <th>Tạm tính</th>
                      <th className="text-end pe-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id} className="border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.imageUrl || item.image || '/ASSETS/Images/placeholder.jpg'}
                              alt={item.name}
                              className="rounded-3"
                              style={{ width: 72, height: 72, objectFit: 'cover' }}
                              onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
                            />
                            <div>
                              <div className="fw-semibold">{item.name}</div>
                              {item.note && <div className="small text-muted">{item.note}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="text-muted">{fmt(item.price)}</td>
                        <td>
                          <div className="input-group input-group-sm" style={{maxWidth:140, borderRadius:'10px', overflow:'hidden'}}>
                            <button className="btn btn-outline-secondary" onClick={()=>updateQty(item.id, item.quantity-1)}>-</button>
                            <input type="number" className="form-control text-center" min="1" value={item.quantity} onChange={(e)=>updateQty(item.id, e.target.value)} />
                            <button className="btn btn-outline-secondary" onClick={()=>updateQty(item.id, item.quantity+1)}>+</button>
                          </div>
                        </td>
                        <td className="fw-semibold" style={{color:'var(--primary-orange)'}}>{fmt(item.price * item.quantity)}</td>
                        <td className="text-end pe-4">
                          <button className="btn btn-light btn-sm rounded-circle" onClick={()=>dispatch({type:'REMOVE_FROM_CART', payload:{id:item.id}})} title="Xóa">
                            <i className="bi bi-x-lg text-danger" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="d-md-none d-grid gap-3">
            {cart.map(item => (
              <div key={item.id} className="card border-0 shadow-sm" style={{borderRadius:'16px'}}>
                <div className="card-body p-3 d-flex gap-3">
                  <img src={item.imageUrl || item.image || '/ASSETS/Images/placeholder.jpg'} alt={item.name} className="rounded-3" style={{width:80, height:80, objectFit:'cover'}} onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}/>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <h6 className="mb-1 fw-bold">{item.name}</h6>
                      <button className="btn btn-sm btn-link text-danger p-0" onClick={()=>dispatch({type:'REMOVE_FROM_CART', payload:{id:item.id}})}><i className="bi bi-trash"></i></button>
                    </div>
                    <div className="text-muted small mb-2">{fmt(item.price)}</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="input-group input-group-sm" style={{maxWidth:120}}>
                        <button className="btn btn-outline-secondary" onClick={()=>updateQty(item.id, item.quantity-1)}>-</button>
                        <input type="number" className="form-control text-center" value={item.quantity} min="1" onChange={(e)=>updateQty(item.id, e.target.value)} />
                        <button className="btn btn-outline-secondary" onClick={()=>updateQty(item.id, item.quantity+1)}>+</button>
                      </div>
                      <span className="fw-bold" style={{color:'var(--primary-orange)'}}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link to="/products" className="btn btn-link mt-3 ps-0 text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Tiếp tục mua sắm
          </Link>
        </div>

        {/* Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{top:'100px', borderRadius:'var(--border-radius)'}}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Tóm tắt đơn hàng</h5>

              {/* Coupon */}
              <div className="mb-3">
                <label className="form-label small text-muted">Mã giảm giá</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: GIAM10"
                    value={coupon}
                    onChange={(e)=>setCoupon(e.target.value.toUpperCase())}
                    onKeyDown={(e)=> e.key==='Enter' && handleApplyCoupon()}
                  />
                  <button className="btn btn-warning text-white" type="button" onClick={handleApplyCoupon} disabled={loadingCoupon}>
                    {loadingCoupon ? <span className="spinner-border spinner-border-sm"></span> : 'Áp dụng'}
                  </button>
                </div>
                {couponError && <div className="text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{couponError}</div>}
                {appliedCoupon && (
                  <div className="alert alert-success py-2 px-3 mt-2 small d-flex justify-content-between align-items-center" style={{borderRadius:'10px'}}>
                    <span><i className="bi bi-check-circle-fill me-1"></i>{appliedCoupon.code} -{fmt(appliedCoupon.discountAmount)}</span>
                    <button className="btn btn-sm btn-link p-0 text-success" onClick={clearCoupon}><i className="bi bi-x-lg"></i></button>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính ({totalItems} món)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Giảm giá</span>
                  <span>-{fmt(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Phí vận chuyển</span>
                <span className="fw-semibold text-success">Miễn phí</span>
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Tổng thanh toán</span>
                <span className="h4 m-0 fw-bold" style={{color:'var(--primary-orange)'}}>{fmt(finalTotal)}</span>
              </div>

              <button className="btn btn-warning text-white btn-lg w-100 rounded-pill shadow-orange mb-2" onClick={()=>navigate('/orders')}>
                <i className="bi bi-credit-card me-2" /> Thanh toán ngay
              </button>
              
              <div className="text-center">
                <small className="text-muted"><i className="bi bi-shield-check me-1"></i>Thanh toán an toàn & bảo mật</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;