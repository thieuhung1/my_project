import React from 'react';
import { Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Footer = () => {
  return (
    <footer className="footer py-5 mt-5" style={{background: 'linear-gradient(135deg, #FF6B35, #E65100)', color: 'white'}}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>FoodHub</h5>
            <p>Đồ ăn ngon, giao hàng nhanh chóng đến tận tay bạn!</p>
          </div>
          <div className="col-md-4">
            <h5>Dịch Vụ</h5>
            <ul className="list-unstyled">
              <li><Link to="/products" className="text-white text-decoration-none">Menu</Link></li>
              <li><Link to="/cart" className="text-white text-decoration-none">Giỏ Hàng</Link></li>
              <li><Link to="/orders" className="text-white text-decoration-none">Theo Dõi Đơn</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Theo Dõi Chúng Tôi</h5>
            <a href="#" className="text-white me-3" style={{fontSize: '2rem'}}><i className="fab fa-facebook"></i></a>
            <a href="#" className="text-white me-3" style={{fontSize: '2rem'}}><i className="fab fa-instagram"></i></a>
            <a href="#" className="text-white" style={{fontSize: '2rem'}}><i className="fab fa-twitter"></i></a>
          </div>
        </div>
        <hr className="my-4 border-white opacity-50" />
        <div className="row">
          <div className="col text-center">
            <p className="mb-0">&copy; 2025 FoodHub. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

