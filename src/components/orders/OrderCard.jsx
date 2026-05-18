// OrderCard.jsx - Card hiển thị một đơn hàng với mã, trạng thái và các hành động liên quan.
// File này được dùng để tái sử dụng giao diện đơn hàng ở nhiều màn hình khác nhau.

import React from 'react';
import OrderStatusBadge from './OrderStatusBadge';

const getOrderCode = (orderId) => `#${String(orderId || '').slice(-6).toUpperCase()}`;

const OrderCard = ({
  order,
  statusTone,
  statusLabel,
  statusIcon,
  meta,
  children,
  actions,
  footer,
  className = '',
}) => {
  const statusClass = meta?.statusClass || 'pending';

  return (
    <article className={`order-card status-${statusClass} ${className}`.trim()}>
      <div className="order-header">
        <strong>{getOrderCode(order?.id)}</strong>
        <OrderStatusBadge label={statusLabel} tone={statusTone} icon={statusIcon} />
      </div>

      <div className="order-body">
        {meta}
        {children}
      </div>

      {actions ? <div className="order-actions">{actions}</div> : null}
      {footer ? <div className="order-footer">{footer}</div> : null}
    </article>
  );
};

export default OrderCard;
