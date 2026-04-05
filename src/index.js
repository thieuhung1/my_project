import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import các Providers để bọc toàn bộ hệ thống (Global state management)
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';

/**
 * Tệp đầu vào chính của ứng dụng React.
 * Nơi khởi tạo DOM gốc và bọc ứng dụng trong các context cần thiết.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Bao bọc ứng dụng trong các Context Providers theo thứ tự phân cấp */}
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Đo lường hiệu năng của ứng dụng (Tùy chọn)
reportWebVitals();

