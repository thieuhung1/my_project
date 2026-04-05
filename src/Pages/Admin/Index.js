import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../backend';
import DashboardCharts from './DashboardCharts';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import UserManager from './UserManager';
import CouponManager from './CouponManager';
import CategoryManager from './CategoryManager';
import './Admin.css';

export default function Admin() {
  const [menu, setMenu] = useState('Dashboard');
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const renderContent = () => {
    switch (menu) {
      case 'Dashboard': return <DashboardCharts />;
      case 'Sản Phẩm': return <ProductManager />;
      case 'Đơn Hàng': return <OrderManager />;
      case 'Người Dùng': return <UserManager />;
      case 'Danh Mục': return <CategoryManager />;
      case 'Mã Giảm Giá': return <CouponManager />;
      default: return <DashboardCharts />;
    }
  };

  const menuItems = [
    { id: 'Home', icon: 'bi-house', label: 'Về Trang Chủ', action: () => navigate('/') },
    { id: 'Dashboard', icon: 'bi-pie-chart', label: 'Thống Kê' },
    { id: 'Sản Phẩm', icon: 'bi-box-seam', label: 'Sản Phẩm' },
    { id: 'Danh Mục', icon: 'bi-tags', label: 'Danh Mục' },
    { id: 'Đơn Hàng', icon: 'bi-receipt', label: 'Đơn Hàng' },
    { id: 'Người Dùng', icon: 'bi-people', label: 'Tài Khoản' },
    { id: 'Mã Giảm Giá', icon: 'bi-tag-fill', label: 'Mã Giảm Giá' },
  ];

  return (
    <div className="dash-layout">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="avatar">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="avatar" className="circle" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="circle d-flex justify-content-center align-items-center bg-primary text-white fs-5 fw-bold">
              {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'A'}
            </div>
          )}
          <span className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill">
            <i className="bi bi-shield-lock-fill" style={{ fontSize: '0.6rem' }}></i>
          </span>
        </div>

        <nav className="mt-4 w-100 px-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`btn text-start w-100 mb-2 py-2 px-3 fw-semibold rounded-3 border-0 d-flex flex-column align-items-center ${menu === item.id ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
              onClick={item.action ? item.action : () => setMenu(item.id)}
              style={{ transition: 'all 0.2s' }}
            >
              <i className={`bi ${item.icon} fs-4 mb-1`}></i>
              <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="btn btn-outline-danger mt-auto mx-2 mb-3 py-2 fw-semibold d-flex flex-column align-items-center border-0" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right fs-4 mb-1"></i>
          <span style={{ fontSize: '0.75rem' }}>Đăng Xuất</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="content overflow-auto" style={{ maxHeight: '100vh', padding: '1rem 2rem' }}>
        <header className="topbar mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold mb-1">Admin Panel</h1>
            <p className="text-muted mb-0 small">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="d-flex align-items-center">
            <div className="input-group ms-3 bg-white rounded-pill overflow-hidden shadow-sm" style={{ width: '300px', border: '1px solid #eef2f7' }}>
              <span className="input-group-text bg-transparent border-0 pe-1"><i className="bi bi-search text-muted"></i></span>
              <input type="text" className="form-control border-0 shadow-none bg-transparent" placeholder="Tìm kiếm nhanh..." />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="pb-5">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}