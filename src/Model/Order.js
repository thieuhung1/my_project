import mongoose from 'mongoose';

/**
 * Định nghĩa cấu trúc cho từng Sản phẩm trong Đơn hàng.
 * Lưu trữ giá tại thời điểm đặt hàng để tránh thay đổi khi giá sản phẩm thay đổi sau này.
 */
const orderItemSchema = new mongoose.Schema({
  // Liên kết tới Model Product
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Số lượng đặt mua
  quantity: { type: Number, required: true },
  
  // Giá tại thời điểm đặt hàng (SNAPSHOT của giá sản phẩm)
  price: { type: Number, required: true }
});

/**
 * Định nghĩa cấu trúc cho Đơn đặt hàng (Order).
 */
const orderSchema = new mongoose.Schema({
  // Người đặt hàng
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Danh sách các món của đơn hàng
  items: [orderItemSchema],
  
  // Tổng tiền đơn hàng
  total: { type: Number, required: true },
  
  // Trạng thái đơn hàng (Mặc định: đang chờ xử lý)
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  
  // Địa chỉ giao nhận hàng cho đơn này
  shippingAddress: { type: String, required: true }
}, { 
  // Ghi lại thời điểm đặt hàng và lần cập nhật gần nhất
  timestamps: true 
});

// Khởi tạo Model Order
const Order = mongoose.model('Order', orderSchema);

// Xuất Model Order
export default Order;

