import { useMemo } from 'react';

export const useHeaderMenuItems = ({ isAuthenticated, isAdmin, isShipper, isWaiter }) => {
  return useMemo(() => {
    if (!isAuthenticated) return [];

    return [
      { to: '/my-account', label: 'Tài Khoản', icon: 'bi-person' },
      { to: '/my-orders', label: 'Lịch Sử Mua Hàng', icon: 'bi-basket' },
      isAdmin && { to: '/admin', label: 'Quản Trị Admin', icon: 'bi-shield-lock' },
      isShipper && { to: '/shipper', label: 'Giao Hàng', icon: 'bi-truck' },
      isWaiter && { to: '/waiter', label: 'Bồi Bàn', icon: 'bi-person-badge' },
    ].filter(Boolean);
  }, [isAuthenticated, isAdmin, isShipper, isWaiter]);
};
