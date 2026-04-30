import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCharts from './DashboardCharts';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import UserManager from './UserManager';
import CouponManager from './CouponManager';
import CategoryManager from './CategoryManager';
import SupportChatManager from './SupportChatManager';
import '../../styles/Admin.css';

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
      case 'Danh Mục': return <CategoryManager />;
      case 'Đơn Hàng': return <OrderManager />;
      case 'Người Dùng': return <UserManager />;
      case 'Mã Giảm Giá': return <CouponManager />;
      case 'Hỗ Trợ': return <SupportChatManager />;
      default: return <DashboardCharts />;
    }
  };

  const menuItems = [
    { id: 'Home', icon: 'bi-house', label: 'Trang chủ', action: () => navigate('/') },
    { id: 'Dashboard', icon: 'bi-speedometer2', label: 'Thống kê' },
    { id: 'Sản Phẩm', icon: 'bi-box-seam', label: 'Sản phẩm' },
    { id: 'Danh Mục', icon: 'bi-tags', label: 'Danh mục' },
    { id: 'Đơn Hàng', icon: 'bi-receipt', label: 'Đơn hàng' },
    { id: 'Người Dùng', icon: 'bi-people', label: 'Tài khoản' },
    { id: 'Mã Giảm Giá', icon: 'bi-ticket-perforated', label: 'Mã giảm' },
    { id: 'Hỗ Trợ', icon: 'bi-chat-dots', label: 'Hỗ trợ' },
  ];

  return (
    <div className="dash-layout">
      <aside className="sidebar sidebar--wide">
        <div className="brand">
          <div className="avatar">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="admin" />
            ) : (
              <div className="avatar-fallback">
                {(userProfile?.displayName || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="badge-admin">admin</span>
          </div>
        </div>

        <nav className="nav-wide">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={menu === item.id ? 'active' : ''}
              onClick={item.action ? item.action : () => setMenu(item.id)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="logout-wide" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Đăng xuất</span>
        </button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>{menu === 'Dashboard' ? 'Admin Panel' : menu}</h1>
            <small>{new Date().toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</small>
          </div>
          <input className="search" placeholder="Tìm kiếm nhanh..." />
        </header>

        <div style={{paddingBottom:24}}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}