// ============================================================
// Category.model.js - Schema/Model dữ liệu danh mục
// ============================================================

/**
 * @typedef {Object} Category
 * @property {string}  id        - ID tự động tạo bởi Firestore
 * @property {string}  name      - Tên danh mục (vd: "Burger", "Pizza")
 * @property {string}  slug      - Định danh URL-friendly (vd: "burger")
 * @property {string}  icon      - Icon hoặc emoji đại diện
 * @property {string}  imageUrl  - URL ảnh banner danh mục
 * @property {number}  order     - Thứ tự hiển thị
 * @property {boolean} active    - Danh mục có đang hoạt động
 * @property {Date}    createdAt - Thời gian tạo
 * @property {Date}    updatedAt - Thời gian cập nhật
 */

/**
 * Tạo một object danh mục mặc định
 * @param {Partial<Category>} overrides
 * @returns {Category}
 */
export const createCategoryModel = (overrides = {}) => ({
  name: "",
  slug: "",
  icon: "🍽️",
  imageUrl: "",
  order: 0,
  active: true,
  ...overrides,
});

// Danh mục mặc định cho ứng dụng Food Hub
export const DEFAULT_CATEGORIES = [
  { name: "Burger",  slug: "burger",  icon: "🍔", order: 1 },
  { name: "Pizza",   slug: "pizza",   icon: "🍕", order: 2 },
  { name: "Sushi",   slug: "sushi",   icon: "🍣", order: 3 },
  { name: "Pasta",   slug: "pasta",   icon: "🍝", order: 4 },
  { name: "Salad",   slug: "salad",   icon: "🥗", order: 5 },
  { name: "Đồ uống", slug: "drink",   icon: "🧋", order: 6 },
  { name: "Tráng miệng", slug: "dessert", icon: "🍰", order: 7 },
  { name: "Khác",    slug: "other",   icon: "🍱", order: 8 },
];
