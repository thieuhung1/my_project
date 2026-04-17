import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOrderById, PAYMENT_STATUS } from '../../backend/services/orderService';

const BANK_INFO = {
  bankName: 'VCB',
  bankDisplayName: 'Vietcombank',
  accountNumber: '123456789',
  accountName: 'NGUYEN VAN A',
  transferContentPrefix: 'DH',
};

// Tạo nội dung chuyển khoản để khách chỉ cần copy hoặc quét QR.
const buildTransferContent = (orderId) => `${BANK_INFO.transferContentPrefix}${String(orderId).slice(-6).toUpperCase()}`;

// Tạo URL QR VietQR để khách quét bằng app ngân hàng.
const buildBankQrUrl = ({ amount, orderId }) => {
  const transferContent = buildTransferContent(orderId);
  return `https://img.vietqr.io/image/${BANK_INFO.bankName}-${BANK_INFO.accountNumber}-print.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
};

const Checkout = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) loadOrder();
  }, [orderId]);

  const amount = useMemo(() => order?.totalAmount || order?.subtotal || 0, [order]);
  const transferContent = useMemo(() => buildTransferContent(orderId), [orderId]);
  const bankQrUrl = useMemo(() => buildBankQrUrl({ amount, orderId }), [amount, orderId]);

  const handleCreateVNPay = async () => {
    setPaymentLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/payments/vnpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('Không tạo được link thanh toán VNPay.');
      }

      const data = await response.json();
      setPaymentUrl(data.paymentUrl);
      window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyTransferContent = async () => {
    try {
      await navigator.clipboard.writeText(transferContent);
    } catch {
      // Fallback nhẹ nếu trình duyệt chặn clipboard.
      window.prompt('Copy nội dung chuyển khoản:', transferContent);
    }
  };

  if (loading) {
    return <div className="container my-5 text-center">Đang tải đơn hàng...</div>;
  }

  if (error) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <Link to="/cart" className="btn btn-warning">Quay lại giỏ hàng</Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <h1 className="h4 fw-bold mb-3">Thanh toán đơn hàng</h1>
          <p className="text-muted mb-2">Mã đơn: #{orderId?.slice(-6).toUpperCase()}</p>
          <p className="mb-2">Tổng tiền: <strong>{amount.toLocaleString('vi-VN')}đ</strong></p>
          <p className="mb-4">Trạng thái thanh toán: <strong>{order?.paymentStatus || PAYMENT_STATUS.UNPAID}</strong></p>

          <div className="btn-group mb-4" role="tablist" aria-label="Chọn phương thức thanh toán">
            <button
              type="button"
              className={`btn ${paymentMethod === 'bank' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setPaymentMethod('bank')}
            >
              Chuyển khoản ngân hàng
            </button>
            <button
              type="button"
              className={`btn ${paymentMethod === 'vnpay' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setPaymentMethod('vnpay')}
            >
              Thanh toán VNPay
            </button>
          </div>

          {paymentMethod === 'bank' ? (
            <div className="row g-4 align-items-start">
              <div className="col-md-4">
                <div className="border rounded-4 p-3 text-center bg-white shadow-sm">
                  <img
                    src={bankQrUrl}
                    alt="QR thanh toán"
                    className="img-fluid rounded-3"
                    style={{ maxWidth: '100%' }}
                  />
                  <div className="small text-muted mt-2">Quét QR bằng app ngân hàng</div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="border rounded-4 p-4 bg-light">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="small text-muted">Ngân hàng</div>
                      <div className="fw-semibold">{BANK_INFO.bankDisplayName}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Số tài khoản</div>
                      <div className="fw-semibold">{BANK_INFO.accountNumber}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Chủ tài khoản</div>
                      <div className="fw-semibold">{BANK_INFO.accountName}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Số tiền</div>
                      <div className="fw-semibold text-danger">{amount.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div className="col-12">
                      <div className="small text-muted">Nội dung chuyển khoản</div>
                      <div className="fw-semibold">{transferContent}</div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <button type="button" className="btn btn-warning" onClick={copyTransferContent}>
                      Sao chép nội dung
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => window.open(bankQrUrl, '_blank', 'noopener,noreferrer')}>
                      Mở ảnh QR
                    </button>
                  </div>

                  <div className="alert alert-info mt-4 mb-0 small">
                    Sau khi chuyển khoản, hệ thống sẽ tự cập nhật trạng thái khi bạn xác nhận qua quy trình thanh toán.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-4 p-4 bg-light">
              <p className="mb-3">
                Thanh toán qua VNPay sẽ mở cổng thanh toán tự động để bạn xác nhận giao dịch.
              </p>

              {!paymentUrl ? (
                <button className="btn btn-warning" onClick={handleCreateVNPay} disabled={paymentLoading || !isAuthenticated}>
                  {paymentLoading ? 'Đang tạo thanh toán...' : 'Thanh toán bằng VNPay'}
                </button>
              ) : (
                <div className="alert alert-success mb-0">
                  Đã tạo link thanh toán VNPay. Nếu chưa mở, bạn có thể bấm lại nút thanh toán.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
