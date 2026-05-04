import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.Config';
import { syncVnpayOrderPayment } from '../../features/controllers/paymentService';
import { PAYMENT_STATUS } from '../../features/models/Order.model';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const statusMeta = {
  '00': { title: 'Thanh toán thành công', color: 'success', icon: 'bi-check-circle' },
  '24': { title: 'Khách hàng đã hủy giao dịch', color: 'warning', icon: 'bi-x-circle' },
  default: { title: 'Kết quả thanh toán VNPay', color: 'secondary', icon: 'bi-credit-card' },
};

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [synced, setSynced] = useState(false);

  const orderId = searchParams.get('vnp_TxnRef') || searchParams.get('orderId') || '';
  const responseCode = searchParams.get('vnp_ResponseCode') || '';
  const transactionNo = searchParams.get('vnp_TransactionNo') || '';

  const meta = statusMeta[responseCode] || statusMeta.default;

  useEffect(() => {
    const syncPayment = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const orderRef = doc(db, 'orders', orderId);
      const snapshot = await getDoc(orderRef);
      if (!snapshot.exists()) {
        setLoading(false);
        return;
      }

      const currentOrder = { id: snapshot.id, ...snapshot.data() };
      setOrder(currentOrder);

      if (responseCode === '00' && !synced) {
        await syncVnpayOrderPayment(orderId, {
          paymentStatus: PAYMENT_STATUS.PAID,
          vnp_TxnRef: orderId,
          vnp_TransactionNo: transactionNo,
          vnp_ResponseCode: responseCode,
        });
        setSynced(true);
      } else if (responseCode && responseCode !== '00' && !synced) {
        await syncVnpayOrderPayment(orderId, {
          paymentStatus: PAYMENT_STATUS.FAILED,
          vnp_TxnRef: orderId,
          vnp_TransactionNo: transactionNo,
          vnp_ResponseCode: responseCode,
        });
        setSynced(true);
      }

      setLoading(false);
    };

    syncPayment().catch((error) => {
      console.error('VNPay return sync error:', error);
      setLoading(false);
    });
  }, [orderId, responseCode, transactionNo, synced]);

  const amount = useMemo(() => order?.totalAmount || 0, [order]);

  if (loading) {
    return (
      <div className="container my-5 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner text="Đang xử lý kết quả thanh toán..." />
      </div>
    );
  }

  return (
    <div className="container my-5 fade-in-up">
      <motion.div
        className="card border-0 shadow-lg mx-auto"
        style={{ maxWidth: 640, borderRadius: 'var(--border-radius)' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="card-body p-5 text-center">
          <div className={`result-icon ${meta.color} mx-auto mb-4`}>
            <i className={`bi ${meta.icon}`} />
          </div>
          <h2 className="fw-bold mb-2">{meta.title}</h2>
          <p className="text-muted mb-4">
            Mã đơn: <strong>#{orderId ? orderId.slice(-6).toUpperCase() : 'N/A'}</strong>
          </p>

          {responseCode === '00' && (
            <div className="bg-light rounded-3 p-3 mb-4 text-start">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tổng thanh toán</span>
                <span className="fw-bold">{amount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Mã giao dịch</span>
                <span className="fw-bold">{transactionNo || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Trạng thái</span>
                <span className="fw-bold text-success">Đã cập nhật trên Firebase</span>
              </div>
            </div>
          )}

          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <button className="btn btn-warning text-white rounded-pill px-4" onClick={() => navigate('/my-orders')}>
              <i className="bi bi-bag me-2" /> Xem đơn hàng
            </button>
            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/products')}>
              <i className="bi bi-shop me-2" /> Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VnpayReturn;
