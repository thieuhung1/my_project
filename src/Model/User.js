import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Định nghĩa cấu trúc cho Tài khoản Người dùng (User account).
 * Quản lý thông tin đăng nhập, phân quyền và địa chỉ người dùng.
 */
const userSchema = new mongoose.Schema({
  // Tên người dùng hiển thị
  name: { type: String, required: true },
  
  // Địa chỉ email (duy nhất, không được trùng lặp)
  email: { type: String, required: true, unique: true },
  
  // Mật khẩu (đã băm), yêu cầu tối thiểu 6 ký tự
  password: { type: String, required: true, minlength: 6 },
  
  // Địa chỉ nhận hàng
  address: { type: String },
  
  // Vai trò của người dùng trong hệ thống (mặc định là người dùng thông thường)
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { 
  // Tự động ghi lại thời điểm tạo và chỉnh sửa cuối cùng
  timestamps: true 
});

/**
 * Hàm trung gian (Middleware) để băm mật khẩu trước khi lưu vào cơ sở dữ liệu.
 * Đảm bảo bảo mật bằng cách không bao giờ lưu mật khẩu ở dạng văn bản thuần túy.
 */
userSchema.pre('save', async function(next) {
  // Nếu mật khẩu không thay đổi thì bỏ qua bước băm lại để tiết kiệm tài nguyên
  if (!this.isModified('password')) return next();
  
  // Thực hiện băm mật khẩu với thuật toán bcrypt với độ muối (salt) cấp 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Khởi tạo Model User từ Schema đã định nghĩa
const User = mongoose.model('User', userSchema);

// Xuất mô hình để dùng trong các controllers như đăng nhập, đăng ký
export default User;

