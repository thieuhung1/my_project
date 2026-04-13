import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { getReviewsByProduct } from '../../backend/services/reviewService';

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { userProfile, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const product = products.find((p) => String(p.id) === String(id));

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getReviewsByProduct(id);
        setReviews(data);
      } catch (error) {
        console.error("Lỗi tải đánh giá:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  if (!product) {
    return (
      <div className="container my-5 text-center mt-5 pt-5">
        <h3>Sản phẩm không tồn tại</h3>
        <Link to="/products" className="btn btn-warning mt-3">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const ok = addToCart(product, qty);
    if (!ok) {
      navigate('/login');
      return;
    }

    alert(`Đã thêm ${qty} ${product.name} vào giỏ hàng!`);
  };

  const buyNow = () => {
    const ok = addToCart(product, qty);
    if (!ok) {
      navigate('/login');
      return;
    }

    navigate('/cart');
  };

  const handleToggleFavorite = async () => {
    if (favoriteLoading) return;
    try {
      setFavoriteLoading(true);
      await toggleFavorite(product.id);
    } catch (error) {
      alert(error.message);
      if (error.message.includes('đăng nhập')) navigate('/signin');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const isFavorite = userProfile?.favorites?.includes(product.id);

  return (
    <div className="container my-5">
      <nav aria-label="breadcrumb" className="mt-5 pt-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang Chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/products">Sản Phẩm</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        <div className="col-lg-6">
          <div className="shadow-sm overflow-hidden rounded-4">
            <img
              src={product.imageUrl || product.image || '/ASSETS/Images/placeholder.jpg'}
              className="w-100"
              alt={product.name}
              style={{ height: 500, objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/ASSETS/Images/placeholder.jpg'; }}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h1 className="fw-bold mb-0">{product.name}</h1>
              <button 
                className={`btn btn-link p-0 text-decoration-none fs-3 ${isFavorite ? 'text-danger' : 'text-muted'}`}
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                {favoriteLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`} />
                )}
              </button>
            </div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-warning">Hot</span>
              <span className="badge bg-success">Miễn phí ship</span>
            </div>
            <div className="display-6 fw-bold text-success mb-4">{product.price.toLocaleString('vi-VN')} VNĐ</div>

            <div className="mb-4" style={{ maxWidth: 220 }}>
              <label className="form-label fw-bold">Số lượng</label>
              <div className="input-group">
                <button className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <input
                  type="number"
                  className="form-control text-center"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
                />
                <button className="btn btn-outline-secondary" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex mb-4">
              <button className="btn btn-success btn-lg px-4" onClick={handleAddToCart}>
                <i className="bi bi-cart-plus me-2" /> Thêm vào giỏ
              </button>
              <button className="btn btn-warning btn-lg px-4" onClick={buyNow}>
                <i className="bi bi-lightning-charge me-2" /> Mua ngay
              </button>
            </div>

            <hr />
            <h5 className="fw-bold">Thông tin</h5>
            <ul className="list-unstyled m-0 d-grid gap-2 mb-4">
              <li><i className="bi bi-clock text-warning me-2" /> Giao trong 30 phút</li>
              <li><i className="bi bi-fire text-danger me-2" /> Nóng hổi từ bếp</li>
              <li><i className="bi bi-star-fill text-warning me-2" /> {product.rating?.toFixed(1) || '5.0'}/5 ({product.reviewCount || 0} đánh giá)</li>
            </ul>

            <h5 className="fw-bold mb-3">Đánh giá khách hàng</h5>
            {reviewsLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="reviews-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-bottom mb-2 pb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold small">{rev.userName || 'Ẩn danh'}</span>
                      <div className="text-warning small">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`bi bi-star${i < rev.rating ? '-fill' : ''} me-1`}></i>
                        ))}
                      </div>
                    </div>
                    <p className="small text-muted mb-0">{rev.comment}</p>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {rev.createdAt?.toDate()?.toLocaleDateString('vi-VN') || 'Vừa xong'}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">Chưa có đánh giá nào cho sản phẩm này.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
