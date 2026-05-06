// ============================================================
// AppProviders.jsx - Gom các provider dùng chung của ứng dụng
// ============================================================

import React from 'react';
import AuthProvider from './AuthProvider';
import CartProvider from './CartProvider';
import ThemeProvider from './ThemeProvider';
import { ProductProvider } from '../../contexts/ProductContext';

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default AppProviders;