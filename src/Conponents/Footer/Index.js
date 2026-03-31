import React from 'react';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>FoodHub</h5>
            <p>Đồ ăn ngon, giao hàng nhanh chóng đến tận tay bạn!</p>
          </div>
          <div className="col-md-4">
            <h5>Dịch Vụ</h5>
            <ul className="list-unstyled">
              <li><a href="/menu" className="text-white text-decoration-none">Menu</a></li>
              <li><a href="/order" className="text-white text-decoration-none">Đặt Hàng</a></li>
              <li><a href="/track" className="text-white text-decoration-none">Theo Dõi Đơn</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Theo Dõi Chúng Tôi</h5>
            <a href="#" className="text-white me-3"><i className="fab fa-facebook fa-2x"></i></a>
            <a href="#" className="text-white me-3"><i className="fab fa-instagram fa-2x"></i></a>
            <a href="#" className="text-white"><i className="fab fa-twitter fa-2x"></i></a>
          </div>
        </div>
        <hr className="my-4" />
        <div className="row">
          <div className="col text-center">
            <p>&copy; 2025 FoodHub. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

