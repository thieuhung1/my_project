import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Danh sách menu tĩnh của header để render bằng map, tránh lặp JSX.
const NAV_ITEMS = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/products', label: 'Sản Phẩm' },
  { to: '/about', label: 'Giới Thiệu' },
  { to: '/contact', label: 'Liên Hệ' },
];

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, signOut, user, userProfile, isAdmin, isShipper, isWaiter } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeNavbar = () => setIsNavbarOpen(false);
  const toggleNavbar = () => setIsNavbarOpen((prev) => !prev);

  const handleNavigate = (path) => {
    closeNavbar();
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    handleNavigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    await signOut();
    handleNavigate('/signin');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link px-3${isActive ? ' active fw-semibold' : ''}`;

  const menuItems = useMemo(() => {
    if (!isAuthenticated) return [];

    return [
      { to: '/my-account', label: 'Tài Khoản', icon: 'bi-person' },
      { to: '/my-orders', label: 'Lịch Sử Mua Hàng', icon: 'bi-basket' },
      isAdmin && { to: '/admin', label: 'Quản Trị Admin', icon: 'bi-shield-lock' },
      isShipper && { to: '/shipper', label: 'Giao Hàng', icon: 'bi-truck' },
      isWaiter && { to: '/waiter', label: 'Bồi Bàn', icon: 'bi-person-badge' },
    ].filter(Boolean);
  }, [isAuthenticated, isAdmin, isShipper, isWaiter]);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'shadow-lg' : ''}`}
      style={{
        background: scrolled 
          ? 'rgba(229, 90, 43, 0.95)' 
          : 'linear-gradient(135deg, var(--primary-orange), var(--dark-orange))',
        backdropFilter: 'saturate(180%) blur(10px)',
        transition: 'var(--transition)',
        paddingBlock: scrolled ? '0.5rem' : '0.9rem',
      }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" onClick={closeNavbar}>
          <span role="img" aria-label="logo">🚀</span>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', letterSpacing: 0.3 }}>FoodHub</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isNavbarOpen}
          aria-label="Toggle navigation"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse${isNavbarOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {NAV_ITEMS.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink className={navLinkClass} to={item.to} onClick={closeNavbar}>
                  {item.label}
                </NavLink>
              </li>
            ))}
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
            <Link to="/cart" className="btn btn-outline-light position-relative" aria-label="Giỏ hàng" onClick={closeNavbar}>
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
                  {menuItems.map((item) => (
                    <li key={item.to}>
                      <Link className="dropdown-item" to={item.to} onClick={closeNavbar}>
                        <i className={`bi ${item.icon} me-2`} />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2" />Đăng Xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/signin" className="btn btn-light" onClick={closeNavbar}>
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