import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';

const fmt = n => n?.toLocaleString('vi-VN') + 'đ';
const highlight = (text, q) => {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q})`, 'gi'));
  return parts.map((p,i)=> p.toLowerCase()===q.toLowerCase() ? <mark key={i} style={{background:'var(--light-orange)', color:'var(--dark-orange)', padding:0}}>{p}</mark> : p);
};

export default function Search() {
  const [params] = useSearchParams();
  const query = (params.get('q')||'').trim();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [sort, setSort] = useState('relevant');
  const [cat, setCat] = useState('all');
  const [toast, setToast] = useState('');

  // lưu lịch sử
  useEffect(()=>{ if(query){ const h = JSON.parse(localStorage.getItem('fh_search')||'[]').filter(x=>x!==query); localStorage.setItem('fh_search', JSON.stringify([query,...h].slice(0,5))); } },[query]);
  const history = JSON.parse(localStorage.getItem('fh_search')||'[]');

  const results = useMemo(()=>{
    const q = query.toLowerCase();
    if(!q) return [];
    let r = products.filter(p => p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
    if(cat!=='all') r = r.filter(p => (p.category||'').toLowerCase()===cat);
    if(sort==='price-asc') r.sort((a,b)=>a.price-b.price);
    if(sort==='price-desc') r.sort((a,b)=>b.price-a.price);
    return r;
  },[query, products, cat, sort]);

  const categories = useMemo(()=>[...new Set(products.map(p=>p.category).filter(Boolean))].slice(0,5),[products]);

  const add = (p) => { if(!addToCart(p,1)){ navigate('/login'); return; } setToast(`Đã thêm ${p.name}`); setTimeout(()=>setToast(''),2000); };

  return (
    <div className="container my-5 fade-in-up">
      {toast && <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow-sm" style={{zIndex:1050, borderRadius:12}}>{toast}</div>}

      <div className="mb-4">
        <h1 className="fw-bold mb-1 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>
          {query ? <>Kết quả cho "{query}"</> : 'Tìm kiếm'}
        </h1>
        <p className="text-muted m-0">{query ? `${results.length} món tìm thấy` : 'Nhập từ khóa ở thanh trên'}</p>
      </div>

      {!query && history.length>0 && (
        <div className="mb-4">
          <small className="text-muted">Tìm gần đây:</small>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {history.map(h=><Link key={h} to={`/search?q=${encodeURIComponent(h)}`} className="btn btn-sm rounded-pill" style={{background:'var(--light-orange)', color:'var(--dark-orange)'}}>{h}</Link>)}
          </div>
        </div>
      )}

      {query && (
        <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
          <div className="btn-group btn-group-sm">
            <button className={`btn rounded-pill ${sort==='relevant'?'btn-warning text-white':'btn-outline-secondary'}`} onClick={()=>setSort('relevant')}>Liên quan</button>
            <button className={`btn rounded-pill ${sort==='price-asc'?'btn-warning text-white':'btn-outline-secondary'}`} onClick={()=>setSort('price-asc')}>Giá tăng</button>
            <button className={`btn rounded-pill ${sort==='price-desc'?'btn-warning text-white':'btn-outline-secondary'}`} onClick={()=>setSort('price-desc')}>Giá giảm</button>
          </div>
          <select className="form-select form-select-sm w-auto rounded-pill" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(c=><option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div className="row g-4">{[...Array(6)].map((_,i)=><div key={i} className="col-md-4"><div className="shimmer rounded-4" style={{height:280}}/></div>)}</div>
      ) : results.length===0 ? (
        <div className="text-center py-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{width:80,height:80,background:'var(--light-orange)'}}><i className="bi bi-search fs-1" style={{color:'var(--primary-orange)'}}/></div>
          <h5 className="fw-bold">Không tìm thấy "{query}"</h5>
          <p className="text-muted">Thử từ khóa khác hoặc xem gợi ý</p>
          <Link to="/products" className="btn btn-warning text-white rounded-pill px-4 shadow-orange btn-ripple">Xem thực đơn</Link>
        </div>
      ) : (
        <div className="row g-4">
          {results.map(p=>(
            <div key={p.id} className="col-md-4 col-sm-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="overflow-hidden" style={{borderRadius:'16px 16px 0 0'}}>
                  <img src={p.imageUrl||p.image||'/ASSETS/Images/placeholder.jpg'} alt={p.name} className="w-100 blur-up" style={{height:220,objectFit:'cover', transition:'transform .4s'}} onLoad={e=>e.currentTarget.classList.add('loaded')} onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} onError={e=>e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}/>
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="fw-bold text-truncate" title={p.name}>{highlight(p.name, query)}</h6>
                  <div className="mb-2"><span className="fw-bold" style={{color:'var(--primary-orange)'}}>{fmt(p.price)}</span>{p.oldPrice && <small className="text-muted text-decoration-line-through ms-2">{fmt(p.oldPrice)}</small>}</div>
                  <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-success btn-sm flex-grow-1 rounded-pill btn-ripple" onClick={()=>add(p)}><i className="bi bi-cart-plus me-1"/>Thêm</button>
                    <Link to={`/product/${p.id}`} className="btn btn-outline-warning btn-sm rounded-pill"><i className="bi bi-eye"/></Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 