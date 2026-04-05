import mongoose from 'mongoose';

/**
 * Định nghĩa cấu trúc cho Danh mục Sản phẩm (Category).
 * Giúp phân loại sản phẩm (ví dụ: Đồ món, Đồ uống).
 */
const categorySchema = new mongoose.Schema({
  // Tên danh mục (duy nhất, không trùng lặp)
  name: { type: String, required: true, unique: true },
  
  // Mô tả ngắn gọn về danh mục
  description: { type: String },
  
  // Đường dẫn hình ảnh đại diện cho danh mục
  image: { type: String }
}, { 
  // Ghi lại thời điểm tạo và cập nhật lần cuối
  timestamps: true 
});

// Khởi tạo Model Category
const Category = mongoose.model('Category', categorySchema);

// Xuất Model Category
export default Category;

