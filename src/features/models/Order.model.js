// ============================================================
// Order.model.js - Schema/Model dữ liệu đơn hàng
// ============================================================

/**
 * @typedef {Object} OrderItem
 * @property {string} productId   - ID sản phẩm
 * @property {string} productName - Tên sản phẩm
 * @property {number} quantity    - Số lượng
 * @property {number} price       - Giá tại thời điểm đặt hàng
 * @property {string} imageUrl    - Ảnh sản phẩm
 */

/**
 * @typedef {Object} Order
 * @property {string}      id             - ID đơn hàng
 * @property {string}      userId         - ID người dùng đặt hàng
 * @property {string}      userName       - Tên người đặt hàng
 * @property {string}      phone          - Số điện thoại
 * @property {string}      address        - Địa chỉ giao hàng
 * @property {OrderItem[]} items          - Danh sách sản phẩm đặt
 * @property {number}      subtotal       - Tạm tính trước giảm giá
 * @property {number}      totalAmount    - Tổng tiền đơn hàng (sau giảm giá)
 * @property {number}      discountAmount - Số tiền giảm giá
 * @property {string}      couponId       - ID mã giảm giá (nếu có)
 * @property {string}      couponCode     - Mã giảm giá (nếu có)
 * @property {string}      paymentMethod  - Phương thức thanh toán (COD)
 * @property {string}      paymentStatus  - Trạng thái thanh toán (UNPAID/PENDING/PAID/FAILED)
 * @property {string}      paymentProvider - Nhà cung cấp thanh toán (LOCAL)
 * @property {string}      paidAt         - Thời điểm thanh toán thành công
 * @property {string}      status         - Trạng thái đơn hàng (UPPERCASE)
 * @property {string}      type           - Loại đơn (DELIVERY/DINE_IN)
 * @property {string}      table_id       - Mã bàn (nếu DINE_IN)
 * @property {string}      note           - Ghi chú của khách hàng
 * @property {string}      shipperId      - ID shipper (nếu có)
 * @property {string}      shipperName    - Tên shipper (nếu có)
 * @property {Date}        createdAt      - Thời gian đặt hàng
 * @property {Date}        updatedAt      - Thời gian cập nhật
 */
//-----Phương thức thanh toán-----
export const PAYMENT_METHOD = {
  COD: "COD",//thanh toán khi nhận hàng
  VNPAY: "VNPAY",//thanh toán qua VNPAY
};
//-----Trạng thái thanh toán-----
export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",//chưa thanh toán
  PENDING: "PENDING",//đang xử lý
  PAID: "PAID",//đã thanh toán
  FAILED: "FAILED",//thất bại
};
//-----Nhà cung cấp thanh toán-----
export const PAYMENT_PROVIDER = {
  LOCAL: "LOCAL",//thanh toán qua Local
  VNPAY: "VNPAY",//thanh toán qua VNPAY
};
//-----Trạng thái đơn hàng-----
export const ORDER_STATUS = {
  PENDING: "PENDING",//chờ xử lý
  WAITING_FOR_SHIPPER: "WAITING_FOR_SHIPPER",//chờ shipper
  CONFIRMED: "CONFIRMED",//đã xác nhận
  DELIVERING: "DELIVERING",//đang giao hàng
  COMPLETED: "COMPLETED",//hoàn thành
  FAILED: "FAILED",//thất bại
  CANCELLED: "CANCELLED",//đã hủy
};
//-----Label trạng thái đơn hàng-----
export const ORDER_STATUS_LABEL = {
  PENDING: "Chờ xử lý",//chờ xử lý
  WAITING_FOR_SHIPPER: "Chờ shipper",//chờ shipper
  CONFIRMED: "Đã xác nhận",//đã xác nhận
  DELIVERING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",//hoàn thành
  FAILED: "Thất bại",//thất bại
  CANCELLED: "Đã hủy",//đã hủy
};
//-----Màu sắc trạng thái đơn hàng-----
export const ORDER_STATUS_COLOR = {
  PENDING: "warning",//warning
  WAITING_FOR_SHIPPER: "secondary",
  CONFIRMED: "info",//info
  DELIVERING: "primary",
  COMPLETED: "success",//success
  FAILED: "danger",//danger
  CANCELLED: "dark",//dark - đen
};//dark - đen
//-----Tạo model đơn hàng-----
export const createOrderModel = (overrides = {}) => ({
  userId: "",//ID người dùng
  userName: "",//Tên người dùng
  phone: "",//Số điện thoại
  address: "",//Địa chỉ
  items: [],//Danh sách sản phẩm
  subtotal: 0,//Tạm tính trước giảm giá
  totalAmount: 0,//Tổng tiền đơn hàng (sau giảm giá)
  discountAmount: 0,//Số tiền giảm giá
  couponId: "",//ID mã giảm giá
  couponCode: "",//Mã giảm giá
  paymentMethod: PAYMENT_METHOD.COD,//Phương thức thanh toán
  paymentStatus: PAYMENT_STATUS.UNPAID,//Trạng thái thanh toán
  paymentProvider: PAYMENT_PROVIDER.LOCAL,//Nhà cung cấp thanh toán
  paidAt: null,//Thời điểm thanh toán thành công
  status: ORDER_STATUS.PENDING,//Trạng thái đơn hàng
  type: "DELIVERY",//Loại đơn (DELIVERY/DINE_IN)
  table_id: "",//Mã bàn (nếu DINE_IN)
  note: "",//Ghi chú của khách hàng
  shipperId: "",//ID shipper (nếu có)
  shipperName: "",//Tên shipper (nếu có)
  ...overrides,//Override các giá trị
});

/**
 * Tính tổng tiền từ danh sách sản phẩm
 * @param {OrderItem[]} items
 * @returns {number}
 */
export const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);
