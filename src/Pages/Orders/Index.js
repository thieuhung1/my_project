import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../backend';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, error } = useOrders(user?.uid);

  if (!isAuthenticated) {
    return <div className="container my-5 text-center"><h2>Vui lòng <Link to="/signin">đăng nhập</Link> để xem đơn hàng</h2></div>;
  }
  if (loading) return <div className="container my-5 text-center"><div className="spinner-border text-warning" /></div>;
  if (error) return <div className="container my-5 text-center text-danger"><h5>{error}</h5></div>;

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1 className="fw-bold mb-3">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <div className="text-center text-muted py-5">
          <div className="display-6 mb-2">🧾</div>
          Bạn chưa có đơn hàng nào.
          <div className="mt-3"><Link to="/products" className="btn btn-warning">Bắt đầu mua sắm</Link></div>
        </div>
      ) : (
        <div className="row g-3">
          {orders.map(order => (
            <div key={order.id} className="col-md-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0 text-warning">Đơn #{order.id.slice(-6).toUpperCase()}</h5>
                    <span className={`badge bg-${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>
                  </div>
                  <p className="small text-muted mb-1">
                    Ngày đặt: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('vi-VN') : 'Đang xử lý...'}
                  </p>
                  <p className="fw-bold mb-2">Tổng tiền: <span className="text-danger">{order.totalAmount?.toLocaleString('vi-VN')} VNĐ</span></p>
                  <div className="border-top pt-2 small text-truncate">Giao đến: {order.address}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;