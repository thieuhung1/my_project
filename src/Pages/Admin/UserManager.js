import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  updateUserRole
} from '../../backend';

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

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="user-manager p-4">
      <h2 className="mb-4 fs-4 fw-bold">Quản Lý Người Dùng</h2>
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Vai trò hiện tại</th>
                <th>Đổi vai trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={user.photoURL || 'https://via.placeholder.com/40'}
                        alt="avatar"
                        className="rounded-circle me-2 shadow-sm"
                        width="40" height="40"
                        style={{ objectFit: 'cover' }}
                      />
                      <span className="fw-semibold">{user.displayName || 'Chưa cập nhật'}</span>
                    </div>
                  </td>
                  <td>{user.email || 'Không có email'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'staff' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                      {user.role === 'admin' ? 'Quản Trị' : user.role === 'staff' ? 'Shipper' : 'Khách hàng'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={user.role || 'customer'}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                    >
                      <option value="customer">Khách Hàng</option>
                      <option value="staff">Shipper (Staff)</option>
                      <option value="admin">Quản Trị (Admin)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}