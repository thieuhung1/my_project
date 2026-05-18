// OrderStatsGrid.jsx - Grid hiển thị các thẻ thống kê đơn hàng.
// File này nhận danh sách chỉ số và render thành các card đồng nhất.

import React from 'react';
import OrderSummaryCard from './OrderSummaryCard';

const OrderStatsGrid = ({ items = [] }) => (
  <div className="row g-3 mb-4">
    {items.map((item) => (
      <div key={item.label} className="col-12 col-md-4">
        <OrderSummaryCard {...item} />
      </div>
    ))}
  </div>
);

export default OrderStatsGrid;
