// ============================================================
// AuthProvider.jsx - Bridge provider cho xác thực người dùng
// ============================================================

import React from 'react';
import { AuthProvider as AuthContextProvider } from '../../contexts/AuthContext';

const AuthProvider = ({ children }) => {
  return <AuthContextProvider>{children}</AuthContextProvider>;
};

export default AuthProvider;