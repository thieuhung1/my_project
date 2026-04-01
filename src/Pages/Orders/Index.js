import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Orders = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div className="container my-5 text-center"><h2>Vui lòng <a href="/signin">đăng nhập</a> để xem đơn hàng</h2></div>;
  }

  const mockOrders = [
    { id: 1, date: '2025-01-15', total: 150000, status: 'Đã giao' },
    { id: 2, date: '2025-01-14', total: 80000, status: 'Đang giao' },
  ];

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Đơn Hàng Của Tôi</h1>
      <div className="row">
        {mockOrders.map(order => (
          <div key={order.id} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5>Đơn #{order.id}</h5>
                <p>Ngày: {order.date}</p>
                <p>Tổng: {order.total.toLocaleString()} VNĐ</p>
                <span className={`badge ${order.status === 'Đã giao' ? 'bg-success' : 'bg-warning'}`}>{order.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
