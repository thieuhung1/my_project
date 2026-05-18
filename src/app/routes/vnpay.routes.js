// File này tạo router Express cho luồng thanh toán VNPay.
// Nó tạo URL thanh toán, xác minh callback và cập nhật trạng thái đơn hàng.
const express = require('express');
const {
  createPaymentUrl,
  verifyReturnQuery,
  isSuccessfulVnpayReturn,
  buildFrontendResultUrl,
  getClientIp,
} = require('../../features/vnpay/vnpay.service');
const { getFirestore, doc, updateDoc, serverTimestamp } = require('firebase-admin/firestore');
const { getApp, cert, initializeApp, getApps } = require('firebase-admin/app');

const ensureAdminApp = () => {
  if (getApps().length) return getApp();

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Thiếu cấu hình Firebase Admin. Cần FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
};

const getOrderRef = (orderId) => {
  const app = ensureAdminApp();
  const db = getFirestore(app);
  return doc(db, 'orders', orderId);
};

const extractOrderIdFromOrderInfo = (orderInfo = '') => {
  const parts = String(orderInfo).trim().split(/\s+/);
  return parts[parts.length - 1] || '';
};

const createVnpayRouter = () => {
  const router = express.Router();

  router.post('/create-payment-url', (req, res) => {
    try {
      const { orderId, amount, orderInfo, bankCode, locale } = req.body || {};

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId là bắt buộc',
        });
      }

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'amount phải lớn hơn 0',
        });
      }

      const { paymentUrl, txnRef } = createPaymentUrl({
        orderId,
        amount: Number(amount),
        orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        bankCode,
        ipAddr: getClientIp(req),
        locale,
      });

      return res.json({
        success: true,
        paymentUrl,
        txnRef,
      });
    } catch (error) {
      console.error('VNPay create-payment-url error:', error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  router.get('/return', async (req, res) => {
    const query = req.query || {};
    const orderId = extractOrderIdFromOrderInfo(query.vnp_OrderInfo) || String(query.orderId || '');

    try {
      const verificationResult = verifyReturnQuery(query);
      const isPaid = isSuccessfulVnpayReturn(query, verificationResult);

      if (isPaid && orderId) {
        const orderRef = getOrderRef(orderId);

        await updateDoc(orderRef, {
          paymentStatus: 'PAID',
          paidAt: serverTimestamp(),
          paymentProvider: 'VNPAY',
          vnpayTxnRef: String(query.vnp_TxnRef || ''),
          vnpayTransactionNo: String(query.vnp_TransactionNo || ''),
          updatedAt: serverTimestamp(),
        });
      }

      const frontendRedirect = buildFrontendResultUrl(orderId, isPaid);
      return res.redirect(frontendRedirect);
    } catch (error) {
      console.error('VNPay return error:', error);

      const fallback = buildFrontendResultUrl(orderId, false);
      return res.redirect(fallback);
    }
  });

  router.get('/vnpay_callback', (req, res) => {
    return res.redirect(`/api/vnpay/return?${new URLSearchParams(req.query).toString()}`);
  });

  return router;
};

module.exports = {
  createVnpayRouter,
};