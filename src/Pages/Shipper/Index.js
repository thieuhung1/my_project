import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../backend/services/orderService';

const ShipperDashboard = () => {
    const { user, userProfile } = useAuth();
    const [myOrders, setMyOrders] = useState([]);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // 1. Lắng nghe đơn của riêng mình
        const qMy = query(
            collection(db, 'orders'),
            where('shipper_id', '==', user.uid),
            where('status', 'in', [ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING]),
            orderBy('createdAt', 'desc')
        );

        // 2. Lắng nghe đơn đang chờ shipper
        const qAvail = query(
            collection(db, 'orders'),
            where('status', '==', ORDER_STATUS.WAITING_FOR_SHIPPER),
            orderBy('createdAt', 'desc')
        );

        const unsubMy = onSnapshot(qMy, (snap) => {
            setMyOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        const unsubAvail = onSnapshot(qAvail, (snap) => {
            setAvailableOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubMy(); unsubAvail(); };
    }, [user]);

    const handleAcceptOrder = async (orderId) => {
        if (myOrders.length >= 3) {
            alert('Bạn đã nhận tối đa 3 đơn. Hãy hoàn thành bớt để nhận thêm!');
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');
                if (orderSnap.data().status !== ORDER_STATUS.WAITING_FOR_SHIPPER) {
                    throw new Error('Đơn hàng này vừa có người nhận rồi!');
                }

                transaction.update(orderRef, {
                    shipper_id: user.uid,
                    shipperName: userProfile?.displayName || user.displayName || 'Shipper',
                    status: ORDER_STATUS.CONFIRMED,
                    updatedAt: serverTimestamp()
                });
            });
            alert('Nhận đơn thành công!');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleUpdateStatus = async (orderId, nextStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const updates = { 
                status: nextStatus,
                updatedAt: serverTimestamp() 
            };
            
            // Nếu hoàn thành thì cập nhật luôn paymentStatus cho COD
            if (nextStatus === ORDER_STATUS.COMPLETED) {
                updates.paymentStatus = PAYMENT_STATUS.PAID;
            }

            await runTransaction(db, async (t) => {
                t.update(orderRef, updates);
            });
            alert('Cập nhật thành công!');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    if (loading) return <div className="text-center py-5">Đang tải...</div>;

    return (
        <div className="container my-5">
            <h1 className="fw-bold mb-4">Dashboard Giao Hàng</h1>

            <div className="row g-4">
                {/* CỘT ĐƠN ĐANG NHẬN */}
                <div className="col-lg-7">
                    <h4 className="mb-3">Đơn đang giao ({myOrders.length}/3)</h4>
                    {myOrders.length === 0 ? (
                        <div className="alert alert-light border shadow-sm">Chưa có đơn nào. Hãy nhận đơn bên phải!</div>
                    ) : (
                        myOrders.map(order => (
                            <div key={order.id} className="card shadow-sm mb-3 border-start border-4 border-primary">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="fw-bold text-primary">#{order.id.slice(-6).toUpperCase()}</h6>
                                            <p className="mb-1"><strong>Khách:</strong> {order.userName}</p>
                                            <p className="mb-1"><strong>SĐT:</strong> {order.phone}</p>
                                            <p className="mb-1"><strong>Đ/C:</strong> {order.address}</p>
                                        </div>
                                        <span className={`badge bg-${order.status === ORDER_STATUS.DELIVERING ? 'primary' : 'info'}`}>
                                            {order.status === ORDER_STATUS.DELIVERING ? 'ĐANG GIAO' : 'ĐÃ NHẬN'}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="h5 mb-0 text-danger fw-bold">{order.totalAmount?.toLocaleString()}đ</span>
                                        <div className="d-flex gap-2">
                                            {order.status === ORDER_STATUS.CONFIRMED && (
                                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.DELIVERING)}>Lấy hàng</button>
                                            )}
                                            {order.status === ORDER_STATUS.DELIVERING && (
                                                <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.COMPLETED)}>Hoàn thành (COD)</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* CỘT ĐƠN ĐANG CHỜ */}
                <div className="col-lg-5">
                    <h4 className="mb-3 text-secondary">Đơn đang chờ nhận</h4>
                    {availableOrders.length === 0 ? (
                        <div className="text-muted small">Hiện không có đơn nào đang chờ.</div>
                    ) : (
                        availableOrders.map(order => (
                            <div key={order.id} className="card shadow-sm mb-2">
                                <div className="card-body py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold small">#{order.id.slice(-6).toUpperCase()}</div>
                                            <div className="small text-muted text-truncate" style={{maxWidth: 150}}>{order.address}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-danger fw-bold small mb-1">{order.totalAmount?.toLocaleString()}đ</div>
                                            <button className="btn btn-outline-warning btn-sm py-0" onClick={() => handleAcceptOrder(order.id)}>Nhận đơn</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipperDashboard;
