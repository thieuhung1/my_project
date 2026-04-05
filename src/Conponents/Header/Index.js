import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { isAuthenticated, signOut, user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-warning fixed-top shadow-lg">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          🚀 FoodHub
        </Link>
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
          <div className="d-flex">
            <Link to="/cart" className="btn btn-outline-light me-2 position-relative">
              <i className="bi bi-cart fs-4"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                  <span className="visually-hidden">unread messages</span>
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="dropdown">
                <Link className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" to="/my-account" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle fs-5"></i>
                  <span>{userProfile?.displayName || user?.displayName || 'Thành viên'}</span>
                </Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/my-account">Tài Khoản</Link></li>
                  <li><Link className="dropdown-item" to="/orders">Đơn Hàng</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Đăng Xuất</button></li>
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

