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

const COLORS = ['#2f6bff', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6'];

function StatCard({ title, value, sub, icon, color }) {
  return (
    <div className="analysis-card p-4 shadow-sm border-0 mb-4 bg-white rounded-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="fw-bold mb-0" style={{ color }}>{value}</h3>
          <p className="small text-muted mb-0">{sub}</p>
        </div>
        <div className="fs-1 opacity-25" style={{ color }}>
          <i className={`bi ${icon}`} />
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

        // Tính doanh thu: Chỉ tính các đơn hàng thanh toán tiền mặt (cash) và không bị hủy
        const revenue = orders
          .filter(o => o.paymentMethod === 'cash' && o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Phân bổ danh mục
        const catMap = {};
        prods.forEach(p => {
          catMap[p.category] = (catMap[p.category] || 0) + 1;
        });
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
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchData();
  }, []);

  if (stats.loading) return <div className="p-5 text-center">Đang phân tích dữ liệu...</div>;

  return (
    <div className="p-4">
      {/* Top Stat Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard 
            title="Doanh Thu" 
            value={`${stats.totalRevenue.toLocaleString()}đ`} 
            sub="Chỉ tính đơn tiền mặt (không hủy)" 
            icon="bi-cash-coin" 
            color="#2ecc71"
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            title="Sản Phẩm" 
            value={stats.totalProducts} 
            sub="Món ăn đang phục vụ" 
            icon="bi-egg-fried" 
            color="#2f6bff"
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            title="Đơn Hàng" 
            value={stats.totalOrders} 
            sub="Lượt khách mua sắm" 
            icon="bi-receipt" 
            color="#e67e22"
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            title="Người Dùng" 
            value={stats.totalUsers} 
            sub="Tài khoản đã đăng ký" 
            icon="bi-people" 
            color="#9b59b6"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Category Chart */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 p-4 bg-white rounded-3 h-100">
            <h5 className="fw-bold mb-4">Phân Bổ Sản Phẩm Theo Danh Mục</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryData}>
                <CartesianGrid vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2f6bff" name="Số lượng món" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart for Category proportion */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 bg-white rounded-3 h-100">
            <h5 className="fw-bold mb-4">Tỷ Lệ Danh Mục Món Ăn</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}