import mongoose from 'mongoose';

/**
 * Định nghĩa cấu trúc cho Danh sách yêu thích (Wishlist).
 * Giúp người dùng lưu lại các sản phẩm họ quan tâm để mua sau.
 */
const wishlistSchema = new mongoose.Schema({
  // Liên kết đến Model User (Mỗi người dùng có một danh sách yêu thích duy nhất)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Danh sách các ID sản phẩm được yêu thích
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { 
  // Ghi lại thời điểm tạo và lần cập nhật gần nhất
  timestamps: true 
});

// Khởi tạo Model Wishlist
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Xuất Model Wishlist
export default Wishlist;

