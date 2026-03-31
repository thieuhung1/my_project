import React from 'react';
import { Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
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
              <Link className="nav-link" to="/menu">Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/promo">Khuyến Mãi</Link>
            </li>
          </ul>
          <form className="d-flex me-3">
            <input className="form-control me-2" type="search" placeholder="Tìm kiếm món ăn..." aria-label="Search" />
            <button className="btn btn-outline-light" type="submit"><i className="bi bi-search"></i></button>
          </form>
          <div className="d-flex">
            <Link to="/cart" className="btn btn-outline-light me-2 position-relative">
              <i className="bi bi-cart fs-4"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">Shopping items</span>
              </span>
            </Link>
            <Link to="/login" className="btn btn-outline-light">
              <i className="bi bi-person me-1"></i>Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

