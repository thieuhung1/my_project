import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';

const Products = () => {
  const { products, loading } = useProducts();
  const { dispatch } = useCart();

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
    <div className="container my-5">
      <h1 className="mb-4">Danh Sách Sản Phẩm</h1>
      
      {/* Filter & Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Tìm món ăn..." />
            <button className="btn btn-warning">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <select className="form-select">
            <option>Tất Cả</option>
            <option>Phở</option>
            <option>Bánh Mì</option>
            <option>Bánh Xèo</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {products.map(product => (
          <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
            <div className="card h-100 shadow-sm hover-lift border-0 rounded-3 overflow-hidden">
              <img src={product.imageUrl || product.image} className="card-img-top" alt={product.name} loading="lazy" style={{height: '220px', objectFit: 'cover'}} />
              <div className="card-body p-4">
                <h6 className="card-title fw-bold mb-2">{product.name}</h6>
                <p className="text-muted small mb-3 text-truncate-2" style={{height: '40px', overflow: 'hidden'}}>{product.description}</p>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="h5 fw-bold text-success mb-0">{product.price.toLocaleString()} VNĐ</span>
                  <span className="badge bg-warning">Hot</span>
                </div>
                <div className="d-grid gap-2">
                  <Link to={`/product/${product.id}`} className="btn btn-warning btn-sm fw-bold">Chi Tiết</Link>
                  <button className="btn btn-success btn-sm fw-bold" onClick={() => dispatch({type: 'ADD_TO_CART', payload: product})}>
                    <i className="bi bi-cart-plus me-1"></i>Giỏ Hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <nav className="mt-5" aria-label="Phân trang sản phẩm">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <a className="page-link" href="#" aria-label="Trước">
              <i className="bi bi-chevron-left"></i>
            </a>
          </li>
          <li className="page-item active"><a className="page-link" href="#">1</a></li>
          <li className="page-item"><a className="page-link" href="#">2</a></li>
          <li className="page-item"><a className="page-link" href="#" aria-label="Tiếp">
            <i className="bi bi-chevron-right"></i>
          </a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Products;
