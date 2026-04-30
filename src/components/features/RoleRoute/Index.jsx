// ============================================================
// RoleRoute - Component bảo vệ định tuyến theo vai trò
// Chỉ cho phép truy cập nếu role người dùng nằm trong danh sách
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return (
      <div className="container my-5 text-center">
        <div className="display-1 mb-3">🔒</div>
        <h2 className="fw-bold">Truy cập bị từ chối</h2>
        <p className="text-muted mb-4">Bạn không có quyền truy cập trang này.</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

export default RoleRoute;
