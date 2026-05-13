import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';

// Format tiền theo kiểu Việt Nam để hiển thị đồng nhất.
const currency = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') + '₫' : n);

const ITEMS_PER_PAGE = 20;

// Dữ liệu sort để tránh hard-code rải rác trong JSX.
const SORT_OPTIONS = [
  { value: 'moinhat', label: 'Mới nhất' },
  { value: 'gia-thap', label: 'Giá thấp đến cao' },
  { value: 'gia-cao', label: 'Giá cao đến thấp' },
  { value: 'ten-az', label: 'Tên A-Z' },
];

const SkeletonCard = () => (
  <div className="col-xl-3 col-lg-4 col-md-6">
    <div className="card h-100 border-0 shadow-sm">
      <div className="placeholder-glow" style={{height:220, background:'var(--gray-light)'}}>
        <span className="placeholder w-100 h-100 d-block rounded-top" />
      </div>
      <div className="card-body p-4">
        <span className="placeholder col-8 mb-2 rounded" />
        <span className="placeholder col-6 mb-3 rounded" />
        <span className="placeholder col-4 mb-3 rounded" />
        <span className="btn disabled placeholder col-12 mb-2 rounded-pill" />
        <span className="btn disabled placeholder col-12 rounded-pill" />
      </div>
    </div>
  </div>
);

