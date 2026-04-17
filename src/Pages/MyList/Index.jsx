import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';

const Skeleton = () => (
  <div className="col-md-4 col-sm-6 mb-4">
    <div className="card h-100 border-0 shadow-sm">
      <div className="shimmer" style={{height:220, borderRadius:'16px 16px 0 0'}} />
      <div className="card-body">
        <div className="shimmer mb-2" style={{height:20, width:'70%', borderRadius:8}} />
        <div className="shimmer" style={{height:16, width:'40%', borderRadius:8}} />
      </div>
    </div>
  </div>
);

const MyList = () => {
  const { products, loading, toggleFavorite } = useProducts(); // toggleFavorite cần có trong context
  const { user, userProfile } = useAuth();
  const [filter, setFilter] = useState('all');

  const favoriteProducts = useMemo(() => {
    if (!userProfile?.favorites) return [];
    return products.filter(p => userProfile.favorites.includes(p.id));
  }, [products, userProfile]);

  const filtered = useMemo(() => {
    if (filter === 'all') return favoriteProducts;
    return favoriteProducts.filter(p => (p.category || '').toLowerCase() === filter);
  }, [favoriteProducts, filter]);

  const categories = useMemo(() => {
    const cats = [...new Set(favoriteProducts.map(p => p.category).filter(Boolean))];
    return cats.slice(0, 4);
  }, [favoriteProducts]);

  const handleRemove = async (id) => {
    if (toggleFavorite) await toggleFavorite(id);
  };

  if (!user) {
    return (
      <div className="container my-5 text-center py-5 fade-in-up">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{width:80, height:80, background:'var(--light-orange)'}}>
          <i className="bi bi-heart fs-1" style={{color:'var(--primary-orange)'}}></i>
        </div>
        <h3 className="fw-bold">Đăng nhập để xem yêu thích</h3>
        <p className="text-muted">Lưu món ngon và đặt lại chỉ với 1 chạm</p>
        <Link to="/login" className="btn btn-warning text-white rounded-pill px-4 shadow-orange btn-ripple">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div className="container my-5 fade-in-up">
      <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold m-0 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>Danh Sách Yêu Thích</h1>
          <p className="text-muted m-0">Bạn đã lưu {favoriteProducts.length} món</p>
        </div>
        {favoriteProducts.length > 0 && (
          <span className="badge badge-gradient rounded-pill px-3 py-2">{filtered.length} món</span>
        )}
      </div>

      {favoriteProducts.length > 3 && (
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <button onClick={()=>setFilter('all')} className={`btn btn-sm rounded-pill ${filter==='all'?'btn-warning text-white':' '}`} style={filter!=='all'?{background:'var(--light-orange)', color:'var(--dark-orange)'}:{}}>Tất cả</button>
          {categories.map(c=>(
            <button key={c} onClick={()=>setFilter(c.toLowerCase())} className={`btn btn-sm rounded-pill ${filter===c.toLowerCase()?'btn-warning text-white':' '}`} style={filter!==c.toLowerCase()?{background:'var(--light-orange)', color:'var(--dark-orange)'}:{}}>{c}</button>
          ))}
        </div>
      )}

      <div className="row">
        {loading
         ? Array.from({length:6}).map((_,i)=><Skeleton key={i}/>)
          : filtered.length > 0? filtered.map((product, idx) => (
            <div key={product.id} className="col-md-4 col-sm-6 mb-4" style={{animationDelay:`${idx*50}ms`}}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative overflow-hidden">
                  <img
                    src={product.imageUrl || product.image || '/ASSETS/Images/placeholder.jpg'}
                    className="card-img-top blur-up"
                    alt={product.name}
                    loading="lazy"
                    style={{height:220, objectFit:'cover'}}
                    onLoad={e=>e.currentTarget.classList.add('loaded')}
                    onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
                  />
                  <button onClick={()=>handleRemove(product.id)} className="btn btn-sm rounded-circle position-absolute shadow-sm" style={{top:10, right:10, width:36, height:36, background:'white'}} aria-label="Bỏ yêu thích">
                    <i className="bi bi-heart-fill" style={{color:'var(--primary-orange)'}}></i>
                  </button>
                  {product.isNew && <span className="badge bg-success position-absolute" style={{top:10, left:10}}>Mới</span>}
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold mb-1 text-truncate" title={product.name}>{product.name}</h5>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="fw-bold" style={{color:'var(--primary-orange)'}}>
                      {(product.price || 0).toLocaleString('vi-VN')}đ
                    </span>
                    {product.oldPrice && <small className="text-muted text-decoration-line-through">{product.oldPrice.toLocaleString('vi-VN')}đ</small>}
                  </div>
                  <div className="mt-auto d-flex gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-outline-secondary btn-sm flex-grow-1 rounded-pill">
                      <i className="bi bi-eye me-1" /> Chi tiết
                    </Link>
                    <button className="btn btn-warning btn-sm text-white rounded-pill px-3 btn-ripple" onClick={()=>{/* addToCart */}}>
                      <i className="bi bi-bag-plus" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12 text-center py-5">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 pulse-slow" style={{width:80, height:80, background:'var(--light-orange)'}}>
                <i className="bi bi-heartbreak fs-1" style={{color:'var(--primary-orange)'}}></i>
              </div>
              <h5 className="fw-bold">Danh sách yêu thích trống</h5>
              <p className="text-muted">Thả tim món bạn thích, lần sau đặt lại trong 1 giây</p>
              <Link to="/products" className="btn btn-warning text-white rounded-pill px-4 shadow-orange">Khám phá ngay</Link>
            </div>
          )}
      </div>
    </div>
  );
};

export default MyList;