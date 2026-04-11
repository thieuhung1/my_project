// ============================================================
// User.model.js - Schema/Model dữ liệu người dùng
// ============================================================

/**
 * @typedef {Object} Address
 * @property {string} label   - Nhãn địa chỉ (vd: "Nhà", "Văn phòng")
 * @property {string} street  - Số nhà, tên đường
 * @property {string} city    - Thành phố
 * @property {boolean} isDefault - Địa chỉ mặc định
 */

/**
 * @typedef {Object} User
 * @property {string}    id          - ID khớp với Firebase Auth UID
 * @property {string}    displayName - Tên hiển thị
 * @property {string}    email       - Email đăng nhập
 * @property {string}    phone       - Số điện thoại
 * @property {string}    avatarUrl   - URL ảnh đại diện
 * @property {string}    role        - Vai trò: "customer" | "admin" | "staff" | "waiter"
 * @property {Address[]} addresses   - Danh sách địa chỉ
 * @property {Date}      createdAt   - Ngày tạo tài khoản
 * @property {Date}      updatedAt   - Lần cập nhật cuối
 */

/**
 * Tạo một object người dùng mặc định
 * @param {Partial<User>} overrides
 * @returns {User}
 */
export const createUserModel = (overrides = {}) => ({
  displayName: "",
  email: "",
  phone: "",
  avatarUrl: "",
  role: "customer",
  addresses: [],
  ...overrides,
});

// Vai trò người dùng hợp lệ
export const USER_ROLES = {
  CUSTOMER: "customer",   // Khách hàng
  ADMIN: "admin",         // Quản trị viên
  STAFF: "staff",         // Nhân viên (Shipper)
  WAITER: "waiter",       // Nhân viên bồi bàn
};

// Label tiếng Việt
export const USER_ROLE_LABEL = {
  customer: "Khách hàng",
  admin: "Quản trị viên",
  staff: "Giao hàng",
  waiter: "Bồi bàn",
};

/**
 * Lấy địa chỉ mặc định của người dùng
 * @param {User} user
 * @returns {Address | null}
 */
export const getDefaultAddress = (user) => {
  if (!user.addresses || user.addresses.length === 0) return null;
  return user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
};
