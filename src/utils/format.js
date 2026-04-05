/**
 * Tiện ích định dạng các giá trị dữ liệu cho đồng bộ trên toàn ứng dụng.
 */

/**
 * Định dạng số thành tiền tệ Việt Nam (VNĐ).
 * Ví dụ: 100000 -> 100.000 ₫
 * 
 * @param {number} amount - Số tiền cần định dạng.
 * @returns {string} Chuỗi đã định dạng tiền tệ.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Định dạng ngày tháng năm sang kiểu Việt Nam.
 * Ví dụ: 2023-10-27 -> 27/10/2023
 * 
 * @param {string|Date} date - Đối tượng ngày hoặc chuỗi ngày.
 * @returns {string} Chuỗi ngày đã định dạng.
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
};
