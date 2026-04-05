import React, { createContext, useReducer, useContext } from 'react';

/**
 * Quản lý trạng thái giỏ hàng (Cart) trong toàn bộ ứng dụng.
 */
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Kiểm tra liệu sản phẩm này đã có trong giỏ hàng chưa
      const existing = state.find(item => item.id === action.payload.id);
      if (existing) {
        // Nếu có rồi, tăng số lượng thêm 1
        return state.map(item => item.id === action.payload.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item);
      }
      // Nếu chưa có, đưa vào giỏ với số lượng mặc định là 1
      return [...state, { ...action.payload, quantity: 1 }];
      
    case 'REMOVE_FROM_CART':
      // Loại bỏ sản phẩm ra khỏi giỏ
      return state.filter(item => item.id !== action.payload.id);
      
    case 'UPDATE_QUANTITY':
      // Cập nhật số lượng mới cho một sản phẩm cụ thể
      return state.map(item => item.id === action.payload.id 
        ? { ...item, quantity: action.payload.quantity } 
        : item);
        
    case 'CLEAR_CART':
      // Xóa sạch toàn bộ giỏ hàng
      return [];
      
    default:
      return state;
  }
};

const CartContext = createContext();

/**
 * Hook phục vụ cho việc lấy thông tin và điều phối giỏ hàng từ component.
 */
export const useCart = () => useContext(CartContext);

/**
 * Provider bao bọc các thành phần liên quan đến mua sắm của ứng dụng.
 */
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Tổng số lượng sản phẩm đang có trong giỏ hàng để hiển thị trên badge của Header
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, dispatch, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

