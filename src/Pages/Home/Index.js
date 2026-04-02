import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang tải...</span>

        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Carousel */}
      <div id="heroCarousel" className="carousel slide hero-carousel animate__animated animate__fadeIn" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/ASSETS/Images/pho-bo.jpeg" className="d-block w-100" alt="Phá»Ÿ bĂ²" style={{objectFit: 'cover', height: '100vh'}} />
            <div className="carousel-caption d-none d-md-block">
              <h1 className="display-4 fw-bold">Đồ Ăn Ngon Giao Nhanh</h1>
              <Link to="/products" className="btn btn-warning btn-lg">Đặt Ngay</Link>

            </div>
          </div>
          <div className="carousel-item">
            <img src="/ASSETS/Images/banh-xeo.jpg" className="d-block w-100" alt="BĂ¡nh xĂ¨o" style={{objectFit: 'cover', height: '100vh'}} />
            <div className="carousel-caption d-none d-md-block">
              <h1>Giảm 50% Đơn Đầu</h1>
              <Link to="/promo" className="btn btn-warning btn-lg">Xem Khuyến Mãi</Link>

            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      <div className="container my-5">
        {/* Featured */}
        <div className="text-center mb-5 animate__animated animate__fadeInUp">
          <h2>Phổ Biến Nhất</h2>
          <p clasumName="lead">Những món ăn bán chạy nhất tuần</p>
        </div>

        <div className="row">
          {products.slice(0, 6).map(product => (
            <div key={product.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card product-card h-100 shadow hover-lift">
                <img src={product.image} className="card-img-top product-card__image" alt={product.name} loading="lazy" />
                <div className="card-body product-card__body p-3">
                  <h6 className="card-title fw-bold mb-2">{product.name}</h6>
                  <p className="text-muted small mb-3">{product.price.toLocaleString()} VNĐ</p>
                  <div className="d-grid gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-outline-warning btn-sm">Chi Tiết</Link>
                    <Link to="/cart" className="btn btn-warning btn-sm">Đặt Mua</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="row my-5">
          <div className="col text-center">
            <Link to="/products" className="btn btn-warning btn-lg animate__animated animate__pulse animate__infinite">Xem Tất Cả Món Ăn</Link>

          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-5 animate__animated animate__fadeInUp">
          <h2>Khách Hàng Nói Gì</h2>
        </div>

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <p className="card-text">"Giao hĂ ng siĂªu nhanh, Ä‘á»“ Äƒn ngon!"</p>
                <h6>- Nguyá»…n VÄƒn A</h6>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <p className="card-text">"Khuyáº¿n mĂ£i háº¥p dáº«n, yĂªu FoodHub!"</p>
                <h6>- Tráº§n Thá»‹ B</h6>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <p className="card-text">"Dá»‹ch vá»¥ tuyá»‡t vá»i 5 sao!"</p>
                <h6>- LĂª VÄƒn C</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

