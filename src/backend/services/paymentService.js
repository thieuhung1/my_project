import { createHmac, randomUUID } from 'crypto';

const PAYOS_API_BASE = 'https://api-merchant.payos.vn';

// Tạo requestId ngẫu nhiên để mỗi đơn thanh toán là duy nhất.
const generateOrderCode = () => {
  const numeric = Number(String(Date.now()).slice(-9));
  return Number.isNaN(numeric) ? Math.floor(Math.random() * 1_000_000_000) : numeric;
};

const getPayOSEnv = () => ({
  clientId: process.env.PAYOS_CLIENT_ID || '',
  apiKey: process.env.PAYOS_API_KEY || '',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
  returnUrl: process.env.PAYOS_RETURN_URL || 'http://localhost:3000/orders',
  cancelUrl: process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/cart',
});

// Ký payload theo chuẩn PayOS để backend có thể tạo đơn an toàn.
const signPayload = (payload, checksumKey) => {
  const sortedEntries = Object.keys(payload)
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join('&');

  return createHmac('sha256', checksumKey).update(sortedEntries).digest('hex');
};

export const createPayOSPayment = async ({ orderId, amount, description }) => {
  const env = getPayOSEnv();

  if (!env.clientId || !env.apiKey || !env.checksumKey) {
    throw new Error('PayOS chưa được cấu hình đầy đủ.');
  }

  const payload = {
    orderCode: generateOrderCode(),
    amount,
    description: description || `DH-${String(orderId).slice(-6)}`,
    returnUrl: env.returnUrl,
    cancelUrl: env.cancelUrl,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAddress: '',
    items: [],
    expiredAt: Math.floor(Date.now() / 1000) + 30 * 60,
  };

  const signature = signPayload(payload, env.checksumKey);

  const response = await fetch(`${PAYOS_API_BASE}/v2/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': env.clientId,
      'x-api-key': env.apiKey,
    },
    body: JSON.stringify({ ...payload, signature }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Không tạo được thanh toán PayOS: ${errorText}`);
  }

  return response.json();
};

export const verifyPayOSWebhookSignature = (body, signature) => {
  const env = getPayOSEnv();

  if (!env.checksumKey) {
    throw new Error('Thiếu PAYOS_CHECKSUM_KEY.');
  }

  const expectedSignature = signPayload(body, env.checksumKey);
  return expectedSignature === signature;
};

export const createPaymentReference = () => randomUUID();
