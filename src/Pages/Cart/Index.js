import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const Cart = () => {
  const { cart, dispatch } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) return (
    <div className="container my-5 text-center animate__animated animate__fadeIn">
      <h2>Giỏ hàng trống</h2>
      <Link to="/products" className="btn btn-warning btn-lg">Mua Sắm</Link>
    </div>
  );

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Giỏ Hàng Của Bạn</h1>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Sản Phẩm</th>
              <th>Giá</th>
              <th>Số Lượng</th>
              <th>Tổng</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price.toLocaleString()} VNĐ</td>
                <td>
                  <input type="number" className="form-control w-50 d-inline" min="1" value={item.quantity} 
                    onChange={(e) => dispatch({type: 'UPDATE_QUANTITY', payload: {id: item.id, quantity: parseInt(e.target.value)}})} />
                </td>
                <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => dispatch({type: 'REMOVE_FROM_CART', payload: {id: item.id}})}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row justify-content-end">
        <div className="col-md-4">
          <h3>Tổng Tiền: {total.toLocaleString()} VNĐ</h3>
          <Link to="/orders" className="btn btn-success btn-lg w-100">Thanh Toán</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
