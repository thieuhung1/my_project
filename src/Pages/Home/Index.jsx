// Trang chủ của FoodHub.
// File này chịu trách nhiệm hiển thị hero banner, món nổi bật,
// USP, đánh giá khách hàng và các hành động điều hướng chính.
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import phoBoImage from '../../ASSETS/Images/phở bò.jpeg';
import banhXeoImage from '../../ASSETS/Images/bánh xèo.jpg';

// Format tiền theo kiểu Việt Nam để hiển thị đồng nhất trên toàn trang.
const currency = (n) => typeof n === 'number' ? n.toLocaleString('vi-VN') + '₫' : n;

// Khi ảnh sản phẩm lỗi, thay bằng ảnh mặc định để tránh giao diện bị vỡ.
const handleImageError = (e) => {
  e.currentTarget.src = phoBoImage;
};

// Hiển thị toast đơn giản để báo đã thêm món vào giỏ hàng.
const showToast = (msg) => {
  const el = document.createElement('div');
  el.innerHTML = `<div style="position:fixed;bottom:24px;right:24px;background:var(--success);color:white;padding:12px 18px;border-radius:12px;box-shadow:var(--shadow-md);z-index:9999;font-weight:500;animation:fadeInUp .3s ease">${msg}</div>`;
  document.body.appendChild(el.firstChild);
  setTimeout(() => document.body.lastChild?.remove(), 2000);
};

// Skeleton card dùng để giữ bố cục khi danh sách món đang tải.
const SkeletonCard = () => (
  <div className="col-lg-3 col-md-6 mb-4">
    <div className="card h-100 border-0 shadow-sm">
      <div className="placeholder-glow" style={{height:220, background:'var(--gray-light)'}}>
        <span className="placeholder w-100 h-100 d-block" />
      </div>
      <div className="card-body p-3">
        <span className="placeholder col-7 mb-2 rounded" />
        <span className="placeholder col-5 mb-3 rounded" />
        <span className="btn disabled placeholder col-12 mb-2 rounded-pill" />
        <span className="btn disabled placeholder col-12 rounded-pill" />
      </div>
    </div>
  </div>
);

// Dữ liệu USP (Unique Selling Proposition) để hiển thị trên trang chủ.
const USP_ITEMS = [
  { icon: 'bi-lightning-charge', title: 'Giao nhanh 30’', sub: 'Nội thành Vinh' },
  { icon: 'bi-shield-check', title: 'VSATTP', sub: 'Nguồn gốc rõ ràng' },
  { icon: 'bi-percent', title: 'Ưu đãi mỗi ngày', sub: 'Giảm tới 50%' },
];

// Dữ liệu đánh giá khách hàng để hiển thị trên trang chủ.
const TESTIMONIALS = [
  { text: 'Giao hàng siêu nhanh, đồ ăn còn nóng hổi!', name: 'Nguyễn Văn A', role: 'Khách quen' },
  { text: 'Khuyến mãi hấp dẫn, app dễ dùng. Yêu FoodHub!', name: 'Trần Thị B', role: 'Foodie' },
  { text: 'Đóng gói sạch sẽ, shipper thân thiện. 5 sao!', name: 'Lê Văn C', role: 'Member' },
];

