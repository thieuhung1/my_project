import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrderById } from '../../features/controllers/orderService';
import { PAYMENT_STATUS } from '../../features/models/Order.model';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/Checkout.css';

const STEPS = [
  { label: 'Xác nhận', icon: 'bi-clipboard-check' },
  { label: 'Hoàn tất', icon: 'bi-check-circle' },
];

const Checkout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        if (data?.paymentStatus === PAYMENT_STATUS.PAID) {
          setPaymentSuccess(true);
          setStep(2);
        }
      } catch (err) {
        console.error('Load order error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) loadOrder();
  }, [orderId]);

  const amount = useMemo(() => order?.totalAmount || order?.subtotal || 0, [order]);
  const discount = useMemo(() => order?.discountAmount || 0, [order]);

  const fmt = useCallback((n) => {
    if (typeof n !== 'number') return '0₫';
    return n.toLocaleString('vi-VN') + '₫';
  }, []);

  if (loading) {
    return (
      <div className="container my-5 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner text="Đang tải đơn hàng..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container my-5 text-center fade-in-up">
        <div className="py-5">
          <div className="display-1 mb-3">📦</div>
          <h3 className="fw-bold">Không tìm thấy đơn hàng</h3>
          <p className="text-muted">Mã đơn không hợp lệ hoặc đã bị xóa.</p>
          <button className="btn btn-warning text-white rounded-pill px-4 mt-3" onClick={() => navigate('/my-orders')}>
            <i className="bi bi-arrow-left me-2" /> Quay lại đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess || order?.paymentStatus === PAYMENT_STATUS.PAID) {
    return (
      <div className="container my-5 fade-in-up">
        <motion.div
          className="card border-0 shadow-lg mx-auto"
          style={{ maxWidth: 560, borderRadius: 'var(--border-radius)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <div className="card-body p-5 text-center">
            <motion.div
              className="result-icon success mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <i className="bi bi-check-lg" />
            </motion.div>
            <h2 className="fw-bold mb-2">Đặt hàng thành công!</h2>
            <p className="text-muted mb-4">Đơn hàng #{orderId?.slice(-6).toUpperCase()} đã được ghi nhận.</p>

            <div className="bg-light rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tổng tiền</span>
                <span className="fw-bold">{fmt(amount)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phương thức</span>
                <span className="fw-bold text-success">Tiền mặt khi nhận hàng</span>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button className="btn btn-warning text-white rounded-pill" onClick={() => navigate('/my-orders')}>
                <i className="bi bi-basket me-2" /> Xem đơn hàng
              </button>
              <button className="btn btn-outline-secondary rounded-pill" onClick={() => navigate('/products')}>
                <i className="bi bi-shop me-2" /> Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container my-5 fade-in-up">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-gradient-orange" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
          <i className="bi bi-receipt me-2" />Xác nhận đơn hàng
        </h1>
        <p className="text-muted">Mã đơn: <span className="fw-bold">#{orderId?.slice(-6).toUpperCase()}</span></p>
      </div>

      <div className="order-progress mb-5" style={{ maxWidth: 420, margin: '0 auto 2rem' }}>
        {STEPS.map((s, idx) => (
          <div key={s.label} className={`progress-step ${idx < step ? 'completed' : ''} ${idx === step ? 'active' : ''}`}>
            <div className="step-dot">
              {idx < step ? <i className="bi bi-check-lg" /> : <i className={`bi ${s.icon}`} />}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-7">
          <motion.div
            className="card border-0 shadow-sm"
            style={{ borderRadius: 'var(--border-radius)' }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold mb-4">Phương thức thanh toán</h5>

              <div className="alert alert-info border-0 d-flex align-items-center gap-3" style={{ borderRadius: 12, background: 'linear-gradient(135deg, #e7f3ff, #f0f8ff)' }}>
                <i className="bi bi-cash-stack text-primary fs-4" />
                <div>
                  <strong>Thanh toán khi nhận hàng</strong>
                  <p className="mb-0 small text-muted">Bạn sẽ thanh toán cho shipper khi nhận được đơn.</p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-warning text-white w-100 btn-lg rounded-pill shadow-orange"
                  onClick={() => {
                    setPaymentSuccess(true);
                    setStep(2);
                  }}
                >
                  <i className="bi bi-check-circle me-2" /> Xác nhận đặt hàng
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="col-lg-5">
          <motion.div
            className="checkout-summary"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="summary-header">
              <h5><i className="bi bi-receipt me-2" />Tóm tắt đơn hàng</h5>
            </div>
            <div className="summary-body">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={item.imageUrl || '/ASSETS/Images/placeholder.jpg'}
                    alt={item.name}
                    className="rounded-3"
                    style={{ width: 60, height: 60, objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold small">{item.name}</div>
                    <div className="text-muted small">x{item.quantity}</div>
                  </div>
                  <div className="fw-semibold" style={{ color: 'var(--primary-orange)' }}>
                    {fmt(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              <hr className="my-3" />

              <div className="summary-row">
                <span className="text-muted">Tạm tính</span>
                <span>{fmt(amount + discount)}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row text-success">
                  <span>Giảm giá</span>
                  <span>-{fmt(discount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span className="text-muted">Phí vận chuyển</span>
                <span className="badge bg-success bg-opacity-10 text-success">Miễn phí</span>
              </div>

              <div className="summary-row total">
                <span className="fw-bold">Tổng thanh toán</span>
                <span className="amount">{fmt(amount)}</span>
              </div>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1" />Thanh toán an toàn & nhanh chóng
                </small>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;