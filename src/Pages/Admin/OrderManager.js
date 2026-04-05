import React, { useState, useEffect } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
  assignOrderToShipper,
  getUsersByRole
} from '../../backend';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedShippers] = await Promise.all([
        getAllOrders(),
        getUsersByRole('staff')
      ]);
      setOrders(fetchedOrders);
      setShippers(fetchedShippers);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      alert("Đã cập nhật trạng thái đơn hàng !");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  const handleAssignShipper = async (orderId, shipperId) => {
    if (!shipperId) return;
    try {
      const shipper = shippers.find(s => s.id === shipperId);
      await assignOrderToShipper(orderId, shipperId, shipper?.displayName || 'Shipper');
      alert("Đã phân công Shipper thành công !");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Lỗi phân công Shipper.");
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="order-manager p-4">
      <h2 className="mb-4 fs-4 fw-bold">Quản Lý Đơn Hàng</h2>
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Shipper</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">Chưa có đơn hàng nào.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td><small className="text-muted">{order.id.substring(0, 8)}</small></td>
                    <td>
                      <strong>{order.customerName}</strong><br />
                      <small className="text-muted">{order.phone}</small>
                    </td>
                    <td className="text-danger fw-bold">{order.totalAmount?.toLocaleString()}đ</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status === 'pending' ? 'Chờ xác nhận' :
                          order.status === 'confirmed' ? 'Đã xác nhận' :
                            order.status === 'delivering' ? 'Đang giao' :
                              order.status === 'delivered' ? 'Đã giao' :
                                order.status === 'cancelled' ? 'Đã hủy' :
                                  order.status === 'failed' ? 'Giao thất bại' : order.status}
                      </span>
                    </td>
                    <td>
                      {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                        <select
                          className="form-select form-select-sm"
                          value={order.shipperId || ''}
                          onChange={(e) => handleAssignShipper(order.id, e.target.value)}
                          style={{ minWidth: '150px' }}
                        >
                          <option value="">-- Chọn Shipper --</option>
                          {shippers.map(s => (
                            <option key={s.id} value={s.id}>{s.displayName || s.email}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-muted small">
                          {order.shipperName || 'Không có'}
                        </span>
                      )}
                    </td>
                    <td>
                      {order.status === 'pending' && (
                        <button className="btn btn-sm btn-outline-success action-btn me-2" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>
                          Xác nhận
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button className="btn btn-sm btn-outline-danger action-btn" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                          Huỷ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}