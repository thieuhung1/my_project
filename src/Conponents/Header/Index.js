import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, signOut, user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const navLinkClass = ({ isActive }) =>
    'nav-link px-3' + (isActive ? ' active fw-semibold' : '');

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}
      style={{
        background: 'linear-gradient(135deg, var(--primary-orange), var(--dark-orange))',
        backdropFilter: 'saturate(140%) blur(6px)',
        transition: 'var(--transition)',
        paddingBlock: scrolled ? '0.5rem' : '0.9rem',
      }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span role="img" aria-label="logo">🚀</span>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', letterSpacing: 0.3 }}>FoodHub</span>
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
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className={navLinkClass} to="/">Trang Chủ</NavLink></li>
            <li className="nav-item"><NavLink className={navLinkClass} to="/products">Sản Phẩm</NavLink></li>
            <li className="nav-item"><NavLink className={navLinkClass} to="/orders">Đơn Hàng</NavLink></li>
            <li className="nav-item"><NavLink className={navLinkClass} to="/my-account">Tài Khoản</NavLink></li>
            <li className="nav-item"><NavLink className={navLinkClass} to="/contact">Liên Hệ</NavLink></li>
          </ul>

          <form className="d-flex me-lg-3 my-2 my-lg-0" role="search" onSubmit={handleSearch}>
            <div className="input-group">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search" />
              </span>
              <input
                className="form-control border-0"
                type="search"
                placeholder="Tìm món, ví dụ: phở bò..."
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minWidth: 220 }}
              />
              <button className="btn btn-light" type="submit">Tìm</button>
            </div>
          </form>

          <div className="d-flex align-items-center gap-2">
            <Link to="/cart" className="btn btn-outline-light position-relative" aria-label="Giỏ hàng">
              <i className="bi bi-bag fs-5" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount > 99 ? '99+' : cartCount}
                  <span className="visually-hidden">items in cart</span>
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5" />
                  <span className="d-none d-sm-inline">
                    {userProfile?.displayName || user?.displayName || 'Thành viên'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li><Link className="dropdown-item" to="/my-account"><i className="bi bi-person me-2" />Tài Khoản</Link></li>
                  <li><Link className="dropdown-item" to="/orders"><i className="bi bi-receipt me-2" />Đơn Hàng</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2" />Đăng Xuất</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/signin" className="btn btn-light">
                <i className="bi bi-person me-1" /> Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;