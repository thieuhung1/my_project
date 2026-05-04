import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.Config";
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from "../models/Order.model";

//-----Tạo thanh toán VNPAY-----
const FIREBASE_PROJECT_ID = "do-an-food-hub";
const FUNCTIONS_REGION = "us-central1";
const VNPAY_API_BASE_URL = `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${FUNCTIONS_REGION}/vnpayApi`;
const DEFAULT_RETURN_PATH = "/vnpay-return";

export const createVnpayPayment = async ({
  orderId,//ID đơn hàng
  amount,//Số tiền
  orderInfo,//Thông tin đơn hàng
  returnUrl,//URL trả về
  ipAddr,//IP người dùng
  bankCode,//Mã ngân hàng
}) => {
  const response = await fetch(`${VNPAY_API_BASE_URL}/create-payment`, {
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