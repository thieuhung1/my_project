import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { getReviewsByProduct, addReply, addReview, hasUserReviewed } from '../../backend/services/reviewService';

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { user, userProfile, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const product = products.find((p) => String(p.id) === String(id));

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getReviewsByProduct(id);
        setReviews(data);
        if (user?.uid) {
          const reviewed = await hasUserReviewed(id, user.uid);
          setUserHasReviewed(reviewed);
        }
      } catch (error) {
        console.error("Lỗi tải đánh giá:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id, userProfile, user]);

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

  // Tính rating trung bình và tổng số review
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : product.rating?.toFixed(1) || '0.0';

  // Xử lý reply cho review
  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    if (!userProfile) {
      navigate('/signin');
      return;
    }
    try {
      setReplyLoading(true);
      await addReply(reviewId, {
        userName: userProfile?.displayName || userProfile?.name || userProfile?.email || user?.displayName || 'Admin',
        userId: user.uid,
        content: replyText.trim(),
      });
      setReplyText("");
      setReplyingTo(null);
      // Reload reviews
      const data = await getReviewsByProduct(id);
      setReviews(data);
    } catch (error) {
      console.error("Lỗi gửi reply:", error);
      alert("Không thể gửi phản hồi");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!commentInput.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    if (!userProfile) {
      navigate('/signin');
      return;
    }
    try {
      setSubmitReviewLoading(true);
      await addReview({
        productId: id,
        userId: user.uid,
        userName: userProfile?.displayName || userProfile?.name || userProfile?.email || user?.displayName || 'Khách',
        rating: ratingInput,
        comment: commentInput.trim(),
        replies: []
      });
      alert("Cảm ơn bạn đã đánh giá!");
      setCommentInput("");
      setRatingInput(5);
      setUserHasReviewed(true);
      const data = await getReviewsByProduct(id);
      setReviews(data);
    } catch (error) {
      console.error("Lỗi gửi đánh giá", error);
      alert("Lỗi khi gửi đánh giá");
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


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
              <li><i className="bi bi-star-fill text-warning me-2" /> {avgRating}/5 ({totalReviews} đánh giá)</li>
            </ul>

            <h5 className="fw-bold mb-3">Đánh giá khách hàng</h5>

            {userProfile ? (
              userHasReviewed ? (
                <div className="alert alert-success fs-6 py-2 mb-4">Bạn đã gửi đánh giá cho sản phẩm này. Cảm ơn bạn!</div>
              ) : (
                <div className="mb-4 bg-light p-3 rounded shadow-sm">
                  <h6 className="fw-bold mb-2">Viết đánh giá của bạn</h6>
                  <div className="mb-2">
                    <label className="form-label small mb-1">Số sao:</label>
                    <div className="text-warning fs-5" style={{ cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <i key={star}
                          className={`bi bi-star${star <= ratingInput ? '-fill' : ''} me-1`}
                          onClick={() => setRatingInput(star)}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="form-control mb-2"
                    rows="3"
                    placeholder="Nhập nội dung đánh giá..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  ></textarea>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={handleAddReview}
                    disabled={submitReviewLoading}
                  >
                    {submitReviewLoading ? <span className="spinner-border spinner-border-sm" /> : 'Gửi Đánh Giá'}
                  </button>
                </div>
              )
            ) : (
              <div className="alert alert-secondary fs-6 py-2 mb-4">Vui lòng <Link to="/signin">đăng nhập</Link> để đánh giá.</div>
            )}

            {reviewsLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="reviews-section">
                <div className="reviews-list">
                  {currentReviews.map((rev) => (
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
                      <small className="text-muted d-block mb-2" style={{ fontSize: '0.75rem' }}>
                        {rev.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || 'Vừa xong'}
                      </small>

                      {/* Hiển thị replies */}
                      {rev.replies && rev.replies.length > 0 && (
                        <div className="ms-3 ps-3 border-start border-2 border-success-subtle mb-2">
                          {rev.replies.map((reply, idx) => (
                            <div key={idx} className="bg-light rounded p-2 mb-2">
                              <div className="d-flex justify-content-between">
                                <span className="fw-semibold small text-success">{reply.userName || 'Phản hồi'}</span>
                                <small className="text-muted">{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('vi-VN') : ''}</small>
                              </div>
                              <p className="small mb-0">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Nút Reply */}
                      {userProfile && (
                        <button
                          className="btn btn-link btn-sm text-decoration-none p-0"
                          onClick={() => setReplyingTo(rev.id)}
                        >
                          <i className="bi bi-reply me-1" /> Trả lời
                        </button>
                      )}

                      {/* Form Reply */}
                      {replyingTo === rev.id && (
                        <div className="mt-2">
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Nhập phản hồi..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleReply(rev.id)}
                            />
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleReply(rev.id)}
                              disabled={replyLoading || !replyText.trim()}
                            >
                              {replyLoading ? <span className="spinner-border spinner-border-sm" /> : 'Gửi'}
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {reviews.length > reviewsPerPage && (
                  <nav aria-label="Review Pagination" className="mt-3">
                    <ul className="pagination pagination-sm justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>Trước</button>
                      </li>
                      {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }).map((_, idx) => (
                        <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => paginate(idx + 1)}>
                            {idx + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === Math.ceil(reviews.length / reviewsPerPage) ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>Tiếp</button>
                      </li>
                    </ul>
                  </nav>
                )}
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
