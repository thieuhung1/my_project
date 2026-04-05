import React, { createContext, useReducer, useContext, useEffect } from 'react';

/**
 * Tạo Context cho việc xác thực người dùng (Authentication).
 */
const AuthContext = createContext();

/**
 * Reducer xử lý các hành động liên quan đến trạng thái đăng nhập.
 * @param {Object} state - Trạng thái hiện tại (user, isAuthenticated).
 * @param {Object} action - Hành động gửi đến (type, payload).
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      // Lưu thông tin người dùng vào localStorage khi đăng nhập thành công
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, isAuthenticated: true };
      
    case 'LOGOUT':
      // Xóa thông tin người dùng khi đăng xuất
      localStorage.removeItem('user');
      return { ...state, user: null, isAuthenticated: false };
      
    case 'LOAD_USER':
      // Tải trạng thái người dùng từ bộ nhớ đệm (localStorage)
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
      
    default:
      return state;
  }
};

/**
 * Hook tùy chỉnh để sử dụng AuthContext dễ dàng trong các component khác.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Provider bọc quanh ứng dụng để cung cấp trạng thái đăng nhập toàn cục.
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { 
    user: null, 
    isAuthenticated: false 
  });

  // Tự động kiểm tra và tải thông tin người dùng từ localStorage khi ứng dụng khởi chạy
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      dispatch({ type: 'LOAD_USER', payload: JSON.parse(user) });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

