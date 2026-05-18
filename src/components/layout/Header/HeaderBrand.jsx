// HeaderBrand.jsx - Hiển thị logo và tên thương hiệu ở đầu thanh điều hướng.
// File này chỉ xử lý phần branding và quay về trang chủ khi người dùng bấm vào logo.

import React from 'react';
import { Link } from 'react-router-dom';

const HeaderBrand = ({ closeNavbar }) => {
  return (
    <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" onClick={closeNavbar}>
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-3 shadow-sm"
        aria-label="FoodHub logo"
        style={{
          width: 42,
          height: 42,
          background: 'linear-gradient(135deg, #11cdef 0%, #0ea5e9 45%, #f43f5e 100%)',
          border: '2px solid rgba(255, 255, 255, 0.9)',
          color: '#ffffff',
          fontSize: '1.15rem',
          transform: 'rotate(-8deg)',
        }}
      >
        <i className="bi bi-bag-heart-fill" />
      </span>
      <span className="d-flex flex-column lh-1">
        <span
          style={{
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: 0.4,
            color: '#ffffff',
          }}
        >
          FoodHub
        </span>
        <small
          style={{
            fontSize: '0.68rem',
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.82)',
          }}
        >
          Fast Delivery
        </small>
      </span>
    </Link>
  );
};

export default HeaderBrand;
