import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.Config";
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from "../models/Order.model";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const DEFAULT_RETURN_PATH = "/vnpay-return";

export const createVnpayPayment = async ({
  orderId,
  amount,
  orderInfo,
  returnUrl,
  ipAddr,
  bankCode,
}) => {
  const response = await fetch(`${API_BASE_URL}/vnpay/create-payment-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      amount,
      orderInfo,
      returnUrl,
      ipAddr,
      bankCode,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không tạo được payment URL");
  }

  return data.paymentUrl;
};

export const createVnpayPaymentUrl = async ({
  orderId,
  amount,
  orderInfo,
  returnUrl,
  ipAddr,
  bankCode,
}) => {
  const resolvedReturnUrl = returnUrl || `${window.location.origin}${DEFAULT_RETURN_PATH}`;

  return createVnpayPayment({
    orderId,
    amount,
    orderInfo,
    returnUrl: resolvedReturnUrl,
    ipAddr,
    bankCode,
  });
};

export const openVnpayPayment = async (payload) => {
  const paymentUrl = await createVnpayPaymentUrl(payload);
  window.location.href = paymentUrl;
  return paymentUrl;
};

export const syncVnpayOrderPayment = async (orderId, paymentData = {}) => {
  if (!orderId) {
    throw new Error("Thiếu orderId để cập nhật thanh toán VNPAY");
  }

  const orderRef = doc(db, "orders", orderId);
  const nextPaymentStatus = paymentData.paymentStatus || PAYMENT_STATUS.PENDING;
  const isPaid = nextPaymentStatus === PAYMENT_STATUS.PAID;

  await updateDoc(orderRef, {
    paymentMethod: "VNPAY",
    paymentProvider: PAYMENT_PROVIDER.VNPAY,
    paymentStatus: nextPaymentStatus,
    vnpTxnRef: paymentData.vnp_TxnRef || orderId,
    vnpTransactionNo: paymentData.vnp_TransactionNo || "",
    vnpResponseCode: paymentData.vnp_ResponseCode || "",
    paidAt: isPaid ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
};