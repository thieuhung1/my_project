
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderUserMenu = ({
  isAuthenticated,
  userProfile,
  user,
  menuItems,
  handleLogout,
  closeNavbar,
}) => {
  if (!isAuthenticated) {
    return (
      <Link to="/signin" className="btn btn-light" onClick={closeNavbar}>
        <i className="bi bi-person me-1" /> Đăng Nhập
      </Link>
    );
  }

  return (
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
  );
};

export default HeaderUserMenu;
