import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';

const SkeletonCard = () => (
  <div className="col-xl-3 col-lg-4 col-md-6">
    <div className="card h-100 border-0 shadow-sm">
      <div className="placeholder-glow" style={{height:220, background:'var(--gray-light)'}}><span className="placeholder w-100 h-100 d-block" /></div>
      <div className="card-body p-4">
        <span className="placeholder col-8 mb-2" />
        <span className="placeholder col-6 mb-3" />
        <span className="btn disabled placeholder col-12 mb-2" />
        <span className="btn disabled placeholder col-12" />
      </div>
    </div>
  </div>
);

const Products = () => {
  const { products, loading } = useProducts();
  const { dispatch } = useCart();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tất cả');

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['Tất cả', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const okCat = cat === 'Tất cả' || p.category === cat;
      const okQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.description || '').toLowerCase().includes(q.toLowerCase());
      return okCat && okQ;
    });
  }, [products, q, cat]);

  return (
    <div className="container my-5">
      <div className="d-flex align-items-end justify-content-between mb-3">
        <h1 className="fw-bold m-0">Danh sách sản phẩm</h1>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
            <input type="text" className="form-control" placeholder="Tìm món ăn..." value={q} onChange={(e)=>setQ(e.target.value)} />
            {q && <button className="btn btn-outline-secondary" onClick={()=>setQ('')}><i className="bi bi-x-lg" /></button>}
          </div>
        </div>
        <div className="col-md-6">
          <select className="form-select" value={cat} onChange={(e)=>setCat(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-4">
        {loading
          ? Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)
          : filtered.map(product => (
            <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm hover-lift border-0 rounded-3 overflow-hidden">
                <img
                  src={product.imageUrl || product.image || '/ASSETS/Images/placeholder.jpg'}
                  className="card-img-top"
                  alt={product.name}
                  loading="lazy"
                  style={{height: 220, objectFit: 'cover'}}
                  onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
                />
                <div className="card-body p-4 d-flex flex-column">
                  <h6 className="card-title fw-bold mb-2 text-truncate" title={product.name}>{product.name}</h6>
                  <p className="text-muted small mb-3" style={{height: 40, overflow: 'hidden'}}>{product.description}</p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 fw-bold text-success mb-0">{product.price.toLocaleString('vi-VN')} VNĐ</span>
                    {product.tag && <span className="badge bg-warning">{product.tag}</span>}
                  </div>
                  <div className="mt-auto d-grid gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-warning btn-sm fw-bold">
                      <i className="bi bi-eye me-1" /> Chi tiết
                    </Link>
                    <button
                      className="btn btn-success btn-sm fw-bold"
                      onClick={() => {
                        dispatch({ type: 'ADD_TO_CART', payload: product });
                        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
                      }}
                    >
                      <i className="bi bi-cart-plus me-1" /> Giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center text-muted py-5">Không tìm thấy món phù hợp.</div>
      )}
    </div>
  );
};

export default Products;