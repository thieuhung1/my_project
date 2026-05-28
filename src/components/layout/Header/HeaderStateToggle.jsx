
import React from 'react';

const HeaderStateToggle = ({ isNavbarOpen, onToggle }) => {
  return (
    <button
      className="navbar-toggler"
      type="button"
      aria-controls="navbarNav"
      aria-expanded={isNavbarOpen}
      aria-label="Toggle navigation"
      onClick={onToggle}
    >
      <span className="navbar-toggler-icon" />
    </button>
  );
};

export default HeaderStateToggle;
