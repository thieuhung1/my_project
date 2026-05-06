//-----Tạo thanh toán VNPAY-----
const functions = require("firebase-functions");//firebase functions
const admin = require("firebase-admin");//firebase admin
const express = require("express");//express
const cors = require("cors");//cors
const { VNPay, ProductCode, VnpLocale, dateFormat } = require("vnpay");//vnpay

//------------------//
//-----Khởi tạo Firebase Admin-----
admin.initializeApp();

//------------------//
//-----Khởi tạo Express-----
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

//------------------//
//-----Khởi tạo Firestore-----
const db = admin.firestore();

//------------------//
//-----Lấy cấu hình VNPay-----
// Ưu tiên biến môi trường backend, nếu không có thì lấy từ Firebase Functions config.
const vnpayConfig = functions.config().vnpay || {};
const vnpTmnCode = process.env.VNPAY_TMN_CODE || vnpayConfig.tmn_code;
const vnpHashSecret = process.env.VNPAY_HASH_SECRET || vnpayConfig.secret_key;
const vnpUrl =
  process.env.VNPAY_URL ||
  vnpayConfig.url ||
  "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

if (!vnpTmnCode || !vnpHashSecret) {
  console.warn("Thiếu cấu hình VNPay: VNPAY_TMN_CODE hoặc VNPAY_HASH_SECRET");
}

//------------------//
//-----Khởi tạo VNPay-----
const vnpay = new VNPay({
  tmnCode: vnpTmnCode,//mã website VNPAY
  secureSecret: vnpHashSecret,//chuỗi bí mật VNPAY
  vnpayHost: vnpUrl,//URL thanh toán VNPAY
  testMode: true,//test mode
  hashAlgorithm: "SHA512",//hash algorithm
  enableLog: true,//enable log
});
//------------------//
//-----Khởi tạo API-----

app.post("/create-payment", async (req, res) => {
  try {
    const { orderId, amount, orderInfo, returnUrl, ipAddr, bankCode } = req.body; 
      //-- cố định thông tin đơn hàng -----
    if (!orderId || !amount || !returnUrl) {
      return res.status(400).json({
        success: false,
        message: "Thiếu orderId, amount hoặc returnUrl",
      });
      //nếu thiếu thông tin đơn hàng thì throw lỗi
    }
//------------------//
//-----Kiểm tra đơn hàng-----
    const orderRef = db.collection("orders").doc(orderId);//lấy đơn hàng từ firestore
    const orderSnap = await orderRef.get();
    //nếu đơn hàng không tồn tại thì throw lỗi
    if (!orderSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
      //nếu đơn hàng không tồn tại thì throw lỗi
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    //nếu đơn hàng không tồn tại thì throw lỗi
    const paymentData = {
      vnp_Amount: Number(amount),//số tiền
      vnp_IpAddr: ipAddr || "127.0.0.1",//ip người dùng
      vnp_TxnRef: String(orderId),//id đơn hàng
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,//thông tin đơn hàng
      vnp_OrderType: ProductCode.Other,//loại đơn hàng
      vnp_ReturnUrl: returnUrl,//url trả về
      vnp_Locale: VnpLocale.VN,//locale
      vnp_CreateDate: dateFormat(new Date()),//ngày tạo
      vnp_ExpireDate: dateFormat(tomorrow),//ngày hết hạn
    };

    if (bankCode) {
      paymentData.vnp_BankCode = bankCode;
    }

    const paymentUrl = vnpay.buildPaymentUrl(paymentData);

    await orderRef.update({
      paymentMethod: "VNPAY",
      paymentStatus: "PENDING",
      paymentProvider: "VNPAY",
      vnpTxnRef: String(orderId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi tạo payment URL",
    });
  }
});

app.get("/return", (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);

    if (!verify.isVerified) {
      return res.send("Xác thực dữ liệu thất bại");
    }

    if (!verify.isSuccess) {
      return res.send("Thanh toán thất bại");
    }

    return res.send("Thanh toán thành công");
  } catch (error) {
    return res.send("Dữ liệu không hợp lệ");
  }
});

exports.vnpayApi = functions.https.onRequest(app);