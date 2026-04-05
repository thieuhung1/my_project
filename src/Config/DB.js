import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cấu hình dotenv để đọc biến môi trường từ tập tin .env
dotenv.config();

/**
 * Kết nối với cơ sở dữ liệu MongoDB thông qua Mongoose.
 * Hàm này bất đồng bộ và sẽ dừng tiến trình nếu kết nối thất bại sau nhiều lần thử.
 */
const connectDB = async () => {
  try {
    // Thử kết nối với URI từ biến môi trường
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Thông báo kết nối thành công với host cụ thể
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log lỗi chi tiết nếu kết nối thất bại
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // Thoát tiến trình với mã lỗi 1 để thông báo sự cố nghiêm trọng
    process.exit(1);
  }
};

// Xuất hàm kết nối mặc định để sử dụng trong tệp chính (thường là server.js hoặc App.js)
export default connectDB;

