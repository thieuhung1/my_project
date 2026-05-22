import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase.Config';
import {
  updateOrderStatus,
  cancelOrder,
  assignOrderToShipper,
  markTableVacated,
  getUsersByRole,
  ORDER_STATUS,
} from '../../features/services';

// KHÔNG import Admin.css nữa - vì bạn đã load global

const STATUS = {
  [ORDER_STATUS.PENDING]: { text: 'Chờ xử lý', bg: '#fff7ed', color: '#c2410c', bd: '#fed7aa' },
  [ORDER_STATUS.WAITING_FOR_SHIPPER]: { text: 'Chờ shipper', bg: '#eff6ff', color: '#1d4ed8', bd: '#bfdbfe' },
  [ORDER_STATUS.CONFIRMED]: { text: 'Đã xác nhận', bg: '#eef2ff', color: '#4338ca', bd: '#c7d2fe' },
  [ORDER_STATUS.DELIVERING]: { text: 'Đang giao', bg: '#ecfeff', color: '#0891b2', bd: '#a5f3fc' },
  [ORDER_STATUS.COMPLETED]: { text: 'Hoàn thành', bg: '#f0fdf4', color: '#15803d', bd: '#bbf7d0' },
  [ORDER_STATUS.CANCELLED]: { text: 'Đã hủy', bg: '#fef2f2', color: '#b91c1c', bd: '#fecaca' },
  [ORDER_STATUS.FAILED]: { text: 'Thất bại', bg: '#faf5ff', color: '#7e22ce', bd: '#e9d5ff' },
};

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xử lý' },
  { key: 'WAITING', label: 'Chờ shipper' },
  { key: 'DELIVERING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
];

const TOTAL_TABLES = 20;

