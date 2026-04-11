import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../backend/firebase/firebaseConfig';
import { updateOrderStatus } from '../../backend/services/orderService';

const WaiterDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'orders'),
            where('type', '==', 'DINE_IN'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleComplete = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'COMPLETED');
            alert('Đơn hàng đã hoàn thành và thanh toán!');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    if (loading) return (
        <div className="container my-5 text-center">
            <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
        </div>
    );

    return (
        <div className="container my-5">
            <h1 className="fw-bold mb-4">Quản lý Đơn Ăn Tại Quán</h1>
            <div className="row g-3">
                {orders.length === 0 ? (
                    <div className="text-center py-5 text-muted">Không có đơn hàng nào.</div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="col-md-6 col-lg-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <h5 className="mb-0 text-primary">Bàn #{order.table_id}</h5>
                                        <span className={`badge bg-${order.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="small text-muted mb-2">Đơn: #{order.id.slice(-6).toUpperCase()}</p>
                                    <div className="mb-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="small">
                                                {item.quantity}x {item.productName}
                                            </div>
                                        ))}
                                    </div>
                                    <h6 className="fw-bold text-danger">Tổng: {order.totalAmount?.toLocaleString('vi-VN')}đ</h6>
                                    {order.status !== 'COMPLETED' && (
                                        <button 
                                            className="btn btn-success btn-sm w-100 mt-3" 
                                            onClick={() => handleComplete(order.id)}
                                        >
                                            Xác nhận thanh toán & Hoàn thành
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WaiterDashboard;