const Products = () => {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tất cả');
  const [sort, setSort] = useState('moinhat');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['Tất cả', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const searchText = q.toLowerCase();

    const list = products.filter((product) => {
      const okCat = cat === 'Tất cả' || product.category === cat;
      const okQ =
        !searchText ||
        product.name.toLowerCase().includes(searchText) ||
        (product.description || '').toLowerCase().includes(searchText);

      return okCat && okQ;
    });

    // Sắp xếp theo lựa chọn hiện tại.
    if (sort === 'gia-thap') list.sort((a, b) => a.price - b.price);
    if (sort === 'gia-cao') list.sort((a, b) => b.price - a.price);
    if (sort === 'ten-az') list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    return list;
  }, [products, q, cat, sort]);

  // reset page khi filter thay đổi
  useEffect(() => { setPage(1); }, [q, cat, sort]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const handleAdd = (product) => {
    const ok = addToCart(product);
    if (!ok) {
      navigate('/signin');
      return;
    }

    setToast(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container my-5 fade-in-up">
      {toast && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow-sm" style={{ zIndex: 1050, borderRadius: 12 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
        <div>
          <h1 className="fw-bold m-0 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>
            <i className="bi bi-basket2-fill me-2"></i>Danh sách sản phẩm
          </h1>
          <p className="text-muted mb-0 mt-1">Khám phá {products.length} món ngon đang có sẵn</p>
        </div>
        {!loading && (
          <span className="badge bg-light text-dark border mt-2 mt-md-0 px-3 py-2" style={{borderRadius:'12px'}}>
            <i className="bi bi-funnel me-1"></i>{filtered.length} kết quả
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="card border-0 shadow-sm mb-4" style={{borderRadius:'var(--border-radius)'}}>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 align-items-center">
            <div className="col-lg-5">
              <div className="input-group" style={{borderRadius:'12px', overflow:'hidden'}}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 border-end-0"
                  placeholder="Tìm món ăn, đồ uống..."
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                />
                {q && (
                  <button className="btn btn-outline-secondary bg-white border-start-0" onClick={()=>setQ('')}>
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </div>
            </div>
            <div className="col-lg-7">
              <div className="d-flex gap-2 flex-nowrap overflow-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCat(category)}
                    className={`btn btn-sm flex-shrink-0 rounded-pill px-3 ${cat === category ? 'btn-warning text-white' : 'btn-outline-secondary'}`}
                    style={{ transition: 'var(--transition)' }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <select className="form-select rounded-pill" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="row g-4 products-grid">
        {loading
         ? Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)
          : paginated.map((product, idx) => (
            <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
              <div
                className="card h-100 shadow-sm hover-lift border-0 rounded-3 overflow-hidden"
                style={{animationDelay: `${idx * 0.05}s`}}
              >
                <div className="position-relative overflow-hidden">
                  <img
                    src={product.imageUrl || product.image || '/assets/images/placeholder.jpg'}
                    className="card-img-top"
                    alt={product.name}
                    loading="lazy"
                    style={{height: 220, objectFit: 'cover'}}
                    onError={(e)=>{e.currentTarget.src='/assets/images/placeholder.jpg'}}
                  />
                  {product.stock === 0 && (
                    <span className="position-absolute top-0 end-0 m-2 badge bg-danger fw-bold shadow-sm">
                      Hết hàng
                    </span>
                  )}
                  {product.tag && (
                    <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark fw-bold shadow-sm">
                      {product.tag}
                    </span>
                  )}
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <h6 className="card-title fw-bold mb-2 text-truncate" title={product.name} style={{fontSize:'1.05rem'}}>
                    {product.name}
                  </h6>
                  {product.rating !== undefined && product.rating !== null && (
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <i className="bi bi-star-fill text-warning" style={{ fontSize: '12px' }} />
                      <span className="small fw-semibold">{Number(product.rating).toFixed(1)}</span>
                    </div>
                  )}
                  {product.description && (
                    <p className="text-muted small mb-3" style={{height: 40, overflow: 'hidden', lineHeight:'1.4'}}>
                      {product.description}
                    </p>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 fw-bold mb-0" style={{color:'var(--primary-orange)'}}>
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    {product.category && (
                      <span className="badge bg-light text-muted fw-normal">{product.category}</span>
                    )}
                  </div>

                  <div className="mt-auto d-grid gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-outline-warning btn-sm fw-bold rounded-pill">
                      <i className="bi bi-eye me-1" /> Chi tiết
                    </Link>
                    <button
                      className="btn btn-warning text-white btn-sm fw-bold rounded-pill shadow-orange"
                      onClick={() => handleAdd(product)}
                      disabled={product.stock === 0}
                    >
                      <i className="bi bi-cart-plus me-1" /> {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-emoji-frown display-1 text-muted"></i>
          <h5 className="mt-3">Không tìm thấy món phù hợp</h5>
          <p className="text-muted">Thử đổi từ khóa hoặc danh mục khác nhé</p>
          <button className="btn btn-warning text-white rounded-pill px-4" onClick={()=>{setQ(''); setCat('Tất cả');}}>
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5">
          <ul className="pagination shadow-sm" style={{borderRadius:'12px', overflow:'hidden'}}>
            <li className={`page-item ${page===1? 'disabled' : ''}`}>
              <button className="page-link" onClick={()=>goToPage(Math.max(1, page-1))}>
                <i className="bi bi-chevron-left"></i>
              </button>
            </li>

            {Array.from({length: totalPages}, (_,i)=>i+1)
             .filter(p => p===1 || p===totalPages || Math.abs(p-page) <=1)
             .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx>0 && p - arr[idx-1] > 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
                  <li className={`page-item ${p===page? 'active' : ''}`}>
                    <button
                      className="page-link fw-bold"
                      style={p===page? {background:'var(--primary-orange)', borderColor:'var(--primary-orange)'} : {}}
                      onClick={()=>goToPage(p)}
                    >
                      {p}
                    </button>
                  </li>
                </React.Fragment>
              ))
            }

            <li className={`page-item ${page===totalPages? 'disabled' : ''}`}>
              <button className="page-link" onClick={()=>goToPage(Math.min(totalPages, page+1))}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Hiển thị trang */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-muted small mt-3">
          Trang {page}/{totalPages} • Hiển thị {paginated.length} trên {filtered.length} sản phẩm
        </p>
      )}
    </div>
  );
};

export default Products;