import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  updateUserRole
} from '../../features/services';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUserRole = async (userId, role) => {
    if (window.confirm(`Bạn có chắc muốn đổi vai trò thành ${role}?`)) {
      try {
        await updateUserRole(userId, role);
        alert("Cập nhật vai trò thành công!");
        fetchUsers();
      } catch (error) {
        console.error(error);
        alert("Lỗi khi cập nhật vai trò.");
      }
    }
  };

  if (loading) return (
    <div className="content">
      <div className="panel" style={{padding:'40px', textAlign:'center', color:'var(--muted)'}}>
        Đang tải...
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString('vi-VN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const getInitials = (name='') => name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

  const roleMap = {
    admin: { text:'Quản Trị', bg:'#fef2f2', color:'#b91c1c', bd:'#fecaca' },
    staff: { text:'Shipper', bg:'#eff6ff', color:'#1d4ed8', bd:'#bfdbfe' },
    waiter: { text:'Bồi bàn', bg:'#ecfeff', color:'#0e7490', bd:'#a5f3fc' },
    customer: { text:'Khách hàng', bg:'#f1f5f9', color:'#475569', bd:'#e2e8f0' }
  };

  return (
    <div className="content">
      <div className="topbar">
        <div>
          <h1>Người Dùng</h1>
          <small style={{textTransform:'capitalize'}}>{today}</small>
        </div>
      </div>

      <div className="panel" style={{padding:0, overflow:'hidden'}}>
        <div className="panel-head" style={{padding:'16px 20px', fontSize:18, fontWeight:700, borderBottom:'1px solid #f1f5f9'}}>
          Quản Lý Người Dùng
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
            <thead>
              <tr style={{background:'linear-gradient(180deg,#fbfdff,#f7f9ff)'}}>
                {['Tài khoản','Email','Vai trò hiện tại','Đổi vai trò'].map(h=>(
                  <th key={h} style={{textAlign:'left', padding:'14px 20px', fontSize:12, textTransform:'uppercase', letterSpacing:.5, color:'#64748b', fontWeight:700, borderBottom:'1px solid #eef2f7'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const roleKey = (user.role || 'customer').toLowerCase();
                const r = roleMap[roleKey] || roleMap.customer; // <-- FIX ở đây
                const name = user.displayName || 'Chưa cập nhật';

                return (
                  <tr key={user.id} style={{transition:'background.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#fcfdff'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'16px 20px', borderTop:'1px solid #f1f5f9'}}>
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        {user.photoURL? (
                          <img src={user.photoURL} alt="avatar" width="40" height="40" style={{borderRadius:'50%', objectFit:'cover', boxShadow:'var(--shadow-soft)'}} />
                        ) : (
                          <div style={{width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue),var(--blue-2))', display:'grid', placeItems:'center', color:'#fff', fontWeight:800, boxShadow:'var(--shadow-soft)'}}>
                            {getInitials(name)}
                          </div>
                        )}
                        <span style={{fontWeight:600, color:'#0f172a'}}>{name}</span>
                      </div>
                    </td>
                    <td style={{padding:'16px 20px', borderTop:'1px solid #f1f5f9', color:'#334155'}}>{user.email || 'Không có email'}</td>
                    <td style={{padding:'16px 20px', borderTop:'1px solid #f1f5f9'}}>
                      <span style={{background:r.bg, color:r.color, border:`1px solid ${r.bd}`, padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:700}}>
                        {r.text}
                      </span>
                    </td>
                    <td style={{padding:'16px 20px', borderTop:'1px solid #f1f5f9'}}>
                      <select
                        value={user.role || 'customer'}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        style={{padding:'9px 12px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', minWidth:180, fontSize:13, boxShadow:'var(--shadow-soft)', outline:'none', cursor:'pointer'}}
                      >
                        <option value="customer">Khách Hàng</option>
                        <option value="staff">Shipper</option>
                        <option value="waiter">Bồi bàn</option>
                        <option value="admin">Quản Trị (Admin)</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}