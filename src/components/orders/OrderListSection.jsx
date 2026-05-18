// OrderListSection.jsx - Khung section dùng chung cho danh sách đơn hàng.
// File này lo phần tiêu đề, mô tả phụ, action và empty state.

import React from 'react';

const hasContent = (children) => children !== null && children !== undefined && children !== false;

const OrderListSection = ({ title, subtitle, children, emptyState, actions }) => (
  <section className="order-list-section">
    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h5 className="mb-1 fw-bold">{title}</h5>
        {subtitle ? <p className="text-muted mb-0 small">{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>

    {hasContent(children) ? children : emptyState}
  </section>
);

export default OrderListSection;
