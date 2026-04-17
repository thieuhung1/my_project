import express from 'express';
import dotenv from 'dotenv';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig.jsx';
import { getOrderById, PAYMENT_METHOD, PAYMENT_PROVIDER, PAYMENT_STATUS, ORDER_STATUS } from './services/orderService';
import { createVNPayPaymentUrl, verifyVNPaySignature } from './services/vnpayService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tạo URL thanh toán VNPay cho đơn hàng.
app.post('/api/payments/vnpay/create', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Thiếu orderId.' });
    }

    const order = await getOrderById(orderId);
    const paymentUrl = createVNPayPaymentUrl({
      orderId,
      amount: order.totalAmount || order.subtotal || 0,
      orderInfo: `Thanh toan don hang ${String(orderId).slice(-6)}`,
    });

    await updateDoc(doc(db, 'orders', orderId), {
      paymentMethod: PAYMENT_METHOD.VNPAY,
      paymentProvider: PAYMENT_PROVIDER.VNPAY,
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentUrl,
      paymentRef: String(orderId),
      updatedAt: serverTimestamp(),
    });

    return res.json({ paymentUrl });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// VNPay return URL - kiểm tra kết quả thanh toán từ query string.
app.get('/api/payments/vnpay/return', async (req, res) => {
  try {
    const params = req.query;
    if (!verifyVNPaySignature(params)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const orderId = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;
    const transactionStatus = params.vnp_TransactionStatus;
    const isSuccess = responseCode === '00' && transactionStatus === '00';

    const order = await getOrderById(orderId);

    if (isSuccess) {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: order.type === 'DINE_IN' ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.WAITING_FOR_SHIPPER,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: PAYMENT_STATUS.FAILED,
        updatedAt: serverTimestamp(),
      });
    }

    return res.json({ success: isSuccess, orderId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`VNPay server running on port ${PORT}`);
});
