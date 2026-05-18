// OrderSummaryCard.jsx - Thẻ thống kê dùng cho số liệu tổng quan của đơn hàng.
// File này hiển thị label, value, helper text và icon theo tone màu.

import React from 'react';

const OrderSummaryCard = ({ label, value, helper, tone = 'primary', icon }) => (
  <div className="card border-0 shadow-sm h-100 order-summary-card">
    <div className="card-body p-3 p-lg-4 d-flex align-items-center gap-3">
      <div className={`order-summary-icon order-summary-icon-${tone}`}>
        {icon ? <i className={`bi ${icon}`} /> : null}
      </div>
      <div className="min-w-0">
        <div className="small text-muted">{label}</div>
        <div className="h4 fw-bold mb-0 text-truncate">{value}</div>
        {helper ? <div className="small text-muted mt-1">{helper}</div> : null}
      </div>
    </div>
  </div>
);

export default OrderSummaryCard;
