import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
  assignOrderToShipper,
  getUsersByRole
} from '../../services';

// KHÔNG import Admin.css nữa - vì bạn đã load global

const STATUS = {
  PENDING: { text: 'Chờ xử lý', bg: '#fff7ed', color: '#c2410c', bd: '#fed7aa' },
  WAITING_FOR_SHIPPER: { text: 'Chờ shipper', bg: '#eff6ff', color: '#1d4ed8', bd: '#bfdbfe' },
  CONFIRMED: { text: 'Đã xác nhận', bg: '#eef2ff', color: '#4338ca', bd: '#c7d2fe' },
  DELIVERING: { text: 'Đang giao', bg: '#ecfeff', color: '#0891b2', bd: '#a5f3fc' },
  COMPLETED: { text: 'Hoàn thành', bg: '#f0fdf4', color: '#15803d', bd: '#bbf7d0' },
  CANCELLED: { text: 'Đã hủy', bg: '#fef2f2', color: '#b91c1c', bd: '#fecaca' },
  FAILED: { text: 'Thất bại', bg: '#faf5ff', color: '#7e22ce', bd: '#e9d5ff' },
};

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xử lý' },
  { key: 'WAITING', label: 'Chờ shipper' },
  { key: 'DELIVERING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
];

const initials = (name='') => name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([getAllOrders(), getUsersByRole('staff')]);
      setOrders(o); setShippers(s);
    } catch (e) { console.error(e); alert('Lỗi tải đơn hàng'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o=>o.status==='PENDING').length,
    delivering: orders.filter(o=>['CONFIRMED','DELIVERING','WAITING_FOR_SHIPPER'].includes(o.status)).length,
    revenue: orders.filter(o=>o.status==='COMPLETED').reduce((a,b)=>a+(b.totalAmount||0),0)
  }), [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if(tab==='PENDING') list = list.filter(o=>o.status==='PENDING');
    if(tab==='WAITING') list = list.filter(o=>o.status==='WAITING_FOR_SHIPPER');
    if(tab==='DELIVERING') list = list.filter(o=>['CONFIRMED','DELIVERING'].includes(o.status));
    if(tab==='COMPLETED') list = list.filter(o=>o.status==='COMPLETED');
    if(q){
      const k=q.toLowerCase();
      list = list.filter(o=> o.id?.toLowerCase().includes(k) || (o.userName||o.customerName||'').toLowerCase().includes(k) || o.phone?.includes(k));
    }
    return list;
  }, [orders, tab, q]);

  const updateStatus = async (id, st) => { await updateOrderStatus(id, st); fetchData(); };
  const assignShip = async (id, sid) => {
    if(!sid) return;
    const ship = shippers.find(s=>s.id===sid);
    await assignOrderToShipper(id, sid, ship?.displayName || 'Shipper');
    fetchData();
  };

  const today = new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  if (loading) return (
    <div className="content"><div className="panel" style={{padding:48,textAlign:'center',color:'var(--muted)'}}>Đang tải đơn hàng...</div></div>
  );

  return (
    <div className="content">
      {/* Topbar đúng style Admin.css */}
      <div className="topbar">
        <div>
          <h1>Đơn Hàng</h1>
          <small style={{textTransform:'capitalize'}}>{today}</small>
        </div>
        <div style={{position:'relative'}}>
          <input className="search" placeholder="Tìm mã đơn, tên, SĐT..." value={q} onChange={e=>setQ(e.target.value)} style={{paddingLeft:36}}/>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{position:'absolute',left:12,top:12,opacity:.45}}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        </div>
      </div>

      {/* 4 thẻ thống kê - dùng.top-cards +.analysis-card */}
      <div className="top-cards" style={{marginBottom:18}}>
        {[
          {label:'Tổng đơn', value:stats.total, color:'#3a49ff', icon:'📦'},
          {label:'Chờ xử lý', value:stats.pending, color:'#f59e0b', icon:'⏳'},
          {label:'Đang giao', value:stats.delivering, color:'#06b6d4', icon:'🚚'},
          {label:'Doanh thu', value:stats.revenue.toLocaleString()+'đ', color:'#22c55e', icon:'💰'},
        ].map((c,i)=>(
          <div key={i} className="analysis-card" style={{padding:'16px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,color:'var(--muted)'}}>{c.label}</span>
              <span style={{fontSize:20}}>{c.icon}</span>
            </div>
            <div className="big-num" style={{color:c.color,fontSize:30,marginTop:6}}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{padding:0, overflow:'hidden'}}>
        <div className="panel-head" style={{padding:'16px 20px', borderBottom:'1px solid #f1f5f9'}}>
          <span style={{fontWeight:700,fontSize:18}}>Quản Lý Đơn Hàng</span>
          <div className="toggle">
            {TABS.map(t=> <button key={t.key} className={tab===t.key?'active':''} onClick={()=>setTab(t.key)}>{t.label}</button>)}
          </div>
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
            <thead>
              <tr style={{background:'linear-gradient(180deg,#fbfdff,#f7f9ff)'}}>
                {['Mã Đơn','Khách Hàng','Tổng Tiền','Trạng Thái','Shipper','Hành Động'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'14px 20px',fontSize:12,textTransform:'uppercase',letterSpacing:.5,color:'#64748b',fontWeight:700,borderBottom:'1px solid #eef2f7'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order=>{
                const st = STATUS[order.status]||STATUS.PENDING;
                const name = order.userName||order.customerName||'Khách';
                return (
                  <tr key={order.id} style={{transition:'background.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#fcfdff'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9'}}>
                      <code style={{background:'#f1f5f9',padding:'4px 8px',borderRadius:8,fontSize:12,color:'#475569'}}>{order.id.substring(0,8)}</code>
                    </td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--blue-2))',display:'grid',placeItems:'center',color:'#fff',fontWeight:800,boxShadow:'var(--shadow-soft)'}}>{initials(name)}</div>
                        <div>
                          <div style={{fontWeight:700,color:'#0f172a'}}>{name}</div>
                          <div style={{fontSize:13,color:'#94a3b8'}}>{order.phone||'—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9',fontWeight:800,color:'#e11d48',fontSize:15}}>{order.totalAmount?.toLocaleString()}đ</td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9'}}>
                      <span style={{background:st.bg,color:st.color,border:`1px solid ${st.bd}`,padding:'6px 12px',borderRadius:999,fontSize:12,fontWeight:700}}>{st.text}</span>
                    </td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9'}}>
                      {['COMPLETED','CANCELLED','FAILED'].includes(order.status)? (
                        <span style={{color:'#64748b',fontSize:13}}>{order.shipperName||'Không có'}</span>
                      ) : (
                        <select value={order.shipperId||''} onChange={e=>assignShip(order.id,e.target.value)} style={{padding:'9px 12px',borderRadius:12,border:'1px solid #e2e8f0',background:'#fff',minWidth:170,fontSize:13,boxShadow:'var(--shadow-soft)',outline:'none',cursor:'pointer'}}>
                          <option value="">-- Chọn Shipper --</option>
                          {shippers.map(s=> <option key={s.id} value={s.id}>{s.displayName||s.email}</option>)}
                        </select>
                      )}
                    </td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9'}}>
                      <div style={{display:'flex',gap:8}}>
                        {(order.status==='PENDING'||order.status==='WAITING_FOR_SHIPPER') && (
                          <button onClick={()=>updateStatus(order.id,'CONFIRMED')} style={{padding:'8px 14px',borderRadius:10,background:'#fff',border:'1px solid #a7f3d0',color:'#065f46',fontWeight:600,fontSize:13,cursor:'pointer',transition:'.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#ecfdf5'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Xác nhận</button>
                        )}
                        {!['CANCELLED','COMPLETED','FAILED'].includes(order.status) && (
                          <button onClick={()=>updateStatus(order.id,'CANCELLED')} style={{padding:'8px 14px',borderRadius:10,background:'#fff',border:'1px solid #fecdd3',color:'#be123c',fontWeight:600,fontSize:13,cursor:'pointer',transition:'.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#fff1f2'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Huỷ</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'64px 20px',color:'#94a3b8'}}>
                  <div style={{fontSize:42,marginBottom:12}}>🗂️</div>
                  Không có đơn hàng nào
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}