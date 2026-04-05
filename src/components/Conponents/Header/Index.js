import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Thành phần Header (Thanh điều hướng chính) của ứng dụng.
 * Chứa Logo, Menu điều hướng, Tìm kiếm, Giỏ hàng và Trạng thái người dùng.
 */
const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { isAuthenticated, dispatch, user } = useAuth();
  const navigate = useNavigate();

  /**
   * Xử lý tìm kiếm sản phẩm.
   * Chuyển hướng người dùng sang trang kết quả tìm kiếm với tham số q.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  /**
   * Xử lý đăng xuất.
   * Gửi action LOGOUT tới AuthContext để xóa session.
   */
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/'); // Quay về trang chủ sau khi đăng xuất
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-warning fixed-top shadow-lg">
      <div className="container">
        {/* Logo ứng dụng */}
        <Link className="navbar-brand fw-bold fs-3" to="/">
          🚀 FoodHub
        </Link>
        
        {/* Nút bật/tắt Menu trên thiết bị di động */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Danh sách các liên kết điều hướng chính */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang Chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">Sản Phẩm</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/orders">Đơn Hàng</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-account">Tài Khoản</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Liên Hệ</Link>
            </li>
          </ul>

          {/* Ô tìm kiếm */}
          <form className="d-flex me-3" onSubmit={handleSearch}>
            <input 
              className="form-control me-2" 
              type="search" 
              placeholder="Tìm kiếm món ăn..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-light" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* Các nút chức năng (Giỏ hàng, Tài khoản/Đăng nhập) */}
          <div className="d-flex align-items-center">
            {/* Giỏ hàng với thông báo số lượng sản phẩm */}
            <Link to="/cart" className="btn btn-outline-light me-2 position-relative">
              <i className="bi bi-cart fs-4"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                  <span className="visually-hidden">sản phẩm trong giỏ</span>
                </span>
              )}
            </Link>

            {/* Phân vùng người dùng (Đã đăng nhập vs Chưa đăng nhập) */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle" 
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person me-1"></i>{user?.name || 'Thành viên'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><Link className="dropdown-item" to="/my-account">Tài Khoản</Link></li>
                  <li><Link className="dropdown-item" to="/orders">Đơn Hàng</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>Đăng Xuất</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/signin" className="btn btn-outline-light">
                <i className="bi bi-person me-1"></i>Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;


