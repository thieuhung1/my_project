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
 * @property {string}      id            - ID đơn hàng
 * @property {string}      userId        - ID người dùng đặt hàng
 * @property {string}      userName      - Tên người đặt hàng
 * @property {string}      phone         - Số điện thoại
 * @property {string}      address       - Địa chỉ giao hàng
 * @property {OrderItem[]} items         - Danh sách sản phẩm đặt
 * @property {number}      totalAmount   - Tổng tiền đơn hàng
 * @property {string}      paymentMethod - Phương thức thanh toán
 * @property {string}      status        - Trạng thái đơn hàng
 * @property {string}      note          - Ghi chú của khách hàng
 * @property {Date}        createdAt     - Thời gian đặt hàng
 * @property {Date}        updatedAt     - Thời gian cập nhật
 */

/**
 * Tạo một object đơn hàng mặc định
 * @param {Partial<Order>} overrides
 * @returns {Order}
 */
export const createOrderModel = (overrides = {}) => ({
  userId: "",
  userName: "",
  phone: "",
  address: "",
  items: [],
  totalAmount: 0,
  paymentMethod: "cash",
  status: "pending",
  note: "",
  ...overrides,
});

// Các trạng thái đơn hàng hợp lệ
export const ORDER_STATUS = {
  PENDING: "pending",           // Chờ xác nhận
  CONFIRMED: "confirmed",       // Đã xác nhận
  DELIVERING: "delivering",     // Đang giao
  DELIVERED: "delivered",       // Đã giao xong
  CANCELLED: "cancelled",       // Đã hủy
};

// Label tiếng Việt cho từng trạng thái
export const ORDER_STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  delivering: "Đang giao hàng",
  delivered: "Giao thành công",
  cancelled: "Đã hủy",
};

// Màu badge cho từng trạng thái
export const ORDER_STATUS_COLOR = {
  pending: "warning",
  confirmed: "info",
  delivering: "primary",
  delivered: "success",
  cancelled: "danger",
};

/**
 * Tính tổng tiền từ danh sách sản phẩm
 * @param {OrderItem[]} items
 * @returns {number}
 */
export const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
