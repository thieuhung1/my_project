import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const { products, dispatch } = useCart();

  useEffect(() => {
    if (query) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [query, products]);

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Káº¿t Quáº£ TĂ¬m Kiáº¿m: "{query}"</h1>
      {results.length === 0 ? (
        <p>KhĂ´ng tĂ¬m tháº¥y sáº£n pháº©m nĂ o.</p>
      ) : (
        <div className="row">
          {results.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card product-card shadow-sm h-100">
                <img src={product.image} className="card-img-top product-card__image" alt={product.name} loading="lazy" />
                <div className="card-body product-card__body">
                  <h5>{product.name}</h5>
                  <p>{product.price.toLocaleString()} VNÄ</p>
                  <button className="btn btn-success me-2" onClick={() => dispatch({type: 'ADD_TO_CART', payload: product})}>Giá» HĂ ng</button>
                  <Link to={`/product/${product.id}`} className="btn btn-warning">Chi Tiáº¿t</Link>
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

