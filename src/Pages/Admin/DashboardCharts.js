import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  getAllProducts,
  getAllOrders,
  getAllUsers,
  getAllCategories
} from '../../backend';

const COLORS = ['#6a5cff', '#22c55e', '#ffb15e', '#ff7a7a', '#4ec9ff', '#9b59b6'];

function StatCard({ title, value, sub, icon, grad }) {
  return (
    <div className="analysis-card" style={{ padding: 18 }}>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>{title}</div>
          <div className="fw-bold" style={{ fontSize: 28, lineHeight: 1.1, color: '#0f172a' }}>{value}</div>
          <div className="small text-muted mt-1">{sub}</div>
        </div>
        <div
          className="d-grid place-items-center text-white"
          style={{
            width: 48, height: 48, borderRadius: 12,
            background: grad, boxShadow: '0 10px 20px rgba(0,0,0,.12)'
          }}
        >
          <i className={`bi ${icon} fs-5`} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardCharts() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    categoryData: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [prods, orders, users, cats] = await Promise.all([
          getAllProducts(),
          getAllOrders(),
          getAllUsers(),
          getAllCategories()
        ]);

        // Doanh thu: chỉ đơn tiền mặt và không hủy
        const revenue = orders
         .filter(o => o.paymentMethod === 'cash' && o.status!== 'cancelled')
         .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Đếm sản phẩm theo danh mục
        const catMap = {};
        prods.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
        const categoryData = Object.keys(catMap).map(slug => ({
          name: cats.find(c => c.slug === slug)?.name || slug,
          value: catMap[slug]
        }));

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalProducts: prods.length,
          totalUsers: users.length,
          categoryData,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({...prev, loading: false }));
      }
    }
    fetchData();
  }, []);

  if (stats.loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2 text-muted">Đang phân tích dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Top cards */}
      <div className="top-cards" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <StatCard
          title="Doanh Thu"
          value={`${stats.totalRevenue.toLocaleString()}đ`}
          sub="Chỉ tính đơn tiền mặt"
          icon="bi-cash-coin"
          grad="linear-gradient(135deg,#22c55e,#7ee787)"
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalProducts}
          sub="Món đang phục vụ"
          icon="bi-egg-fried"
          grad="linear-gradient(135deg,#6a5cff,#8aa4ff)"
        />
        <StatCard
          title="Đơn Hàng"
          value={stats.totalOrders}
          sub="Tổng lượt mua"
          icon="bi-receipt"
          grad="linear-gradient(135deg,#ffb86b,#ff7a00)"
        />
        <StatCard
          title="Người Dùng"
          value={stats.totalUsers}
          sub="Tài khoản đăng ký"
          icon="bi-people"
          grad="linear-gradient(135deg,#a78bfa,#7c3aed)"
        />
      </div>

      <div className="middle" style={{ marginTop: 6 }}>
        {/* Bar chart */}
        <div className="panel">
          <div className="panel-head">
            <span>Phân Bổ Sản Phẩm Theo Danh Mục</span>
            <div className="toggle small">
              <button className="active">Số lượng</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8ecf6' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barGrad)" name="Số món" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6a5cff" />
                  <stop offset="100%" stopColor="#8aa4ff" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="panel">
          <div className="panel-head">
            <span>Tỷ Lệ Danh Mục Món Ăn</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%" cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8ecf6' }} />
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}