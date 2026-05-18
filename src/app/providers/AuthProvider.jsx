// ============================================================
// AuthProvider.jsx - Bridge provider cho xác thực người dùng
// File này chuyển tiếp AuthContext thành provider dùng ở tầng app.
// ============================================================

import React from 'react';
import { AuthProvider as AuthContextProvider } from '../../contexts/AuthContext';

const AuthProvider = ({ children }) => {
  return <AuthContextProvider>{children}</AuthContextProvider>;
};

export default AuthProvider;