import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useProducts } from '../../../contexts/ProductContext';
import HeaderBrand from './HeaderBrand';
import HeaderNav from './HeaderNav';
import HeaderNotifications from './HeaderNotifications';
import HeaderSearch from './HeaderSearch';
import HeaderStateToggle from './HeaderStateToggle';
import HeaderUserMenu from './HeaderUserMenu';
import { useHeaderMenuItems } from './HeaderMenuItems';
import { useHeaderSearchResults } from './HeaderSearchLogic';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NAV_ITEMS = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/products', label: 'Sản Phẩm' },
  { to: '/about', label: 'Giới Thiệu' },
  { to: '/contact', label: 'Liên Hệ' },
];

const getProductImage = (product) => product?.imageUrl || product?.image || '/ASSETS/Images/placeholder.jpg';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { cartCount } = useCart();
  const { products } = useProducts();
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

  const searchResults = useHeaderSearchResults(products, searchQuery);

  const handleSearch = (value = searchQuery) => {
    const q = value.trim();
    if (!q) return;
    closeNavbar();
    setSearchQuery('');
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  //───────Hàm handleLogout để đăng xuất───────

  const handleLogout = async () => {
    await signOut();
    handleNavigate('/signin');
  };

  const menuItems = useHeaderMenuItems({ isAuthenticated, isAdmin, isShipper, isWaiter });

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
        <HeaderBrand closeNavbar={closeNavbar} />

        <HeaderStateToggle isNavbarOpen={isNavbarOpen} onToggle={toggleNavbar} />

        <div className={`collapse navbar-collapse${isNavbarOpen ? ' show' : ''}`} id="navbarNav">
          <HeaderNav navItems={NAV_ITEMS} closeNavbar={closeNavbar} />

          <HeaderSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            handleSearch={handleSearch}
            getProductImage={getProductImage}
            closeNavbar={closeNavbar}
          />

          <div className="d-flex align-items-center gap-2">
            <HeaderNotifications />
            <Link to="/cart" className="btn btn-outline-light position-relative" aria-label="Giỏ hàng" onClick={closeNavbar}>
              <i className="bi bi-bag fs-5" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount > 99 ? '99+' : cartCount}
                  <span className="visually-hidden">items in cart</span>
                </span>
              )}
            </Link>

            <HeaderUserMenu
              isAuthenticated={isAuthenticated}
              userProfile={userProfile}
              user={user}
              menuItems={menuItems}
              handleLogout={handleLogout}
              closeNavbar={closeNavbar}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;