import React, { useState, useEffect } from 'react';
import { useAuth, getOrdersByShipper, updateOrderStatus } from '../../backend';
import './Shipper.css';

const Shipper = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getOrdersByShipper(user.uid);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching shipper orders:", error);
      alert("Lỗi khi lấy dữ liệu đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert("Đã cập nhật trạng thái đơn hàng !");
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Phân loại đơn
  const activeOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'delivering');
  const historyOrders = orders.filter(o => o.status === 'delivered' || o.status === 'failed');

  return (
    <div className="shipper-dashboard container mt-5 pt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-truck me-2 text-primary"></i>
          Giao Hàng
        </h2>
        <span className="badge bg-primary fs-6">{activeOrders.length} Đơn cần giao</span>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <h4 className="mb-3">Đơn Đang Xử Lý</h4>
          {activeOrders.length === 0 ? (
            <div className="alert alert-info border-0 shadow-sm">
              <i className="bi bi-emoji-smile me-2"></i>Hiện không có đơn hàng nào cần giao.
            </div>
          ) : (
            activeOrders.map(order => (
              <div className={`order-card status-${order.status}`} key={order.id}>
                <div className="order-header">
                  <strong>Mã TT: #{order.id.substring(0,6)}</strong>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'confirmed' ? 'Chờ lấy hàng' : 'Đang đi giao'}
                  </span>
                </div>
                <div className="order-body">
                  <div className="customer-info row">
                    <div className="col-sm-6">
                      <p><i className="bi bi-person me-2 text-muted"></i> <strong>{order.customerName}</strong></p>
                      <p><i className="bi bi-telephone me-2 text-muted"></i> <a href={`tel:${order.phone}`}>{order.phone}</a></p>
                      <p className="text-danger fw-bold"><i className="bi bi-cash me-2"></i> {order.totalAmount?.toLocaleString()}đ</p>
                    </div>
                    <div className="col-sm-6">
                      <p><i className="bi bi-geo-alt me-2 text-muted"></i> {order.address}</p>
                      {order.note && <p><i className="bi bi-chat-left-text me-2 text-muted"></i> <span className="fst-italic">{order.note}</span></p>}
                    </div>
                  </div>
                </div>
                <div className="order-actions">
                  {order.status === 'confirmed' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleUpdateStatus(order.id, 'delivering')}
                    >
                      <i className="bi bi-box-seam me-2"></i>Bắt đầu giao
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleUpdateStatus(order.id, 'failed')}
                      >
                        <i className="bi bi-x-circle me-2"></i>Giao thất bại
                      </button>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      >
                        <i className="bi bi-check-circle me-2"></i>Hoàn thành
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="col-lg-4">
          <h4 className="mb-3">Lịch Sử Khách Nhận</h4>
          <div className="bg-white rounded shadow-sm p-3 border">
            {historyOrders.length === 0 ? (
              <p className="text-muted text-center my-3">Chưa có lịch sử.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {historyOrders.slice(0, 10).map(order => (
                  <li className="list-group-item px-0 py-2" key={order.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="fw-semibold">#{order.id.substring(0,6)}</small>
                      <span className={`badge ${order.status === 'delivered' ? 'bg-success' : 'bg-secondary'}`}>
                        {order.status === 'delivered' ? 'Thành công' : 'Thất bại'}
                      </span>
                    </div>
                    <small className="text-muted">{order.customerName}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipper;
