// ============================================================
// Product.model.js - Schema/Model dữ liệu sản phẩm
// ============================================================

/**
 * @typedef {Object} Product
 * @property {string}   id          - ID tự động tạo bởi Firestore
 * @property {string}   name        - Tên sản phẩm
 * @property {string}   description - Mô tả sản phẩm
 * @property {number}   price       - Giá sản phẩm (VNĐ)
 * @property {number}   discount    - % giảm giá (0-100)
 * @property {string}   category    - Danh mục sản phẩm
 * @property {string}   imageUrl    - URL ảnh sản phẩm
 * @property {number}   stock       - Số lượng tồn kho
 * @property {boolean}  featured    - Sản phẩm nổi bật hay không
 * @property {number}   rating      - Điểm đánh giá trung bình (0-5)
 * @property {number}   reviewCount - Số lượng đánh giá
 * @property {Date}     createdAt   - Thời gian tạo
 * @property {Date}     updatedAt   - Thời gian cập nhật
 */

/**
 * Tạo một object sản phẩm mặc định
 * @param {Partial<Product>} overrides - Các trường cần ghi đè
 * @returns {Product}
 */
export const createProductModel = (overrides = {}) => ({
  name: "",
  description: "",
  price: 0,
  discount: 0,
  category: "other",
  imageUrl: "",
  stock: 0,
  featured: false,
  rating: 0,
  reviewCount: 0,
  ...overrides,
});

// Danh sách danh mục sản phẩm hợp lệ
export const PRODUCT_CATEGORIES = [
  "burger",
  "pizza",
  "sushi",
  "pasta",
  "salad",
  "drink",
  "dessert",
  "other",
];

/**
 * Tính giá sau khi giảm giá
 * @param {number} price    - Giá gốc
 * @param {number} discount - % giảm giá
 * @returns {number}
 */
export const calculateDiscountedPrice = (price, discount) => {
  if (!discount || discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
};
