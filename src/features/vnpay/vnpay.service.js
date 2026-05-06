const { VNPay } = require('vnpay');

const VNPAY_SANDBOX_HOST = 'https://sandbox.vnpayment.vn';

let cachedVnpay = null;

const getConfig = () => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secureSecret = process.env.VNPAY_HASH_SECRET || process.env.VNPAY_SECURE_SECRET;

  if (!tmnCode || !secureSecret) {
    throw new Error('Thiếu cấu hình VNPay. Cần VNPAY_TMN_CODE và VNPAY_HASH_SECRET hoặc VNPAY_SECURE_SECRET trong file .env');
  }

  return {
    tmnCode,
    secureSecret,
    vnpayHost: process.env.VNPAY_HOST || VNPAY_SANDBOX_HOST,
    backendBaseUrl: process.env.BACKEND_BASE_URL || `http://localhost:${process.env.BACKEND_PORT || 5000}`,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
    locale: process.env.VNPAY_LOCALE || 'vn',
    orderType: process.env.VNPAY_ORDER_TYPE || 'other',
  };
};

const getVnpayClient = () => {
  if (cachedVnpay) return cachedVnpay;

  const config = getConfig();
  cachedVnpay = new VNPay({
    tmnCode: config.tmnCode,
    secureSecret: config.secureSecret,
    vnpayHost: config.vnpayHost,
    testMode: true,
  });

  return cachedVnpay;
};

const generateId = () => Date.now().toString();

const buildCallbackUrl = () => {
  const config = getConfig();
  return `${config.backendBaseUrl.replace(/\/$/, '')}/api/vnpay/return`;
};

const buildFrontendResultUrl = (orderId, success = false) => {
  const config = getConfig();
  return `${config.frontendBaseUrl.replace(/\/$/, '')}/checkout/${orderId}?method=VNPAY&status=${success ? 'success' : 'fail'}`;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

const createPaymentUrl = ({ orderId, amount, orderInfo, bankCode, ipAddr, locale }) => {
  const config = getConfig();
  const vnpay = getVnpayClient();
  const txnRef = generateId();
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Số tiền thanh toán VNPay không hợp lệ');
  }

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: numericAmount,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: config.orderType,
    vnp_ReturnUrl: buildCallbackUrl(),
    vnp_Locale: locale || config.locale,
    ...(bankCode ? { vnp_BankCode: bankCode } : {}),
  });

  return { paymentUrl, txnRef };
};

const verifyReturnQuery = (query) => {
  const vnpay = getVnpayClient();

  if (typeof vnpay.verifyReturnUrl === 'function') {
    return vnpay.verifyReturnUrl(query);
  }

  if (typeof vnpay.verifyIpnCall === 'function') {
    return vnpay.verifyIpnCall(query);
  }

  return { isVerified: true, ...query };
};

const isSuccessfulVnpayReturn = (query, verificationResult) => {
  const verified =
    verificationResult === true ||
    verificationResult?.isVerified === true ||
    verificationResult?.isSuccess === true ||
    verificationResult?.vnp_ResponseCode;

  return Boolean(verified) && String(query.vnp_ResponseCode || '') === '00' && String(query.vnp_TransactionStatus || '00') === '00';
};

module.exports = {
  createPaymentUrl,
  verifyReturnQuery,
  isSuccessfulVnpayReturn,
  buildFrontendResultUrl,
  getClientIp,
};
