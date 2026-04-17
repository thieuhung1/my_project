import crypto from 'crypto';

const getEnv = () => ({
  tmnCode: process.env.VNPAY_TMN_CODE || '',
  hashSecret: process.env.VNPAY_HASH_SECRET || '',
  payUrl: process.env.VNPAY_PAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/checkout/result',
});

const formatDate = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const sortObject = (obj) => {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
};

const createSecureHash = (params, secret) => {
  const signData = new URLSearchParams(params).toString();
  return crypto.createHmac('sha512', secret).update(signData, 'utf-8').digest('hex');
};

// Tạo URL thanh toán VNPay an toàn ở backend.
export const createVNPayPaymentUrl = ({ orderId, amount, orderInfo }) => {
  const env = getEnv();

  if (!env.tmnCode || !env.hashSecret) {
    throw new Error('VNPay chưa được cấu hình đầy đủ.');
  }

  const date = new Date();
  const createDate = formatDate(date);
  date.setMinutes(date.getMinutes() + 15);
  const expireDate = formatDate(date);

  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: env.tmnCode,
    vnp_Amount: Math.round(amount * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: env.returnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sortedParams = sortObject(vnpParams);
  const query = new URLSearchParams(sortedParams).toString();
  const secureHash = createSecureHash(sortedParams, env.hashSecret);

  return `${env.payUrl}?${query}&vnp_SecureHash=${secureHash}`;
};

// Xác minh chữ ký callback/return từ VNPay.
export const verifyVNPaySignature = (params) => {
  const env = getEnv();
  if (!env.hashSecret) {
    throw new Error('Thiếu VNPAY_HASH_SECRET.');
  }

  const { vnp_SecureHash, ...rest } = params;
  const secureHash = createSecureHash(sortObject(rest), env.hashSecret);
  return secureHash === vnp_SecureHash;
};
