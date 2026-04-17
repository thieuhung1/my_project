import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { ORDER_STATUS } from '../../backend/services/orderService';
import './Shipper.css';

const MAX_ORDERS_PER_SHIPPER = 5;

// Chuyển snapshot thành list object để code gọn hơn.
const mapSnapshot = (snapshot) => snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

// Sắp xếp theo thời gian tạo mới nhất ngay trên client để tránh phụ thuộc composite index.
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
  const [availableOrders, setAvailableOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [allShippers, setAllShippers] = useState([]);
  const [allActiveOrders, setAllActiveOrders] = useState([]);

  // Cập nhật shipper + đơn active realtime để tính số đơn mỗi shipper.
  useEffect(() => {
    const qShippers = query(collection(db, 'users'), where('role', '==', 'staff'));
    const qActiveOrders = query(
      collection(db, 'orders'),
      where('status', 'in', [ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING])
    );

    const unsubShippers = onSnapshot(qShippers, (snapshot) => {
      setAllShippers(sortByCreatedAtDesc(mapSnapshot(snapshot)));
    });

    const unsubActiveOrders = onSnapshot(qActiveOrders, (snapshot) => {
      setAllActiveOrders(sortByCreatedAtDesc(mapSnapshot(snapshot)));
    });

    return () => {
      unsubShippers();
      unsubActiveOrders();
    };
  }, []);

  // Lấy đơn của shipper hiện tại và các đơn có thể nhận.
  useEffect(() => {
    if (!user) return;

    const qMy = query(
      collection(db, 'orders'),
      where('shipperId', '==', user.uid),
      where('status', 'in', [ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING])
    );

    const qAvail = query(
      collection(db, 'orders'),
      where('status', 'in', [ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED])
    );

    const qPending = query(
      collection(db, 'orders'),
      where('status', 'in', [ORDER_STATUS.PENDING, ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED]),
      where('type', '==', 'DELIVERY')
    );

    const unsubMy = onSnapshot(qMy, (snapshot) => {
      setMyOrders(sortByCreatedAtDesc(mapSnapshot(snapshot)));
      setLoading(false);
    });

    const unsubAvail = onSnapshot(qAvail, (snapshot) =>
      setAvailableOrders(sortByCreatedAtDesc(mapSnapshot(snapshot)))
    );
    const unsubPending = onSnapshot(qPending, (snapshot) =>
      setPendingOrders(sortByCreatedAtDesc(mapSnapshot(snapshot)))
    );

    return () => {
      unsubMy();
      unsubAvail();
      unsubPending();
    };
  }, [user]);

  // Tính trạng thái shipper dựa trên số đơn đang active.
  const shippersWithCapacity = useMemo(() => {
    return allShippers.map((shipper) => {
      const orderCount = allActiveOrders.filter((order) => order.shipperId === shipper.id).length;
      return {
        ...shipper,
        orderCount,
        isAvailable: orderCount < MAX_ORDERS_PER_SHIPPER,
      };
    });
  }, [allShippers, allActiveOrders]);

  const availableShippers = useMemo(
    () => shippersWithCapacity.filter((shipper) => shipper.isAvailable),
    [shippersWithCapacity]
  );

  const updateOrder = async (orderId, data) => {
    // Gom update vào 1 chỗ để giảm lặp và dễ bảo trì.
    await updateDoc(doc(db, 'orders', orderId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const handleAcceptOrder = async (orderId) => {
    if (!user) return;
    await updateOrder(orderId, {
      shipperId: user.uid,
      shipperName: userProfile?.displayName || user.displayName || 'Shipper',
      status: ORDER_STATUS.CONFIRMED,
    });
  };

  const handleAcceptPendingOrder = async (orderId) => {
    await handleAcceptOrder(orderId);
  };

  const handleAcceptOrderForShipper = async (orderId, shipper) => {
    if (!shipper) return;
    await updateOrder(orderId, {
      shipperId: shipper.id,
      shipperName: shipper.displayName || shipper.email || 'Shipper',
      status: ORDER_STATUS.CONFIRMED,
    });
    setSelectedShipper(null);
  };

  const handleUpdateStatus = async (orderId, status) => {
    await updateOrder(orderId, { status });
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Dashboard Giao Hàng</h1>
            <p className="text-muted mb-0">Xin chào, {userProfile?.displayName || 'Shipper'}</p>
          </div>
          <div className="text-end">
            <div className="small text-muted">Đơn của bạn</div>
            <div className="h4 fw-bold text-primary mb-0">{myOrders.length}/{MAX_ORDERS_PER_SHIPPER}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small">Shipper rảnh</div>
              <div className="h5 fw-bold">{availableShippers.length} người</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small">Đơn chờ xác nhận</div>
              <div className="h5 fw-bold text-warning">{pendingOrders.length}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3">
              <div className="text-muted small">Đơn chờ nhận</div>
              <div className="h5 fw-bold text-secondary">{availableOrders.length}</div>
            </div>
          </div>
        </div>

        {/* Shipper list */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Shipper đang rảnh</h6>
          <div className="d-flex flex-wrap gap-2">
            {availableShippers.map((shipper) => (
              <button
                key={shipper.id}
                type="button"
                onClick={() => setSelectedShipper(shipper)}
                className={`bg-white rounded-pill shadow-sm px-3 py-2 d-flex align-items-center gap-2 border-0 ${selectedShipper?.id === shipper.id ? 'border border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <span className="bg-success rounded-circle" style={{ width: 8, height: 8 }} />
                <span className="fw-medium small">{shipper.displayName || shipper.email}</span>
                <span className="badge bg-light text-dark">{shipper.orderCount}/{MAX_ORDERS_PER_SHIPPER}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedShipper && (
          <div className="alert alert-light border mb-4 d-flex justify-content-between align-items-center">
            <strong>Gán đơn cho: {selectedShipper.displayName || selectedShipper.email}</strong>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setSelectedShipper(null)} />
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-7">
            <h5 className="mb-3">Đơn đang giao</h5>
            {myOrders.length === 0 ? (
              <div className="order-card">
                <div className="order-body text-center text-muted py-4">
                  Chưa có đơn nào. Nhận đơn ở cột bên phải nhé!
                </div>
              </div>
            ) : (
              myOrders.map((order) => (
                <div key={order.id} className={`order-card status-${getStatusClass(order.status)}`}>
                  <div className="order-header">
                    <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="order-body customer-info">
                    <p><strong>Khách:</strong> {order.userName}</p>
                    <p><strong>SĐT:</strong> {order.phone}</p>
                    <p><strong>Đ/C:</strong> {order.address}</p>
                  </div>
                  <div className="order-actions">
                    <span className="me-auto fw-bold text-danger fs-5">
                      {order.totalAmount?.toLocaleString()}đ
                    </span>
                    {order.status === ORDER_STATUS.CONFIRMED && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.DELIVERING)}
                      >
                        Lấy hàng
                      </button>
                    )}
                    {order.status === ORDER_STATUS.DELIVERING && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.COMPLETED)}
                      >
                        Hoàn thành
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="col-lg-5">
            <h6 className="text-warning fw-bold mb-2">Đơn chờ xác nhận</h6>
            {pendingOrders.map((order) => (
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
                    <button
                      type="button"
                      className="btn btn-warning btn-sm mt-1"
                      onClick={() => handleAcceptPendingOrder(order.id)}
                    >
                      Nhận ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <h6 className="text-secondary fw-bold mt-4 mb-2">Đơn đang chờ nhận</h6>
            {availableOrders.map((order) => (
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
                    <button
                      type="button"
                      className="btn btn-outline-warning btn-sm mt-1"
                      onClick={() => (selectedShipper ? handleAcceptOrderForShipper(order.id, selectedShipper) : handleAcceptOrder(order.id))}
                    >
                      {selectedShipper ? 'Gán' : 'Nhận đơn'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;