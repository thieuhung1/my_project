// OrderStatusBadge.jsx - Badge nhỏ hiển thị trạng thái của đơn hàng.
// File này chỉ lo phần nhãn trạng thái, màu sắc và icon đi kèm.

import React from 'react';

const OrderStatusBadge = ({ label, tone = 'secondary', icon }) => (
  <span className={`badge order-status-badge order-status-badge-${tone}`}>
    {icon ? <i className={`bi ${icon} me-1`} aria-hidden="true" /> : null}
    {label}
  </span>
);

export default OrderStatusBadge;
