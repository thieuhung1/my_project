import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query, products]);

  const title = useMemo(() => `Kết quả tìm kiếm: "${query}"`, [query]);

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1 className="fw-bold mb-3">{title}</h1>
      {results.length === 0 ? (
        <div className="text-center text-muted py-5">
          <div className="display-6 mb-2">🔍</div>
          Không tìm thấy sản phẩm nào.
          <div className="mt-3"><Link to="/products" className="btn btn-warning">Xem thực đơn</Link></div>
        </div>
      ) : (
        <div className="row g-4">
          {results.map(product => (
            <div key={product.id} className="col-md-4">
              <div className="card product-card shadow-sm h-100 border-0 hover-lift">
                <img
                  src={product.imageUrl || product.image || '/ASSETS/Images/placeholder.jpg'}
                  className="card-img-top product-card__image"
                  alt={product.name}
                  loading="lazy"
                  style={{height:220, objectFit:'cover'}}
                  onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
                />
                <div className="card-body product-card__body d-flex flex-column">
                  <h5 className="fw-bold text-truncate" title={product.name}>{product.name}</h5>
                  <p className="text-muted mb-3">{product.price.toLocaleString('vi-VN')} VNĐ</p>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        const ok = addToCart(product);
                        if (!ok) {
                          navigate('/login');
                          return;
                        }
                        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
                      }}
                    >
                      <i className="bi bi-cart-plus me-1" /> Giỏ hàng
                    </button>
                    <Link to={`/product/${product.id}`} className="btn btn-warning btn-sm">
                      <i className="bi bi-eye me-1" /> Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}    
    </div>
  );
};      

export default Search;

