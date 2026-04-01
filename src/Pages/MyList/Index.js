import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';

const MyList = () => {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Äang táº£i...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Danh SĂ¡ch YĂªu ThĂ­ch</h1>
      <p className="lead">CĂ¡c mĂ³n Äƒn báº¡n yĂªu thĂ­ch (demo vá»›i táº¥t cáº£ sáº£n pháº©m)</p>
      <div className="row">
        {products.map(product => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card product-card h-100 shadow-sm">
              <img src={product.image} className="card-img-top product-card__image" alt={product.name} loading="lazy" />
              <div className="card-body product-card__body">
                <h5>{product.name}</h5>
                <Link to={`/product/${product.id}`} className="btn btn-warning">Xem</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyList;

