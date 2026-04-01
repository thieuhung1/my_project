import React, { createContext, useReducer, useContext } from 'react';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existing = state.find(item => item.id === action.payload.id);
      if (existing) {
        return state.map(item => item.id === action.payload.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item);
      }
      return [...state, { ...action.payload, quantity: 1 }];
    case 'REMOVE_FROM_CART':
      return state.filter(item => item.id !== action.payload.id);
    case 'UPDATE_QUANTITY':
      return state.map(item => item.id === action.payload.id 
        ? { ...item, quantity: action.payload.quantity } 
        : item);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, dispatch, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
