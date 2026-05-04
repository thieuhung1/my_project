//--  dùng để tạo server VNPay
const express = require("express");//-- thư viện express dùng để tạo server
const cors = require("cors");//-- thư viện cors dùng để cho phép request từ server khác
const dotenv = require("dotenv");//-- thư viện dotenv dùng để tạo env
const crypto = require("crypto");//-- thư viện crypto dùng để tạo hash

// tạo env
dotenv.config();

const app = express();//-- tạo server
app.use(cors());//-- cho phép request từ server khác
app.use(express.json());//-- cho phép request từ server khác
app.use(express.urlencoded({ extended: true }));//-- cho phép request từ server khác

const VN_PAY_VERSION = process.env.VNPAY_VERSION || "2.1.0";
const VN_PAY_COMMAND = "pay";
const VN_PAY_CURRENCY = "VND";
const VN_PAY_LOCALE = process.env.VNPAY_LOCALE || "vn";
const VN_PAY_ORDER_TYPE = process.env.VNPAY_ORDER_TYPE || "other";
const VN_PAY_RETURN_URL = process.env.VNPAY_RETURN_URL || "http://localhost:3000/vnpay-return";
const VN_PAY_IPN_URL = process.env.VNPAY_IPN_URL || "http://localhost:5000/api/vnpay/ipn";
const VN_PAY_TMN_CODE = process.env.VNPAY_TMN_CODE || "";
const VN_PAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || "";
const VN_PAY_URL = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

const sortObject = (obj) =>
  Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});

const hmacSha512 = (secret, data) => crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");

const buildPaymentUrl = ({ orderId, amount, orderInfo, bankCode }) => {
  if (!VN_PAY_TMN_CODE || !VN_PAY_HASH_SECRET) {
    throw new Error("Thiếu cấu hình VNPay (VNPAY_TMN_CODE hoặc VNPAY_HASH_SECRET)");
  }

  const createDate = new Date();
  const params = {
    vnp_Version: VN_PAY_VERSION,
    vnp_Command: VN_PAY_COMMAND,
    vnp_TmnCode: VN_PAY_TMN_CODE,
    vnp_Amount: Math.round(Number(amount || 0) * 100),
    vnp_CurrCode: VN_PAY_CURRENCY,
    vnp_TxnRef: String(orderId || createDate.getTime()),
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: VN_PAY_ORDER_TYPE,
    vnp_Locale: VN_PAY_LOCALE,
    vnp_ReturnUrl: VN_PAY_RETURN_URL,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: `${createDate.getFullYear()}${String(createDate.getMonth() + 1).padStart(2, "0")}${String(createDate.getDate()).padStart(2, "0")}${String(createDate.getHours()).padStart(2, "0")}${String(createDate.getMinutes()).padStart(2, "0")}${String(createDate.getSeconds()).padStart(2, "0")}`,
    vnp_IpnUrl: VN_PAY_IPN_URL,
  };

  if (bankCode) params.vnp_BankCode = bankCode;

  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString().replace(/%20/g, "+");
  const secureHash = hmacSha512(VN_PAY_HASH_SECRET, signData);

  return `${VN_PAY_URL}?${signData}&vnp_SecureHash=${secureHash}`;
};

app.post("/api/vnpay/create-payment-url", (req, res) => {
  try {
    const { orderId, amount, orderInfo, bankCode } = req.body;
    const paymentUrl = buildPaymentUrl({ orderId, amount, orderInfo, bankCode });
    return res.json({ success: true, paymentUrl });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

app.get("/api/vnpay/ipn", (req, res) => {
  return res.json({ RspCode: "00", Message: "Confirm Success" });
});

app.get("/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VNPay server running on port ${PORT}`));

module.exports = app;
