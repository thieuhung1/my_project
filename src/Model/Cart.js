import mongoose from 'mongoose';

/**
 * Định nghĩa cấu trúc cho từng thành phần (Sản phẩm + Số lượng) trong Giỏ hàng.
 */
const cartItemSchema = new mongoose.Schema({
  // Liên kết đến Model Product để lấy thông tin sản phẩm
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Số lượng sản phẩm này trong giỏ hàng (tối thiểu là 1)
  quantity: { type: Number, required: true, min: 1 }
});

/**
 * Định nghĩa cấu trúc Giỏ hàng của người dùng.
 * Mỗi người dùng chỉ có một giỏ hàng duy nhất (unique: true cho userId).
 */
const cartSchema = new mongoose.Schema({
  // Liên kết đến Model User
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Danh sách các sản phẩm và số lượng tương ứng
  items: [cartItemSchema]
}, { 
  // Ghi lại thời điểm tạo và cập nhật lần cuối
  timestamps: true 
});

// Khởi tạo Model Cart
const Cart = mongoose.model('Cart', cartSchema);

// Xuất Model Cart
export default Cart;

