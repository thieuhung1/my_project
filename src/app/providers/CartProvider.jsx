// ============================================================
// CartProvider.jsx - Bridge provider cho giỏ hàng ở tầng app
// ============================================================
// File này giúp AppProviders dùng một nơi thống nhất cho provider,
// nhưng logic giỏ hàng thật vẫn nằm ở src/contexts/CartContext.jsx.

import React from 'react';
import { CartProvider as CartContextProvider } from '../../contexts/CartContext';

const CartProvider = ({ children }) => {
  return <CartContextProvider>{children}</CartContextProvider>;
};

export default CartProvider;