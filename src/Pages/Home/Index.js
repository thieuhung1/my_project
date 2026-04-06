import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import useAuth from '../../backend/hooks/useAuth';
import { subscribeToMessages, sendSupportMessage } from '../../backend/services/supportChatService';
import { serverTimestamp } from 'firebase/database';


const currency = (n) =>
  typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VNĐ' : n;

const SkeletonCard = () => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
      <div
        className="placeholder-glow"
        style={{ height: 220, background: 'var(--gray-light)' }}
      >
        <span className="placeholder col-12 h-100 d-block" />
      </div>
      <div className="card-body p-3">
        <h6 className="card-title placeholder-glow mb-2">
          <span className="placeholder col-8" />
        </h6>
        <p className="placeholder-glow mb-3">
          <span className="placeholder col-5" />
        </p>
        <div className="d-grid gap-2">
          <span className="btn btn-outline-warning btn-sm disabled placeholder col-12" />
          <span className="btn btn-warning btn-sm disabled placeholder col-12" />
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const featured = Array.isArray(products) ? products.slice(0, 6) : [];

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  // Use user UID or a unique anonymous ID (could be stored in localStorage)
  const chatId = user ? user.uid : 'anon-' + (localStorage.getItem('anon_chat_id') || Math.random().toString(36).substring(7));
  
  if (!user && !localStorage.getItem('anon_chat_id')) {
    localStorage.setItem('anon_chat_id', chatId.replace('anon-', ''));
  }

  // Chat logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatId, (data) => {
      const sortedMsgs = data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setMessages(sortedMsgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    try {
      await sendSupportMessage(chatId, {
        text,
        userId: user?.uid || chatId,
        userName: user?.displayName || user?.email?.split('@')[0] || 'Khách',
        direction: 'user', // Explicitly marked as user
        timestamp: serverTimestamp()
      });
    } catch (err) {
      setInput(text);
      alert('Gửi thất bại: ' + err.message);
    }
  };

  const toggleChat = () => setChatOpen(prev => !prev);

  const quickReplies = [
    { label: 'Đặt hàng', msg: 'Tôi muốn đặt món ăn, tư vấn giúp?' },
    { label: 'Theo dõi đơn', msg: 'Kiểm tra đơn hàng của tôi' },
    { label: 'Khuyến mãi', msg: 'Có ưu đãi gì hôm nay?' },
    { label: 'Admin', msg: 'Liên hệ Admin hỗ trợ' }
  ];

  return (
    <>
      {/* Hero Carousel */}
      <div
        id="heroCarousel"
        className="carousel slide hero-carousel animate__animated animate__fadeIn"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1" />
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2" />
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active position-relative">
            <img
              src="/ASSETS/Images/pho-bo.jpeg"
              className="d-block w-100"
              alt="Phở bò"
              style={{ objectFit: 'cover', height: '70vh', minHeight: 420 }}
              loading="eager"
              onError={(e) => { e.currentTarget.src = '/ASSETS/Images/placeholder.jpg'; }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />
            <div className="carousel-caption d-block text-start pb-4 pb-md-5">
              <h1 className="display-5 fw-bold text-gradient-orange mb-3">
                Đồ Ăn Ngon Giao Nhanh
              </h1>
              <p className="lead text-white-50 mb-4 d-none d-md-block">
                Món Việt chuẩn vị, giao trong 30 phút.
              </p>
              <div className="d-flex gap-2">
                <Link to="/products" className="btn btn-warning btn-lg shadow-orange">
                  <i className="bi bi-bag-check me-2" />
                  Đặt Ngay
                </Link>
                <Link to="/promo" className="btn btn-outline-light btn-lg d-none d-md-inline-flex">
                  <i className="bi bi-lightning-charge me-2" />
                  Khuyến mãi
                </Link>
              </div>
            </div>
          </div>

          <div className="carousel-item position-relative">
            <img
              src="/ASSETS/Images/banh-xeo.jpg"
              className="d-block w-100"
              alt="Bánh xèo"
              style={{ objectFit: 'cover', height: '70vh', minHeight: 420 }}
              loading="lazy"
              onError={(e) => { e.currentTarget.src = '/ASSETS/Images/placeholder.jpg'; }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />
            <div className="carousel-caption d-block text-start pb-4 pb-md-5">
              <h2 className="display-5 fw-bold text-white mb-3">
                Giảm 50% Đơn Đầu
              </h2>
              <p className="lead text-white-50 mb-4 d-none d-md-block">
                Nhập mã WELCOME50 khi thanh toán.
              </p>
              <Link to="/promo" className="btn btn-warning btn-lg shadow-orange">
                <i className="bi bi-tags me-2" />
                Xem Khuyến Mãi
              </Link>
            </div>
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev" aria-label="Previous">
          <span className="carousel-control-prev-icon" />
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next" aria-label="Next">
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      <div className="container my-5">
        {/* USP strip */}
        <div className="row g-3 mb-5">
          {[
            { icon: 'bi-lightning-charge', title: 'Giao nhanh 30’', sub: 'Nội thành' },
            { icon: 'bi-shield-check', title: 'An toàn thực phẩm', sub: 'Chuẩn VSATTP' },
            { icon: 'bi-percent', title: 'Ưu đãi mỗi ngày', sub: 'Tiết kiệm tới 50%' },
          ].map((i) => (
            <div className="col-12 col-md-4" key={i.title}>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-white shadow-sm hover-lift">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 48, height: 48, background: 'var(--light-orange)' }}>
                  <i className={`bi ${i.icon}`} style={{ color: 'var(--primary-orange)' }} />
                </div>
                <div>
                  <div className="fw-semibold">{i.title}</div>
                  <div className="text-muted small">{i.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured header */}
        <div className="text-center mb-4 mb-md-5 animate__animated animate__fadeInUp">
          <h2 className="fw-bold mb-2">Phổ Biến Nhất</h2>
          <p className="lead text-muted mb-0">Những món bán chạy nhất tuần</p>
        </div>

        {/* Grid */}
        <div className="row products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
            : featured.length > 0
              ? featured.map((product, index) => (
                  <div
                    key={product.id}
                    className="col-lg-4 col-md-6 mb-4 fade-in-up"
                    style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
                  >
                    <div className="card product-card h-100 shadow-sm border-0 hover-lift">
                      <div className="position-relative overflow-hidden">
                        <img
                          src={product.imageUrl || product.image || '/ASSETS/Images/placeholder.jpg'}
                          className="card-img-top product-card__image"
                          alt={product.name}
                          loading="lazy"
                          style={{ height: 220, objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.src = '/ASSETS/Images/placeholder.jpg'; }}
                        />
                        {product.tag && (
                          <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2 shadow-sm">
                            {product.tag}
                          </span>
                        )}
                        {typeof product.rating === 'number' && (
                          <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-2">
                            <i className="bi bi-star-fill text-warning me-1" />
                            {product.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="card-body product-card__body p-3 d-flex flex-column">
                        <h6 className="card-title fw-bold mb-1 text-truncate" title={product.name}>
                          {product.name}
                        </h6>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="text-muted small">{currency(product.price)}</span>
                          {product.sold && (
                            <span className="badge rounded-pill" style={{ background: 'var(--light-orange)', color: 'var(--dark-orange)' }}>
                              Đã bán {product.sold}+
                            </span>
                          )}
                        </div>
                        <div className="mt-auto d-grid gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="btn btn-outline-warning btn-sm"
                            aria-label={`Xem chi tiết ${product.name}`}
                          >
                            <i className="bi bi-eye me-1" />
                            Chi Tiết
                          </Link>
                          <Link
                            to="/cart"
                            className="btn btn-warning btn-sm"
                            aria-label={`Đặt mua ${product.name}`}
                          >
                            <i className="bi bi-cart-plus me-1" />
                            Đặt Mua
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : (
                <div className="col-12">
                  <div className="text-center py-5 my-4 bg-white rounded-3 shadow-sm">
                    <div className="display-6 mb-3">🍜</div>
                    <h5 className="fw-bold mb-2">Chưa có món nào để hiển thị</h5>
                    <p className="text-muted mb-4">Hãy quay lại sau hoặc khám phá toàn bộ thực đơn.</p>
                    <Link to="/products" className="btn btn-warning">
                      <i className="bi bi-grid me-2" />
                      Xem Thực Đơn
                    </Link>
                  </div>
                </div>
              )}
        </div>

        {/* CTA */}
        <div className="row my-5">
          <div className="col text-center">
            <Link to="/products" className="btn btn-warning btn-lg shadow-orange animate__animated animate__pulse animate__infinite">
              <i className="bi bi-grid me-2" />
              Xem Tất Cả Món Ăn
            </Link>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-4 mb-md-5 animate__animated animate__fadeInUp">
          <h2 className="fw-bold">Khách Hàng Nói Gì</h2>
          <p className="text-muted mb-0">Đánh giá thật từ người dùng FoodHub</p>
        </div>

        <div className="row g-4">
          {[
            { text: 'Giao hàng siêu nhanh, đồ ăn còn nóng hổi!', name: 'Nguyễn Văn A', role: 'Khách quen' },
            { text: 'Khuyến mãi hấp dẫn, app dễ dùng. Yêu FoodHub!', name: 'Trần Thị B', role: 'Foodie' },
            { text: 'Đóng gói sạch sẽ, shipper thân thiện. 5 sao!', name: 'Lê Văn C', role: 'Member' },
          ].map((t) => (
            <div className="col-md-4" key={t.name}>
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center me-3"
                      style={{ width: 44, height: 44, background: 'var(--light-orange)', color: 'var(--primary-orange)' }}
                    >
                      <i className="bi bi-person-fill" />
                    </div>
                    <div>
                      <div className="fw-semibold">{t.name}</div>
                      <div className="text-muted small">{t.role}</div>
                    </div>
                    <div className="ms-auto text-warning">
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                    </div>
                  </div>
                  <p className="card-text mb-0">“{t.text}”</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

{/* Floating Support Chat - Ẩn khi mở */}
      {!chatOpen && (
        <button
          className="position-fixed bottom-0 end-0 m-4 btn btn-success rounded-circle p-3 shadow-lg border-0 d-flex align-items-center justify-content-center"
          style={{
            width: '60px',
            height: '60px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)'
          }}
          onClick={toggleChat}
          title="Nhắn tin hỗ trợ"
        >
          <i className="bi bi-chat-dots-fill text-white fs-4" />
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div
          className="position-fixed bottom-0 end-0 m-4 bg-white rounded-3 shadow-xl border-0 overflow-hidden d-flex flex-column"
          style={{
            width: '360px',
            height: '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            zIndex: 9998,
            right: 0,
            bottom: 0
          }}
        >
          <div className="bg-success bg-opacity-90 text-white p-3 position-relative">
            <i className="bi bi-headset me-2" />
            <strong>Hỗ trợ & ChatBot</strong>
            <button className="btn-close btn-close-white position-absolute top-2 end-2" onClick={toggleChat} />
          </div>
          <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
            {messages.length === 0 ? (
              // ... (quick replies part)
              <div className="text-center py-5">
                <i className="bi bi-chat-square-quote fs-1 text-muted mb-3" />
                <p className="text-muted mb-4">Chào! Chọn câu hỏi nhanh hoặc gõ tin nhắn</p>
                <div className="d-grid gap-2">
                  {quickReplies.map((r, i) => (
                    <button key={i} className="btn btn-outline-secondary btn-sm" onClick={() => setInput(r.msg)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className={`mb-2 ${msg.direction === 'user' ? 'text-end' : ''}`}>
                  <div className={`d-inline-block p-2 rounded-pill shadow-sm ${msg.direction === 'user' ? 'bg-success text-white' : 'bg-light'}`}>
                    {msg.text}
                  </div>
                  <small className="d-block text-muted">{msg.direction === 'user' ? 'Bạn' : 'Hỗ trợ'}</small>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-top">
            <div className="input-group">
              <input
                className="form-control"
                placeholder="Gõ tin nhắn (Enter gửi)..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-success" onClick={sendMessage}>
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Home;
