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

// SVG icons thay cho bootstrap-icons
const Ico = {
  cash: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12H6.01M18 12H18.01"/></svg>,
  product: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4-9 4-9-4 9-4z"/><path d="M3 10l9 4 9-4"/><path d="M3 14l9 4 9-4"/></svg>,
  order: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14h6M9 18h4"/></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

function StatCard({ title, value, sub, icon, grad }) {
  return (
    <div className="analysis-card" style={{ padding: 18 }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <div style={{ fontSize: 13, marginBottom: 4, color:'var(--muted)' }}>{title}</div>
          <div style={{ fontSize: 28, lineHeight: 1.1, fontWeight:800, color: '#0f172a' }}>{value}</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginTop:6 }}>{sub}</div>
        </div>
        <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: grad, display:'grid', placeItems:'center',
            color:'#fff', boxShadow: '0 10px 20px rgba(0,0,0,.12)'
          }}>
          {icon}
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

        // GIỮ NGUYÊN LOGIC CỦA BẠN
        const revenue = orders
        .filter(o => o.paymentMethod === 'cash' && o.status!== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
      <div className="panel" style={{padding:48, textAlign:'center'}}>
        <div className="spinner-border text-primary" role="status" />
        <div style={{marginTop:8, color:'var(--muted)'}}>Đang phân tích dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="top-cards" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <StatCard title="Doanh Thu" value={`${stats.totalRevenue.toLocaleString()}đ`} sub="Chỉ tính đơn tiền mặt" icon={Ico.cash} grad="linear-gradient(135deg,#22c55e,#7ee787)" />
        <StatCard title="Sản Phẩm" value={stats.totalProducts} sub="Món đang phục vụ" icon={Ico.product} grad="linear-gradient(135deg,#6a5cff,#8aa4ff)" />
        <StatCard title="Đơn Hàng" value={stats.totalOrders} sub="Tổng lượt mua" icon={Ico.order} grad="linear-gradient(135deg,#ffb86b,#ff7a00)" />
        <StatCard title="Người Dùng" value={stats.totalUsers} sub="Tài khoản đăng ký" icon={Ico.users} grad="linear-gradient(135deg,#a78bfa,#7c3aed)" />
      </div>

      <div className="middle" style={{ marginTop: 6 }}>
        <div className="panel">
          <div className="panel-head">
            <span>Phân Bổ Sản Phẩm Theo Danh Mục</span>
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

        <div className="panel">
          <div className="panel-head"><span>Tỷ Lệ Danh Mục Món Ăn</span></div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={4} dataKey="value">
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