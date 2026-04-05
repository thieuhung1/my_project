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

  if (loading) return <div className="container my-5 text-center"><div className="spinner-border text-warning"></div></div>;
  if (error) return <div className="container my-5 text-center text-danger"><h5>{error}</h5></div>;

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Đơn Hàng Của Tôi</h1>
      <div className="row">
        {orders.length === 0 ? (
          <div className="text-center text-muted">Bạn chưa có đơn hàng nào.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="col-md-6 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0 text-warning">Đơn #{order.id.slice(-6).toUpperCase()}</h5>
                    <span className={`badge bg-${ORDER_STATUS_COLOR[order.status]}`}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="small text-muted mb-1">
                    Ngày đặt: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('vi-VN') : 'Đang xử lý...'}
                  </p>
                  <p className="fw-bold mb-3">
                    Tổng tiền: <span className="text-danger">{order.totalAmount?.toLocaleString()} VNĐ</span>
                  </p>
                  <div className="border-top pt-2">
                    <p className="small mb-0 text-truncate">
                      Giao đến: {order.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
