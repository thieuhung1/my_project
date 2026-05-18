// OrderTabs.jsx - Thanh tab lọc đơn hàng theo trạng thái.
// File này giúp chuyển nhanh giữa các nhóm đơn và hiển thị số lượng từng tab.

import React from 'react';

const OrderTabs = ({ tabs = [], activeKey, onChange }) => (
  <div className="shipper-tabs mb-4" role="tablist" aria-label="Bộ lọc đơn hàng">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        role="tab"
        aria-selected={activeKey === tab.key}
        className={`tab-btn ${activeKey === tab.key ? 'active' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.label} <span className="badge text-bg-light ms-1">{tab.count}</span>
      </button>
    ))}
  </div>
);

export default OrderTabs;
