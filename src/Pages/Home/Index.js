import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { formatCurrency } from '../../utils/format';

/**
 * Trang Chủ (Home Page) - Điểm dừng chân đầu tiên của người dùng.
 * Hiển thị Banner quảng cáo, sản phẩm nổi bật và nhận xét từ khách hàng.
 */
const Home = () => {
  // Lấy danh sách sản phẩm và trạng thái tải từ ProductContext
  const { products, loading } = useProducts();

  /**
   * Hiển thị trạng thái đang tải dữ liệu (Loading state).
   */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50" style={{ height: '50vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Phần Hero Carousel (Banner chuyển động) */}
      <div id="heroCarousel" className="carousel slide hero-carousel animate__animated animate__fadeIn" data-bs-ride="carousel">
        <div className="carousel-inner">
          {/* Slide 1: Phở Bò */}
          <div className="carousel-item active">
            <img 
              src="/ASSETS/Images/pho-bo.jpeg" 
              className="d-block w-100" 
              alt="Phở Bò Việt Nam" 
              style={{ objectFit: 'cover', height: '100vh', filter: 'brightness(70%)' }} 
            />
            <div className="carousel-caption d-none d-md-block text-start" style={{ bottom: '20%' }}>
              <h1 className="display-3 fw-bold text-white mb-3">Hương Vị Việt Truyền Thống</h1>
              <p className="lead fs-4 mb-4">Giao hàng nóng hổi đến tận tay bạn chỉ trong vòng 20 phút.</p>
              <Link to="/products" className="btn btn-warning btn-lg px-5 py-3 fw-bold shadow">Khám Phá Menu</Link>
            </div>
          </div>
          
          {/* Slide 2: Khuyến mãi Bánh Xèo */}
          <div className="carousel-item">
            <img 
              src="/ASSETS/Images/banh-xeo.jpg" 
              className="d-block w-100" 
              alt="Bánh Xèo giòn rụm" 
              style={{ objectFit: 'cover', height: '100vh', filter: 'brightness(70%)' }} 
            />
            <div className="carousel-caption d-none d-md-block text-start" style={{ bottom: '20%' }}>
              <h1 className="display-3 fw-bold text-white mb-3">Ưu Đãi Đặc Biệt Tuần Này</h1>
              <p className="lead fs-4 mb-4">Giảm ngay 50% cho người dùng đặt món lần đầu tiên qua ứng dụng.</p>
              <Link to="/promo" className="btn btn-warning btn-lg px-5 py-3 fw-bold shadow">Xem Khuyến Mãi</Link>
            </div>
          </div>
        </div>
        
        {/* Nút điều khiển Slide */}
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Trước</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Sau</span>
        </button>
      </div>

      {/* 2. Phần Sản phẩm phổ biến (Featured Products) */}
      <div className="container my-5">
        <div className="text-center mb-5 animate__animated animate__fadeInUp">
          <h2 className="fw-bold">Món Ngon Phổ Biến</h2>
          <p className="lead text-muted">Những món ăn được đặt nhiều nhất tuần qua trên FoodHub</p>
        </div>

        <div className="row g-4">
          {/* Lấy tối đa 6 sản phẩm đầu tiên để hiển thị ở trang chủ */}
          {products.slice(0, 6).map(product => (
            <div key={product.id} className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <img 
                  src={product.image} 
                  className="card-img-top" 
                  alt={product.name} 
                  loading="lazy" 
                  style={{ height: '250px', objectFit: 'cover' }}
                />
                <div className="card-body p-4 text-center">
                  <h5 className="card-title fw-bold">{product.name}</h5>
                  <p className="card-text text-warning fw-bold fs-5 mb-3">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="d-flex gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-outline-warning flex-grow-1 fw-bold">Chi Tiết</Link>
                    <Link to="/cart" className="btn btn-warning flex-grow-1 fw-bold">Đặt Mua</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút xem thêm liên kết tới trang Sản phẩm */}
        <div className="text-center mt-5">
          <Link to="/products" className="btn btn-warning btn-lg px-5 fw-bold animate__animated animate__pulse animate__infinite">
            Xem Tất Cả Menu <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>

        {/* 3. Phần Nhận xét từ khách hàng (Testimonials) */}
        <div className="mt-5 pt-5 text-center">
          <h2 className="fw-bold mb-5">Khách Hàng Nói Gì Về FoodHub</h2>
          <div className="row g-4">
            {/* Nhận xét 1 */}
            <div className="col-md-4">
              <div className="card border-0 bg-light p-4 h-100" style={{ borderRadius: '20px' }}>
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                </div>
                <p className="card-text italic">"Giao hàng cực kỳ nhanh chóng, món phở vẫn còn nóng hổi khi đến tay mình. Sẽ tiếp tục ủng hộ!"</p>
                <div className="fw-bold mt-3">- Anh Hoàng Long</div>
              </div>
            </div>
            {/* Nhận xét 2 */}
            <div className="col-md-4">
              <div className="card border-0 bg-light p-4 h-100" style={{ borderRadius: '20px' }}>
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                </div>
                <p className="card-text">"App dễ sử dụng, nhiều món đặc sản vùng miền rất ngon. Bánh xèo ở đây rất chuẩn vị."</p>
                <div className="fw-bold mt-3">- Chị Minh Anh</div>
              </div>
            </div>
            {/* Nhận xét 3 */}
            <div className="col-md-4">
              <div className="card border-0 bg-light p-4 h-100" style={{ borderRadius: '20px' }}>
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                </div>
                <p className="card-text">"Mình hay đặt ăn trưa ở văn phòng, giá cả rất hợp lý so với chất lượng đồ ăn nhận được."</p>
                <div className="fw-bold mt-3">- Chị Thu Thủy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;


