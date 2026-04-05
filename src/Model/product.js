import mongoose from "mongoose";

/**
 * Định nghĩa cấu trúc (Schema) cho Sản phẩm trong cơ sở dữ liệu.
 * Bao gồm các trường thông tin cơ bản: tên, mô tả, giá, hình ảnh, v.v.
 */
const productSchema = new mongoose.Schema({
    // Tên sản phẩm, bắt buộc phải có
    name: { type: String, required: true },
    
    // Mô tả chi tiết về sản phẩm
    description: { type: String, required: true },
    
    // Giá bán của sản phẩm
    price: { type: Number, required: true },
    
    // Đường dẫn hình ảnh minh họa cho sản phẩm
    imageUrl: { type: String, required: true },
    
    // Danh mục phân loại sản phẩm
    category: { type: String, required: true },
    
    // Số lượng hàng còn trong kho
    stock: { type: Number, required: true },
    
    // Đánh giá từ người dùng (từ 0 đến 5 sao)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    
    // Mức giảm giá (nếu có, tính theo phần trăm)
    discount: { type: Number, default: 0 },
    
    // Các từ khóa liên quan đến sản phẩm giúp tìm kiếm dễ dàng hơn
    tags: [String],
}, { 
    // Tự động tạo các trường createdAt và updatedAt
    timestamps: true 
});

// Tạo Model dựa trên Schema đã định nghĩa
const Product = mongoose.model('Product', productSchema);

// Xuất Model để có thể sử dụng ở các file khác (ví dụ: Controllers)
export default Product;

