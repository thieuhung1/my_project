import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const { dispatch } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const product = products.find(p => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="container my-5 text-center mt-5 pt-5">
        <h3>Sản phẩm không tồn tại</h3>
        <Link to="/products" className="btn btn-warning mt-3">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const addToCart = () => {
    for (let i = 0; i < qty; i++) dispatch({ type: 'ADD_TO_CART', payload: product });
  };
  const buyNow = () => { addToCart(); navigate('/cart'); };

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
              onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
            />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h1 className="fw-bold mb-2">{product.name}</h1>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-warning">Hot</span>
              <span className="badge bg-success">Miễn phí ship</span>
            </div>
            <div className="display-6 fw-bold text-success mb-4">{product.price.toLocaleString('vi-VN')} VNĐ</div>

            <div className="mb-4" style={{ maxWidth: 220 }}>
              <label className="form-label fw-bold">Số lượng</label>
              <div className="input-group">
                <button className="btn btn-outline-secondary" onClick={()=>setQty(q=>Math.max(1,q-1))}>-</button>
                <input type="number" className="form-control text-center" min="1" value={qty} onChange={(e)=>setQty(Math.max(1, parseInt(e.target.value||'1',10)))} />
                <button className="btn btn-outline-secondary" onClick={()=>setQty(q=>q+1)}>+</button>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex mb-4">
              <button className="btn btn-success btn-lg px-4" onClick={addToCart}>
                <i className="bi bi-cart-plus me-2" /> Thêm vào giỏ
              </button>
              <button className="btn btn-warning btn-lg px-4" onClick={buyNow}>
                <i className="bi bi-lightning-charge me-2" /> Mua ngay
              </button>
            </div>

            <hr />
            <h5 className="fw-bold">Thông tin</h5>
            <ul className="list-unstyled m-0 d-grid gap-2">
              <li><i className="bi bi-clock text-warning me-2" /> Giao trong 30 phút</li>
              <li><i className="bi bi-fire text-danger me-2" /> Nóng hổi từ bếp</li>
              <li><i className="bi bi-star-fill text-warning me-2" /> 4.9/5 (1.234 đánh giá)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;