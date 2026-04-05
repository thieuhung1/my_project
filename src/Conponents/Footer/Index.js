import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="footer pt-5 pb-4 mt-5 text-white position-relative"
      style={{
        background: 'linear-gradient(135deg, var(--primary-orange), var(--dark-orange))',
      }}
    >
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <Link to="/" className="d-inline-flex align-items-center gap-2 text-white text-decoration-none mb-2">
              <span className="fs-3">🚀</span>
              <span className="fw-bold fs-4" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>FoodHub</span>
            </Link>
            <p className="text-white-50 mb-3">
              Đồ ăn ngon, giao nhanh trong 30 phút. Phục vụ tận tâm mỗi ngày.
            </p>
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill" style={{ background: 'var(--light-orange)', color: 'var(--dark-orange)' }}>
                <i className="bi bi-shield-check me-1" /> VSATTP
              </span>
              <span className="badge rounded-pill bg-success">
                <i className="bi bi-lightning-charge me-1" /> 30’ giao
              </span>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-uppercase fw-bold mb-3">Khám phá</h6>
            <ul className="list-unstyled m-0 d-grid gap-2">
              <li><Link to="/products" className="link-light text-decoration-none opacity-75 hover-opacity-100">Thực đơn</Link></li>
              <li><Link to="/promo" className="link-light text-decoration-none opacity-75">Khuyến mãi</Link></li>
              <li><Link to="/orders" className="link-light text-decoration-none opacity-75">Theo dõi đơn</Link></li>
              <li><Link to="/contact" className="link-light text-decoration-none opacity-75">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase fw-bold mb-3">Hỗ trợ</h6>
            <ul className="list-unstyled m-0 d-grid gap-2">
              <li><Link to="/help" className="link-light text-decoration-none opacity-75">Trung tâm trợ giúp</Link></li>
              <li><Link to="/shipping" className="link-light text-decoration-none opacity-75">Phí &amp; thời gian giao</Link></li>
              <li><Link to="/privacy" className="link-light text-decoration-none opacity-75">Chính sách bảo mật</Link></li>
              <li><Link to="/terms" className="link-light text-decoration-none opacity-75">Điều khoản</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="text-uppercase fw-bold mb-3">Kết nối</h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <a href="https://facebook.com" aria-label="Facebook" className="text-white fs-4 opacity-75 hover-opacity-100">
                <i className="bi bi-facebook" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="text-white fs-4 opacity-75 hover-opacity-100">
                <i className="bi bi-instagram" />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok" className="text-white fs-4 opacity-75 hover-opacity-100">
                <i className="bi bi-tiktok" />
              </a>
              <a href="mailto:support@foodhub.vn" aria-label="Email" className="text-white fs-4 opacity-75 hover-opacity-100">
                <i className="bi bi-envelope-fill" />
              </a>
            </div>
            <div className="text-white-50 small">
              <div className="mb-1"><i className="bi bi-geo-alt me-2" />TP. Vinh, Nghệ An</div>
              <div className="mb-1"><i className="bi bi-telephone me-2" />1900 1234</div>
              <div><i className="bi bi-clock me-2" />08:00 - 22:00 (T2–CN)</div>
            </div>
          </div>
        </div>

        <hr className="my-4 border-white opacity-25" />

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <p className="mb-0 text-white-50 small">
            &copy; {year} FoodHub. Tất cả quyền được bảo lưu.
          </p>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-credit-card text-white-50" />
            <i className="bi bi-wallet2 text-white-50" />
            <i className="bi bi-cash-coin text-white-50" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;