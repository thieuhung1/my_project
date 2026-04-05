import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';

/**
 * Context quản lý danh sách sản phẩm và các trạng thái tải dữ liệu cho toàn ứng dụng.
 */
const ProductContext = createContext();

/**
 * Hook tùy chỉnh (Custom Hook) để lấy dữ liệu sản phẩm nhanh chóng trong các Page.
 */
export const useProducts = () => useContext(ProductContext);

/**
 * Provider cấp phát dữ liệu sản phẩm, hỗ trợ lọc và tải lại (refetch).
 */
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Hàm lấy danh sách sản phẩm từ API Backend.
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Gọi đến API lấy danh sách sản phẩm
      const response = await fetch('/api/products');
      
      if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm từ máy chủ.');
      
      const data = await response.json();
      
      /**
       * Chuẩn hóa dữ liệu từ Database để tương thích với Frontend.
       * - Chuyển _id thành id.
       * - Xử lý ảnh thu nhỏ.
       */
      const formatted = data.map(p => ({
        ...p,
        id: p._id,
        image: p.imageUrl || p.image,
        price: p.price
      }));
      
      setProducts(formatted);
      setError(null);
    } catch (err) {
      // Ghi nhận lỗi nếu quá trình lấy dữ liệu thất bại
      console.error('Lỗi fetch sản phẩm:', err);
      setError(err.message);
    } finally {
      // Dừng trạng thái đang tải dù thành công hay thất bại
      setLoading(false);
    }
  };

  /**
   * Tự động gọi API lấy dữ liệu lần đầu khi ứng dụng được tải vào trình duyệt.
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  // Cho phép các component khác gọi refetch để cập nhật lại danh sách (ví dụ: sau khi xóa/thêm)
  const refetch = fetchProducts;

  return (
    <ProductContext.Provider value={{ products, loading, error, refetch }}>
      {children}
    </ProductContext.Provider>
  );
};