const initials = (name='') => name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    let mounted = true;

    const loadShippers = async () => {
      setLoading(true);
      try {
        const s = await getUsersByRole('staff');
        if (mounted) setShippers(s);
      } catch (e) {
        console.error(e);
        if (mounted) alert('Lỗi tải dữ liệu shipper');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadShippers();

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const liveOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(liveOrders);
      },
      (error) => {
        console.error('Realtime orders error:', error);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o=>o.status===ORDER_STATUS.PENDING).length,
    delivering: orders.filter(o=>[ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING, ORDER_STATUS.WAITING_FOR_SHIPPER].includes(o.status)).length,
    revenue: orders.filter(o=>o.status===ORDER_STATUS.COMPLETED).reduce((a,b)=>a+(b.totalAmount||0),0)
  }), [orders]);

  const tableFlow = useMemo(() => {
    const dineInActiveOrders = orders.filter((o) => {
      if (o.type !== 'DINE_IN') return false;
      if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED].includes(o.status)) return false;

      if (o.status === ORDER_STATUS.COMPLETED) {
        return o.tableVacated !== true;
      }

      return true;
    });

    const occupiedTableSet = new Set(
      dineInActiveOrders
        .map((o) => String(o.table_id || '').trim())
        .filter(Boolean)
    );

    const allTables = Array.from({ length: TOTAL_TABLES }, (_, i) => `Bàn ${i + 1}`);
    const tableCards = allTables.map((tableName) => {
      const activeOrder = dineInActiveOrders.find((o) => String(o.table_id || '').trim() === tableName);
      return {
        tableName,
        isOccupied: occupiedTableSet.has(tableName),
        activeOrder,
      };
    });

    return {
      occupiedCount: tableCards.filter((t) => t.isOccupied).length,
      emptyCount: tableCards.filter((t) => !t.isOccupied).length,
      tableCards,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if(tab==='PENDING') list = list.filter(o=>o.status===ORDER_STATUS.PENDING);
    if(tab==='WAITING') list = list.filter(o=>o.status===ORDER_STATUS.WAITING_FOR_SHIPPER);
    if(tab==='DELIVERING') list = list.filter(o=>[ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERING].includes(o.status));
    if(tab==='COMPLETED') list = list.filter(o=>o.status===ORDER_STATUS.COMPLETED);
    if(q){
      const k=q.toLowerCase();
      list = list.filter(o=> o.id?.toLowerCase().includes(k) || (o.userName||o.customerName||'').toLowerCase().includes(k) || o.phone?.includes(k));
    }
    return list;
  }, [orders, tab, q]);

  const updateStatus = async (id, st) => { 
    try {
      if (st === ORDER_STATUS.CANCELLED) {
        await cancelOrder(id, 'Admin hủy đơn', 'admin');
      } else {
        await updateOrderStatus(id, st, 'admin'); 
      }
    } catch (error) {
      alert(error.message);
    }
  };
  const assignShip = async (id, sid) => {
    if(!sid) return;
    const ship = shippers.find(s=>s.id===sid);
    await assignOrderToShipper(id, sid, ship?.displayName || 'Shipper', 'admin');
  };

  const markVacatedByAdmin = async (table) => {
    if (!table?.isOccupied || !table?.activeOrder?.id) return;

    const ok = window.confirm(`Xác nhận khách ở ${table.tableName} đã về và bàn chuyển sang trạng thái trống?`);
    if (!ok) return;

    try {
      await markTableVacated(table.activeOrder.id, 'admin');
    } catch (error) {
      alert(error.message || 'Không thể cập nhật trạng thái bàn');
    }
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

      <div className="panel" style={{padding:'16px 20px', marginBottom:18}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
          <span style={{fontWeight:700,fontSize:18}}>Flow quản lý bàn (Admin)</span>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span style={{background:'#ecfdf5',color:'#166534',border:'1px solid #bbf7d0',padding:'6px 10px',borderRadius:999,fontSize:12,fontWeight:700}}>
              Trống: {tableFlow.emptyCount}
            </span>
            <span style={{background:'#fff1f2',color:'#9f1239',border:'1px solid #fecdd3',padding:'6px 10px',borderRadius:999,fontSize:12,fontWeight:700}}>
              Đang có khách: {tableFlow.occupiedCount}
            </span>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:10}}>
          {tableFlow.tableCards.map((table) => (
            <button
              key={table.tableName}
              type="button"
              onClick={() => markVacatedByAdmin(table)}
              disabled={!table.isOccupied}
              title={table.isOccupied ? 'Bấm để xác nhận khách đã về' : 'Bàn đang trống'}
              style={{
                borderRadius:12,
                padding:'10px 8px',
                border: table.isOccupied ? '1px solid #fecdd3' : '1px solid #bbf7d0',
                background: table.isOccupied ? '#fff1f2' : '#f0fdf4',
                color: table.isOccupied ? '#9f1239' : '#166534',
                textAlign:'center',
                fontWeight:700,
                fontSize:13,
                cursor: table.isOccupied ? 'pointer' : 'default',
                opacity: table.isOccupied ? 1 : 0.9,
              }}
            >
              <div>{table.tableName}</div>
              <div style={{fontSize:11,marginTop:4,opacity:.9}}>{table.isOccupied ? 'Có khách • Bấm xác nhận về' : 'Đang trống'}</div>
            </button>
          ))}
        </div>
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
                {['Mã Đơn','Khách Hàng','Tổng Tiền','Trạng Thái','Shipper','Lịch sử trạng thái','Hành Động'].map(h=>(
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
                      {[ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED].includes(order.status)? (
                        <span style={{color:'#64748b',fontSize:13}}>{order.shipperName||'Không có'}</span>
                      ) : (
                        <select value={order.shipperId||''} onChange={e=>assignShip(order.id,e.target.value)} style={{padding:'9px 12px',borderRadius:12,border:'1px solid #e2e8f0',background:'#fff',minWidth:170,fontSize:13,boxShadow:'var(--shadow-soft)',outline:'none',cursor:'pointer'}}>
                          <option value="">-- Chọn Shipper --</option>
                          {shippers.map(s=> <option key={s.id} value={s.id}>{s.displayName||s.email}</option>)}
                        </select>
                      )}
                    </td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9', minWidth: 260}}>
                      <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:120,overflowY:'auto'}}>
                        {(order.statusHistory || []).slice(-3).reverse().map((h, idx) => (
                          <div key={`${order.id}-hist-${idx}`} style={{fontSize:12,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:'6px 8px'}}>
                            <div style={{fontWeight:700,color:'#334155'}}>{h.from || 'START'} → {h.to}</div>
                            <div style={{color:'#64748b'}}>by {h.actor || 'system'} • {h.note || 'Cập nhật trạng thái'}</div>
                            <div style={{color:'#94a3b8'}}>{h.at ? new Date(h.at).toLocaleString('vi-VN') : '—'}</div>
                          </div>
                        ))}
                        {(!order.statusHistory || order.statusHistory.length === 0) && (
                          <div style={{fontSize:12,color:'#94a3b8'}}>Chưa có lịch sử trạng thái</div>
                        )}
                      </div>
                    </td>
                    <td style={{padding:'18px 20px',borderTop:'1px solid #f1f5f9'}}>
                      <div style={{display:'flex',gap:8}}>
                        {[ORDER_STATUS.PENDING, ORDER_STATUS.WAITING_FOR_SHIPPER].includes(order.status) && (
                          <button onClick={()=>updateStatus(order.id, ORDER_STATUS.CONFIRMED)} style={{padding:'8px 14px',borderRadius:10,background:'#fff',border:'1px solid #a7f3d0',color:'#065f46',fontWeight:600,fontSize:13,cursor:'pointer',transition:'.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#ecfdf5'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Xác nhận</button>
                        )}
                        {![ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED].includes(order.status) && (
                          <button onClick={()=>updateStatus(order.id, ORDER_STATUS.CANCELLED)} style={{padding:'8px 14px',borderRadius:10,background:'#fff',border:'1px solid #fecdd3',color:'#be123c',fontWeight:600,fontSize:13,cursor:'pointer',transition:'.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#fff1f2'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Huỷ</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && (
                <tr><td colSpan={7} style={{textAlign:'center',padding:'64px 20px',color:'#94a3b8'}}>
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