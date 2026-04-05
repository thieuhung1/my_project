import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { userProfile, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập thì đẩy về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Nếu không có role hoặc role không nằm trong mảng cho phép
  const userRole = userProfile?.role || 'customer';
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Không có quyền, đẩy về trang chủ hoặc lỗi
    return <Navigate to="/" replace />;
  }

  // Hợp lệ thì cho phép render component con (thông qua Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
