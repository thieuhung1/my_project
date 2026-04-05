import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const { dispatch } = useCart();
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return <div className="container my-5 text-center mt-5 pt-5"><h3>Sản phẩm không tồn tại</h3><Link to="/products" className="btn btn-warning mt-3">Quay lại cửa hàng</Link></div>;

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
          <div id="detailCarousel" className="carousel slide shadow-sm overflow-hidden" style={{borderRadius: '20px'}}>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src={product.imageUrl || product.image} className="d-block w-100" alt={product.name} style={{height: '500px', objectFit: 'cover'}} />
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#detailCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#detailCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon"></span>
            </button>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="p-4 border rounded shadow-sm" style={{background: 'var(--white)', minHeight: '500px'}}>
            <h1 className="fw-bold mb-3">{product.name}</h1>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-warning fs-6 me-2">Hot</span>
              <span className="badge bg-success fs-6">Miễn phí ship</span>
            </div>
            <h2 className="text-success fw-bold mb-4 fs-1">{product.price.toLocaleString()} VNĐ</h2>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Số Lượng:</label>
                <div className="input-group">
                  <button className="btn btn-outline-secondary">-</button>
                  <input type="number" className="form-control text-center" value="1" min="1" />
                  <button className="btn btn-outline-secondary">+</button>
                </div>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-4">
              <button className="btn btn-success btn-lg me-md-2 px-5 py-3" onClick={() => dispatch({type: 'ADD_TO_CART', payload: product})}>
                <i className="bi bi-cart-plus me-2"></i>Thêm Vào Giỏ
              </button>
              <button className="btn btn-warning btn-lg px-5 py-3">
                <i className="bi bi-lightning-charge me-2"></i>Mua Ngay
              </button>
            </div>

            <hr />
            <h5>Thông Tin Chi Tiết</h5>
            <ul className="list-unstyled">
              <li><i className="bi bi-clock text-warning me-2"></i>Thời gian giao: 30 phút</li>
              <li><i className="bi bi-fire text-danger me-2"></i>Nóng hổi từ bếp</li>
              <li><i className="bi bi-star-fill text-warning me-2"></i>4.9/5 sao (1,234 đánh giá)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
