import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    {/* StrictMode disabled tạm để fix white screen - enable sau */}
    {/* <React.StrictMode> */}
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    {/* </React.StrictMode> */}
  </ErrorBoundary>
);

reportWebVitals();
