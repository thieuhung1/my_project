import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../backend/services/orderService';

const ShipperDashboard = () => {
    const { user, userProfile } = useAuth();
    const [myOrders, setMyOrders] = useState([]);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [allShippers, setAllShippers] = useState([]);
    const [allActiveOrders, setAllActiveOrders] = useState([]);

    // Lắng nghe danh sách shipper và đơn hàng đang giao để tính toán real-time
    useEffect(() => {
        // Lắng nghe danh sách shipper
        const qShippers = query(
            collection(db, 'users'),
            where('role', '==', 'staff')
        );

        // Lắng nghe tất cả đơn hàng đang giao (CONFIRMED hoặc DELIVERING)
        const qActiveOrders = query(
            collection(db, 'orders'),
            where('status', 'in', [ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING])
        );

        const unsubShippers = onSnapshot(qShippers, (snap) => {
            const shipperList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllShippers(prevShippers => {
                // Cập nhật lại thông tin shipper dựa trên đơn hàng hiện tại
                if (allActiveOrders.length > 0) {
                    return shipperList.map(shipper => {
                        const orderCount = allActiveOrders.filter(o => o.shipper_id === shipper.id).length;
                        return { ...shipper, orderCount, isAvailable: orderCount < 5 };
                    });
                }
                return shipperList.map(s => ({ ...s, orderCount: 0, isAvailable: true }));
            });
        });

        const unsubActiveOrders = onSnapshot(qActiveOrders, (snap) => {
            const ordersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllActiveOrders(ordersData);

            // Cập nhật lại số đơn của shipper
            setAllShippers(prevShippers => {
                return prevShippers.map(shipper => {
                    const orderCount = ordersData.filter(o => o.shipper_id === shipper.id).length;
                    return { ...shipper, orderCount, isAvailable: orderCount < 5 };
                });
            });
        });

        return () => { unsubShippers(); unsubActiveOrders(); };
    }, []);

    // Shipper đang rảnh (dưới 5 đơn)
    const availableShippers = allShippers.filter(s => s.isAvailable);

    useEffect(() => {
        if (!user) return;

        // 1. Lắng nghe đơn của riêng mình
        const qMy = query(
            collection(db, 'orders'),
            where('shipper_id', '==', user.uid),
            where('status', 'in', [ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING]),
            orderBy('createdAt', 'desc')
        );

        // 2. Lắng nghe đơn đang chờ shipper (WAITING_FOR_SHIPPER hoặc CONFIRMED chưa được ai nhận)
        const qAvail = query(
            collection(db, 'orders'),
            where('status', 'in', [ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED]),
            orderBy('createdAt', 'desc')
        );

        const unsubMy = onSnapshot(qMy, (snap) => {
            setMyOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        const unsubAvail = onSnapshot(qAvail, (snap) => {
            setAvailableOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 3. Lắng nghe đơn chưa được lấy (PENDING hoặc chưa được shipper nào nhận) - shipper có thể tự nhận
        const qPending = query(
            collection(db, 'orders'),
            where('status', 'in', [ORDER_STATUS.PENDING, ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED]),
            where('type', '==', 'DELIVERY'),
            orderBy('createdAt', 'desc')
        );

        const unsubPending = onSnapshot(qPending, (snap) => {
            setPendingOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubMy(); unsubAvail(); unsubPending(); };
    }, [user]);

    const handleAcceptOrder = async (orderId) => {
        if (myOrders.length >= 5) {
            alert('Bạn đã nhận tối đa 5 đơn. Hãy hoàn thành bớt để nhận thêm!');
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');
                const currentStatus = orderSnap.data().status;
                const orderData = orderSnap.data();
                
                // Cho phép nhận đơn nếu không phải là trạng thái hoàn thành, thất bại, hủy
                const unacceptableStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED, ORDER_STATUS.CANCELLED];
                if (unacceptableStatuses.includes(currentStatus)) {
                    throw new Error('Đơn hàng này không thể nhận!');
                }
                
                // Nếu đơn đã có shipper rồi (khác shipper hiện tại), không được nhận
                if (orderData.shipper_id && orderData.shipper_id !== user.uid) {
                    throw new Error('Đơn hàng này đã được shipper khác nhận!');
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

    // Shipper tự nhận đơn PENDING (không cần admin xác nhận)
    const handleAcceptPendingOrder = async (orderId) => {
        if (myOrders.length >= 5) {
            alert('Bạn đã nhận tối đa 5 đơn. Hãy hoàn thành bớt để nhận thêm!');
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');
                const currentStatus = orderSnap.data().status;
                const orderData = orderSnap.data();
                
                // Cho phép nhận đơn nếu không phải là trạng thái hoàn thành, thất bại, hủy
                const unacceptableStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED, ORDER_STATUS.CANCELLED];
                if (unacceptableStatuses.includes(currentStatus)) {
                    throw new Error('Đơn hàng này không thể nhận!');
                }
                
                // Nếu đơn đã có shipper rồi (khác shipper hiện tại), không được nhận
                if (orderData.shipper_id && orderData.shipper_id !== user.uid) {
                    throw new Error('Đơn hàng này đã được shipper khác nhận!');
                }

                // Shipper nhận đơn -> chuyển sang CONFIRMED (đã xác nhận và đang giao)
                transaction.update(orderRef, {
                    shipper_id: user.uid,
                    shipperName: userProfile?.displayName || user.displayName || 'Shipper',
                    status: ORDER_STATUS.CONFIRMED,
                    updatedAt: serverTimestamp()
                });
            });
            alert('Nhận đơn thành công! Đơn hàng đang được giao.');
        } catch (error) {
            alert(error.message);
        }
    };

    // Shipper tự nhận đơn hàng cho shipper khác (khi click vào shipper đang rảnh)
    const handleAcceptOrderForShipper = async (orderId, shipper) => {
        if (shipper.orderCount >= 5) {
            alert('Shipper này đã nhận tối đa 5 đơn!');
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) throw new Error('Đơn hàng không tồn tại!');
                const currentStatus = orderSnap.data().status;
                const orderData = orderSnap.data();
                
                // Cho phép nhận đơn nếu không phải là trạng thái hoàn thành, thất bại, hủy
                const unacceptableStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED, ORDER_STATUS.CANCELLED];
                if (unacceptableStatuses.includes(currentStatus)) {
                    throw new Error('Đơn hàng này không thể nhận!');
                }
                
                // Nếu đơn đã có shipper rồi (khác shipper hiện tại), không được nhận
                if (orderData.shipper_id && orderData.shipper_id !== shipper.id) {
                    throw new Error('Đơn hàng này đã được shipper khác nhận!');
                }

                transaction.update(orderRef, {
                    shipper_id: shipper.id,
                    shipperName: shipper.displayName || 'Shipper',
                    status: ORDER_STATUS.CONFIRMED,
                    updatedAt: serverTimestamp()
                });
            });
            alert(`Đơn hàng đã được giao cho ${shipper.displayName || shipper.email}!`);
            setSelectedShipper(null); // Đóng modal sau khi nhận
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

            {/* HIỂN THỊ DANH SÁCH SHIPPER ĐANG RẢNH */}
            <div className="mb-4">
                <h5 className="mb-3">Danh sách Shipper đang rảnh ({availableShippers.length} người)</h5>
                {availableShippers.length === 0 ? (
                    <div className="alert alert-secondary">Không có shipper nào đang rảnh.</div>
                ) : (
                    <div className="d-flex flex-wrap gap-2">
                        {availableShippers.map(shipper => (
                            <div
                                key={shipper.id}
                                onClick={() => setSelectedShipper(shipper)}
                                className={`card shadow-sm p-2 cursor-pointer ${selectedShipper?.id === shipper.id ? 'border-primary border-2' : ''}`}
                                style={{ cursor: 'pointer', minWidth: '150px' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-success rounded-circle" style={{ width: 10, height: 10 }}></div>
                                    <div>
                                        <div className="fw-bold small">{shipper.displayName || shipper.email}</div>
                                        <div className="text-muted small">Đang rảnh ({shipper.orderCount}/5 đơn)</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* KHI CLICK VÀO SHIPPER THÌ HIỂN THỊ ĐƠN HÀNG ĐỂ NHẬN */}
            {selectedShipper && (
                <div className="mb-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Đơn hàng chờ nhận bởi: <span className="text-primary">{selectedShipper.displayName || selectedShipper.email}</span>
                        </h5>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedShipper(null)}>Đóng</button>
                    </div>
                    {availableOrders.length === 0 ? (
                        <div className="text-muted">Không có đơn hàng nào đang chờ.</div>
                    ) : (
                        <div className="row g-2">
                            {availableOrders.map(order => (
                                <div key={order.id} className="col-md-6 col-lg-4">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                                                <span className="text-danger fw-bold">{order.totalAmount?.toLocaleString()}đ</span>
                                            </div>
                                            <p className="mb-1 small"><strong>Khách:</strong> {order.userName}</p>
                                            <p className="mb-1 small"><strong>Đ/C:</strong> {order.address}</p>
                                            <p className="mb-2 small"><strong>SĐT:</strong> {order.phone}</p>
                                            <button
                                                className="btn btn-warning btn-sm w-100"
                                                onClick={() => handleAcceptOrderForShipper(order.id, selectedShipper)}
                                                disabled={selectedShipper.orderCount >= 5}
                                            >
                                                Nhận đơn
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="row g-4">
                {/* CỘT ĐƠN ĐANG NHẬN */}
                <div className="col-lg-7">
                    <h4 className="mb-3">Đơn đang giao ({myOrders.length}/5)</h4>
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

                {/* CỘT ĐƠN PENDING (CHỜ XÁC NHẬN) - SHIPPER TỰ NHẬN */}
                <div className="col-lg-5">
                    <h4 className="mb-3 text-warning">Đơn chờ xác nhận</h4>
                    {pendingOrders.length === 0 ? (
                        <div className="text-muted small">Không có đơn nào chờ xác nhận.</div>
                    ) : (
                        pendingOrders.map(order => (
                            <div key={order.id} className="card shadow-sm mb-2 border-warning">
                                <div className="card-body py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold small">#{order.id.slice(-6).toUpperCase()}</div>
                                            <div className="small text-muted text-truncate" style={{maxWidth: 150}}>{order.address}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-danger fw-bold small mb-1">{order.totalAmount?.toLocaleString()}đ</div>
                                            <button className="btn btn-warning btn-sm py-0" onClick={() => handleAcceptPendingOrder(order.id)}>Nhận ngay</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    <h4 className="mb-3 text-secondary mt-4">Đơn đang chờ nhận</h4>
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
