import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Thành phần Footer (Chân trang) của ứng dụng.
 * Cung cấp thông tin liên hệ, liên kết nhanh và mạng xã hội.
 */
const Footer = () => {
  // Lấy năm hiện tại để hiển thị trong bản quyền
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer py-5 mt-5" style={{ background: 'linear-gradient(135deg, #FF6B35, #E65100)', color: 'white' }}>
      <div className="container">
        <div className="row g-4">
          {/* Cột 1: Giới thiệu ngắn về thương hiệu */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">FoodHub</h5>
            <p className="opacity-75">
              🚀 Đồ ăn ngon, giao hàng cực nhanh! Chúng tôi mang tinh hoa ẩm thực Việt đến tận cửa nhà bạn chỉ trong vài phút.
            </p>
          </div>

          {/* Cột 2: Danh sách liên kết nhanh cho người dùng */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Dịch Vụ</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-chevron-right me-1 small"></i>Thực Đơn
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-chevron-right me-1 small"></i>Giỏ Hàng
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-chevron-right me-1 small"></i>Theo Dõi Đơn Hàng
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-chevron-right me-1 small"></i>Về Chúng Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên kết mạng xã hội và liên hệ */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Kết Nối</h5>
            <div className="d-flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white fs-2 opacity-75 hover-opacity-100">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white fs-2 opacity-75 hover-opacity-100">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white fs-2 opacity-75 hover-opacity-100">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
            <p className="mt-3 opacity-75">
              <i className="bi bi-envelope me-2"></i>contact@foodhub.vn
            </p>
          </div>
        </div>

        {/* Đường kẻ ngăn cách */}
        <hr className="my-4 border-white opacity-25" />

        {/* Dòng bản quyền cuối trang */}
        <div className="row">
          <div className="col text-center">
            <p className="mb-0 opacity-50 small">
              &copy; {currentYear} FoodHub Team. Tất cả các quyền được bảo lưu. Thiết kế với ❤️ tại Việt Nam.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


