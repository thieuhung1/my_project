import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';

const Skeleton = () => (
  <div className="col-md-4 mb-4">
    <div className="card h-100 border-0 shadow-sm">
      <div className="placeholder-glow" style={{height:220, background:'var(--gray-light)'}}><span className="placeholder w-100 h-100 d-block" /></div>
      <div className="card-body">
        <span className="placeholder col-8" />
        <span className="placeholder col-4" />
        <span className="btn disabled placeholder col-6 mt-3" />
      </div>
    </div>
  </div>
);

const MyList = () => {
  const { products, loading } = useProducts();

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="d-flex align-items-end justify-content-between mb-3">
        <div>
          <h1 className="fw-bold m-0">Danh sách yêu thích</h1>
          <p className="text-muted m-0">Các món bạn đã thả tim (demo: hiển thị tất cả sản phẩm)</p>
        </div>
      </div>

      <div className="row">
        {loading
          ? Array.from({length:6}).map((_,i)=><Skeleton key={i}/>)
          : products.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card product-card h-100 shadow-sm border-0 hover-lift">
                <img
                  src={product.imageUrl || product.image || '/ASSETS/Images/placeholder.jpg'}
                  className="card-img-top product-card__image"
                  alt={product.name}
                  loading="lazy"
                  style={{height:220, objectFit:'cover'}}
                  onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
                />
                <div className="card-body product-card__body d-flex flex-column">
                  <h5 className="fw-bold mb-2 text-truncate">{product.name}</h5>
                  <div className="mt-auto d-flex gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-warning btn-sm">
                      <i className="bi bi-eye me-1" /> Xem
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyList;