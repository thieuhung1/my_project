import React from 'react';
import { NavLink } from 'react-router-dom';

const HeaderNav = ({ navItems, closeNavbar }) => {
  const navLinkClass = ({ isActive }) => `nav-link px-3${isActive ? ' active fw-semibold' : ''}`;

  return (
    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
      {navItems.map((item) => (
        <li className="nav-item" key={item.to}>
          <NavLink className={navLinkClass} to={item.to} onClick={closeNavbar}>
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default HeaderNav;
