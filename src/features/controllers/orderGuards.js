// orderGuards.js - Các guard kiểm tra quyền và tính hợp lệ trước khi thao tác đơn hàng.
// File này không xử lý nghiệp vụ chính mà chỉ ném lỗi khi đầu vào hoặc quyền không hợp lệ.

import { ORDER_STATUS } from '../models/Order.model';
import { DASHBOARD_ROLES, canTransitionOrder } from './orderWorkflow';

// Các trạng thái hợp lệ mà action trên dashboard được phép dùng.
// Dùng `Object.freeze` để ngăn sửa đổi ngoài ý muốn trong runtime.
const VALID_ACTION_STATUSES = Object.freeze([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.WAITING_FOR_SHIPPER,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.DELIVERING,
  ORDER_STATUS.COMPLETED,
]);

// Kiểm tra đơn hàng có tồn tại hợp lệ hay không.
// Guard này chỉ cần `order.id`; nếu thiếu thì dừng ngay để tránh thao tác nhầm.
export const requireOrderExists = (order) => {
  if (!order?.id) throw new Error('Đơn hàng không tồn tại!');
};

// Kiểm tra role hiện tại có nằm trong danh sách role được phép không.
// Mặc định nhận mảng rỗng để tránh lỗi khi caller không truyền vào.
export const requireRoleAllowed = (role, allowedRoles = []) => {
  if (!allowedRoles.includes(role)) throw new Error('Bạn không có quyền thực hiện thao tác này.');
};

// Kiểm tra chuyển trạng thái có hợp lệ theo workflow hay không.
// Hàm này chỉ bọc lại `canTransitionOrder` và chuyển thành lỗi dễ đọc cho UI/service.
export const requireTransitionAllowed = ({ orderType, role, currentStatus, nextStatus }) => {
  if (!canTransitionOrder(orderType, role, currentStatus, nextStatus)) {
    throw new Error('Trạng thái không hợp lệ cho vai trò hiện tại.');
  }
};

// Kiểm tra số lượng đơn của shipper có vượt quá giới hạn hay không.
// Dùng trước khi gán thêm đơn mới để tránh overload.
export const requireShipperCapacity = (orderCount, maxOrders) => {
  if (orderCount >= maxOrders) throw new Error('Shipper đã đạt giới hạn đơn.');
};

// Kiểm tra trạng thái có nằm trong nhóm trạng thái mà action dashboard hỗ trợ hay không.
// Nếu không hợp lệ thì ném lỗi ngay để tránh cập nhật dữ liệu sai.
export const requireValidActionStatus = (status) => {
  if (!VALID_ACTION_STATUSES.includes(status)) throw new Error('Trạng thái đơn không hợp lệ.');
};

// Danh sách role nội bộ được xem là nhân sự xử lý đơn hàng.
// Dùng cho validation, phân quyền và các màn hình dashboard.
export const STAFF_ROLES = Object.freeze([DASHBOARD_ROLES.SHIPPER, DASHBOARD_ROLES.WAITER]);
