// orderWorkflow.js - Định nghĩa workflow trạng thái và vai trò xử lý đơn hàng.
// File này quy định đơn nào thuộc loại nào, vai trò nào được phép thao tác,
// trạng thái nào có thể chuyển sang trạng thái nào và metadata để hiển thị UI.

import { ORDER_STATUS } from '../models/Order.model';

// Các loại đơn hàng mà hệ thống hỗ trợ.
// `DELIVERY` là đơn giao hàng, `DINE_IN` là đơn ăn tại quán.
// Dùng `Object.freeze` để tránh bị sửa nhầm trong runtime.
export const ORDER_TYPES = Object.freeze({
  DELIVERY: 'DELIVERY',
  DINE_IN: 'DINE_IN',
});

// Các vai trò được phép thao tác trên dashboard.
// Mỗi role tương ứng với một luồng nghiệp vụ riêng.
export const DASHBOARD_ROLES = Object.freeze({
  SHIPPER: 'shipper',
  WAITER: 'waiter',
});

// Bản đồ workflow chính của toàn bộ module đơn hàng.
// Cấu trúc: loại đơn -> role -> trạng thái hiện tại -> danh sách trạng thái hợp lệ tiếp theo.
// Việc dùng object lồng nhau giúp tra cứu nhanh và rõ ràng khi kiểm tra quyền chuyển trạng thái.
export const ORDER_WORKFLOW = Object.freeze({
  [ORDER_TYPES.DINE_IN]: {
    [DASHBOARD_ROLES.WAITER]: {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.DELIVERING],
      [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.COMPLETED],
    },
  },
  [ORDER_TYPES.DELIVERY]: {
    [DASHBOARD_ROLES.SHIPPER]: {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.WAITING_FOR_SHIPPER, ORDER_STATUS.CONFIRMED],
      [ORDER_STATUS.WAITING_FOR_SHIPPER]: [ORDER_STATUS.CONFIRMED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.DELIVERING],
      [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.COMPLETED],
    },
  },
});

// Metadata mô tả từng workflow để hiển thị UI.
// `label` dùng cho giao diện, `roles` cho biết role nào được phép nhìn thấy/tương tác.
export const WORKFLOW_META = Object.freeze({
  [ORDER_TYPES.DINE_IN]: {
    label: 'Tại quán',
    roles: [DASHBOARD_ROLES.WAITER],
  },
  [ORDER_TYPES.DELIVERY]: {
    label: 'Giao hàng',
    roles: [DASHBOARD_ROLES.SHIPPER],
  },
});

// Kiểm tra xem một trạng thái mới có được phép chuyển từ trạng thái hiện tại hay không.
// Hàm này chỉ đọc data từ `ORDER_WORKFLOW`, không mutate gì cả.
export const canTransitionOrder = (orderType, role, currentStatus, nextStatus) => {
  if (!orderType || !role || !currentStatus || !nextStatus) return false;
  return ORDER_WORKFLOW[orderType]?.[role]?.[currentStatus]?.includes(nextStatus) || false;
};

// Lấy danh sách hành động/trạng thái hợp lệ cho role hiện tại ở trạng thái hiện tại.
// Trả về mảng rỗng nếu không có cấu hình phù hợp, giúp caller xử lý an toàn.
export const getAllowedActions = (orderType, role, status) => ORDER_WORKFLOW[orderType]?.[role]?.[status] ?? [];

// Alias sematic cho `getAllowedActions` để code gọi dễ hiểu hơn ở nơi cần danh sách trạng thái kế tiếp.
export const getNextStatuses = (orderType, role, status) => getAllowedActions(orderType, role, status);

// Lấy trạng thái kế tiếp mặc định (phần tử đầu tiên trong danh sách hợp lệ).
// Nếu không có trạng thái nào thì trả về `null` để caller biết là không thể tự chọn.
export const getDefaultNextStatus = (orderType, role, status) => getAllowedActions(orderType, role, status)[0] ?? null;

// Lấy metadata hiển thị cho workflow tương ứng với loại đơn.
// Nếu loại đơn không tồn tại, trả về object fallback để UI không bị crash.
export const getWorkflowMeta = (orderType) => WORKFLOW_META[orderType] ?? { label: 'Khác', roles: [] };
