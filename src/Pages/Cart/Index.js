import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const fmt = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VNĐ' : n);

const Cart = () => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="container my-5 text-center animate__animated animate__fadeIn">
        <div className="py-5">
          <div className="display-5 mb-3">🛒</div>
          <h2 className="fw-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted mb-4">Hãy thêm món yêu thích vào giỏ nhé!</p>
          <Link to="/products" className="btn btn-warning btn-lg shadow-orange">
            <i className="bi bi-bag-plus me-2" /> Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="d-flex align-items-end justify-content-between mb-3">
        <h1 className="fw-bold m-0">Giỏ Hàng</h1>
        <button className="btn btn-outline-danger btn-sm" onClick={() => dispatch({type:'CLEAR_CART'})}>
          <i className="bi bi-trash me-1" /> Xoá tất cả
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded-3 bg-white">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Sản phẩm</th>
              <th className="text-nowrap">Đơn giá</th>
              <th style={{width:160}}>Số lượng</th>
              <th className="text-nowrap">Tạm tính</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.imageUrl || item.image || '/ASSETS/Images/placeholder.jpg'}
                      alt={item.name}
                      className="rounded"
                      style={{ width: 64, height: 64, objectFit: 'cover' }}
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
                  <div className="input-group input-group-sm" style={{maxWidth:160}}>
                    <button className="btn btn-outline-secondary" onClick={()=>dispatch({type:'UPDATE_QUANTITY', payload:{id:item.id, quantity: Math.max(1, item.quantity-1)}})}>-</button>
                    <input
                      type="number" className="form-control text-center"
                      min="1" value={item.quantity}
                      onChange={(e)=>dispatch({type:'UPDATE_QUANTITY', payload:{id:item.id, quantity: Math.max(1, parseInt(e.target.value||'1',10))}})}
                    />
                    <button className="btn btn-outline-secondary" onClick={()=>dispatch({type:'UPDATE_QUANTITY', payload:{id:item.id, quantity: item.quantity+1}})}>+</button>
                  </div>
                </td>
                <td className="fw-semibold">{fmt(item.price * item.quantity)}</td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={()=>dispatch({type:'REMOVE_FROM_CART', payload:{id:item.id}})}>
                    <i className="bi bi-x-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row justify-content-end mt-4 g-3">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính</span>
                <span className="fw-semibold">{fmt(total)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Phí ship</span>
                <span className="fw-semibold text-success">Miễn phí</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Tổng cộng</span>
                <span className="h4 m-0 text-danger">{fmt(total)}</span>
              </div>
              <button className="btn btn-success btn-lg w-100 shadow-sm" onClick={()=>navigate('/orders')}>
                <i className="bi bi-credit-card me-2" /> Thanh toán
              </button>
              <Link to="/products" className="btn btn-link w-100 mt-2">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;