// Component Home hiển thị toàn bộ trang chủ FoodHub.
const Home = () => {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const featured = useMemo(() => (Array.isArray(products) ? products.slice(0, 6) : []), [products]);

  const handleAdd = (product) => {
    const ok = addToCart(product);
    if (!ok) { navigate('/login'); return; }
    showToast(`Đã thêm ${product.name}`);
  };

  //----------------------------------------------------------
  // JSX để hiển thị trang chủ.
  return (
    <>
      {/* Hero */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active" aria-current="true" />
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" />
        </div>
        <div className="carousel-inner" style={{borderRadius:'0 0 var(--border-radius) var(--border-radius)', overflow:'hidden'}}>
          <div className="carousel-item active position-relative">
            <img src={phoBoImage} className="d-block w-100" alt="Phở bò" style={{objectFit:'cover', height:'72vh', minHeight:440}} onError={handleImageError} />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{background:'linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.6))'}} />
            <div className="carousel-caption text-start" style={{bottom:'18%'}}>
              <h1 className="display-5 fw-bold mb-3 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>Đồ Ăn Ngon Giao Nhanh</h1>
              <p className="lead text-white-50 mb-4 d-none d-md-block">Món Việt chuẩn vị, giao trong 30 phút tại Vinh.</p>
              <div className="d-flex gap-2">
                <Link to="/products" className="btn btn-warning text-white btn-lg rounded-pill px-4 shadow-orange"><i className="bi bi-bag-check me-2"/>Đặt Ngay</Link>
                <Link to="/promo" className="btn btn-outline-light btn-lg rounded-pill px-4 d-none d-md-inline-flex"><i className="bi bi-lightning-charge me-2"/>Khuyến mãi</Link>
              </div>
            </div>
          </div>
          <div className="carousel-item position-relative">
            <img src={banhXeoImage} className="d-block w-100" alt="Bánh xèo" style={{objectFit:'cover', height:'72vh', minHeight:440}} onError={handleImageError} />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{background:'linear-gradient(180deg, rgba(0,0,.2), rgba(0,0,0,.6))'}} />
            <div className="carousel-caption text-start" style={{bottom:'18%'}}>
              <h2 className="display-6 fw-bold text-white mb-3">Giảm 50% Đơn Đầu</h2>
              <p className="lead text-white-50 mb-4 d-none d-md-block">Nhập mã WELCOME50 khi thanh toán.</p>
              <Link to="/promo" className="btn btn-warning text-white btn-lg rounded-pill px-4 shadow-orange"><i className="bi bi-tags me-2"/>Xem Khuyến Mãi</Link>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon" /></button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next"><span className="carousel-control-next-icon" /></button>
      </div>

      <div className="container my-5 fade-in-up">
        {/* USP */}
        <div className="row g-3 mb-5">
          {USP_ITEMS.map(item => (
            <div className="col-12 col-md-4" key={item.title}>
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 shadow-sm hover-lift" style={{borderRadius:'var(--border-radius)'}}>
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{width:48, height:48, background:'var(--light-orange)'}}>
                  <i className={`bi ${item.icon}`} style={{color:'var(--primary-orange)', fontSize:'1.25rem'}}/>
                </div>
                <div>
                  <div className="fw-semibold">{item.title}</div>
                  <div className="text-muted small">{item.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured */}
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{fontFamily:'Roboto Condensed, sans-serif'}}>Phổ Biến Nhất</h2>
          <p className="text-muted">Những món bán chạy nhất tuần</p>
        </div>

{/* //<div key={product.id} className="col-xl-1 col-lg-4 col-md-4 mb-4" style={{animationDelay:`${idx*60}ms`}}></div> */}
        <div className="row products-grid">
          {loading ? Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>) :
            featured.length > 0 ? featured.map((product, idx) => (
              <div key={product.id} className=" col-lg-4 col-md-4 mb-4" style={{animationDelay:`${idx*60}ms`}}>
                
                <div className="card h-100 border-0 shadow-sm hover-lift overflow-hidden" style={{borderRadius:'var(--border-radius)'}}>
                  <div className="position-relative">
                    <img src={product.imageUrl || product.image || phoBoImage} className="card-img-top" alt={product.name} loading="lazy" style={{height:220, objectFit:'cover'}} onError={handleImageError}/>
                    {product.tag && <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">{product.tag}</span>}
                    {typeof product.rating === 'number' && (
                      <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-2"><i className="bi bi-star-fill text-warning me-1"/>{product.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <div className="card-body p-4 d-flex flex-column">
                    <h6 className="fw-bold mb-1 text-truncate" title={product.name}>{product.name}</h6>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fw-bold" style={{color:'var(--primary-orange)'}}>{currency(product.price)}</span>
                      {product.sold && <span className="badge" style={{background:'var(--light-orange)', color:'var(--dark-orange)'}}>Đã bán {product.sold}+</span>}
                    </div>
                    <div className="mt-auto d-grid gap-2">
                      <Link to={`/product/${product.id}`} className="btn btn-outline-warning btn-sm rounded-pill"><i className="bi bi-eye me-1"/>Chi tiết</Link>
                      <button className="btn btn-warning text-white btn-sm rounded-pill shadow-sm" onClick={()=>handleAdd(product)}><i className="bi bi-cart-plus me-1"/>Đặt mua</button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                  <div className="display-6 mb-2">🍜</div>
                  <h5 className="fw-bold">Chưa có món nào</h5>
                  <p className="text-muted">Quay lại sau hoặc xem toàn bộ thực đơn.</p>
                  <Link to="/products" className="btn btn-warning text-white rounded-pill px-4"><i className="bi bi-grid me-2"/>Xem thực đơn</Link>
                </div>
              </div>
            )
          }
        </div>

        <div className="text-center my-5">
          <Link to="/products" className="btn btn-warning text-white btn-lg rounded-pill px-5 shadow-orange"><i className="bi bi-grid me-2"/>Xem tất cả món ăn</Link>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{fontFamily:'Roboto Condensed, sans-serif'}}>Khách hàng nói gì</h2>
          <p className="text-muted mb-0">Đánh giá thật từ người dùng FoodHub</p>
        </div>
        <div className="row g-4">
          {TESTIMONIALS.map(t => (
            <div className="col-md-4" key={t.name}>
              <div className="card h-100 border-0 shadow-sm hover-lift" style={{borderRadius:'var(--border-radius)'}}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width:44, height:44, background:'var(--light-orange)', color:'var(--primary-orange)'}}><i className="bi bi-person-fill"/></div>
                    <div>
                      <div className="fw-semibold">{t.name}</div>
                      <div className="text-muted small">{t.role}</div>
                    </div>
                    <div className="ms-auto text-warning"><i className="bi bi-star-fill"/><i className="bi bi-star-fill"/><i className="bi bi-star-fill"/><i className="bi bi-star-fill"/><i className="bi bi-star-fill"/></div>
                  </div>
                  <p className="mb-0 text-muted">“{t.text}”</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;