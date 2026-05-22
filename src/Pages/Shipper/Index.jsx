import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase.Config.js';
import { useAuth } from '../../contexts/AuthContext';
import {
  ORDER_STATUS,
  claimDeliveryOrder,
  startDeliveringOrder,
  completeDeliveryOrder,
} from '../../features/services';
import '../../styles/Shipper.css';

const mapSnapshot = (snapshot) => snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

const sortByCreatedAtDesc = (list) =>
  [...list].sort((a, b) => {
    const timeA = a.createdAt?.toDate?.()?.getTime?.() || 0;
    const timeB = b.createdAt?.toDate?.()?.getTime?.() || 0;
    return timeB - timeA;
  });

const getStatusClass = (status) => {
  switch (status) {
    case ORDER_STATUS.DELIVERING:
      return 'delivering';
    case ORDER_STATUS.CONFIRMED:
      return 'confirmed';
    case ORDER_STATUS.COMPLETED:
      return 'delivered';
    default:
      return 'failed';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case ORDER_STATUS.DELIVERING:
      return 'ĐANG GIAO';
    case ORDER_STATUS.CONFIRMED:
      return 'ĐÃ NHẬN';
    case ORDER_STATUS.COMPLETED:
      return 'HOÀN THÀNH';
    default:
      return status;
  }
};

const ShipperDashboard = () => {
  const { user, userProfile } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [waitingOrders, setWaitingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const qMy = query(
      collection(db, 'orders'),
      where('shipperId', '==', user.uid),
      where('status', 'in', [ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING])
    );

    const qWaiting = query(
      collection(db, 'orders'),
      where('type', '==', 'DELIVERY'),
      where('status', 'in', [ORDER_STATUS.PENDING, ORDER_STATUS.WAITING_FOR_SHIPPER])
    );

    const unsubMy = onSnapshot(qMy, (snapshot) => {
      setMyOrders(sortByCreatedAtDesc(mapSnapshot(snapshot)));
      setLoading(false);
    });

    const unsubWaiting = onSnapshot(qWaiting, (snapshot) => {
      setWaitingOrders(sortByCreatedAtDesc(mapSnapshot(snapshot)));
    });

    return () => {
      unsubMy();
      unsubWaiting();
    };
  }, [user]);

  const stats = useMemo(
    () => ({
      myActive: myOrders.length,
      waitingPool: waitingOrders.length,
      delivering: myOrders.filter((o) => o.status === ORDER_STATUS.DELIVERING).length,
    }),
    [myOrders, waitingOrders]
  );

  const handleClaim = async (orderId) => {
    if (!user) return;
    await claimDeliveryOrder(orderId, user.uid, userProfile?.displayName || user.displayName || 'Shipper');
  };

  const handleStartDelivering = async (orderId) => {
    if (!user) return;
    await startDeliveringOrder(orderId, user.uid);
  };

  const handleComplete = async (orderId) => {
    if (!user) return;
    await completeDeliveryOrder(orderId, user.uid);
  };

  if (loading) {
    return (
      <div className="shipper-dashboard d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="shipper-dashboard">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Dashboard Giao Hàng</h1>
            <p className="text-muted mb-0">Xin chào, {userProfile?.displayName || 'Shipper'}</p>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small">Đơn chờ shipper nhận</div>
              <div className="h5 fw-bold text-secondary">{stats.waitingPool}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small">Đơn của tôi (active)</div>
              <div className="h5 fw-bold text-primary">{stats.myActive}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small">Đang giao</div>
              <div className="h5 fw-bold text-warning">{stats.delivering}</div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <h5 className="mb-3">Đơn chờ nhận</h5>
            {waitingOrders.length === 0 ? (
              <div className="order-card">
                <div className="order-body text-center text-muted py-4">Hiện không có đơn chờ nhận.</div>
              </div>
            ) : (
              waitingOrders.map((order) => (
                <div key={order.id} className="order-card mb-2">
                  <div className="order-body py-2 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold small">#{order.id.slice(-6).toUpperCase()}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: 180 }}>
                        {order.address}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-danger small">{order.totalAmount?.toLocaleString()}đ</div>
                      <button type="button" className="btn btn-warning btn-sm mt-1" onClick={() => handleClaim(order.id)}>
                        Nhận đơn
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="col-lg-7">
            <h5 className="mb-3">Đơn của tôi</h5>
            {myOrders.length === 0 ? (
              <div className="order-card">
                <div className="order-body text-center text-muted py-4">Chưa có đơn nào. Nhận đơn ở cột bên trái nhé!</div>
              </div>
            ) : (
              myOrders.map((order) => (
                <div key={order.id} className={`order-card status-${getStatusClass(order.status)}`}>
                  <div className="order-header">
                    <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>{getStatusLabel(order.status)}</span>
                  </div>
                  <div className="order-body customer-info">
                    <p><strong>Khách:</strong> {order.userName}</p>
                    <p><strong>SĐT:</strong> {order.phone}</p>
                    <p><strong>Đ/C:</strong> {order.address}</p>
                  </div>
                  <div className="order-actions">
                    <span className="me-auto fw-bold text-danger fs-5">{order.totalAmount?.toLocaleString()}đ</span>
                    {order.status === ORDER_STATUS.CONFIRMED && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleStartDelivering(order.id)}>
                        Bắt đầu giao
                      </button>
                    )}
                    {order.status === ORDER_STATUS.DELIVERING && (
                      <button type="button" className="btn btn-success btn-sm" onClick={() => handleComplete(order.id)}>
                        Giao thành công
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;
