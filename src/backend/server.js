import express from 'express';
import dotenv from 'dotenv';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig.jsx';
import { PAYMENT_STATUS, updatePaymentStatus, updateOrderStatus, ORDER_STATUS, getOrderById } from './services/orderService';
import { createPayOSPayment, verifyPayOSWebhookSignature } from './services/paymentService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Tạo yêu cầu thanh toán PayOS cho đơn hàng.
app.post('/api/payments/create', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Thiếu orderId.' });
    }

    const order = await getOrderById(orderId);
    const amount = order.totalAmount || order.subtotal || 0;

    const payment = await createPayOSPayment({
      orderId,
      amount,
      description: `DH-${String(orderId).slice(-6)}`,
    });

    await updateDoc(doc(db, 'orders', orderId), {
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod: 'BANK_QR',
      paymentReference: payment.data?.orderCode || '',
      paymentLink: payment.data?.checkoutUrl || '',
      updatedAt: serverTimestamp(),
    });

    return res.json({
      paymentLink: payment.data?.checkoutUrl || '',
      qrCode: payment.data?.qrCode || payment.data?.qrCodeUrl || '',
      paymentReference: payment.data?.orderCode || '',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Webhook PayOS gọi về khi thanh toán thay đổi.
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-payos-signature'];
    const body = req.body;

    if (!verifyPayOSWebhookSignature(body, signature)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const data = body.data || body;
    const orderReference = data.orderId || data.orderCode || data.reference || data.paymentReference;

    if (!orderReference) {
      return res.status(400).json({ message: 'Thiếu mã đơn thanh toán.' });
    }

    const order = await getOrderById(orderReference).catch(() => null);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    const isPaid = data.code === 'PAID' || data.status === 'PAID' || data.transactionStatus === 'success' || data.success === true;

    if (isPaid) {
      await updateDoc(doc(db, 'orders', orderReference), {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: order.type === 'DINE_IN' ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.WAITING_FOR_SHIPPER,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updatePaymentStatus(orderReference, PAYMENT_STATUS.FAILED);
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
});
