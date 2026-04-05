import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MyAccount = () => {
  const { userProfile, updateUser, signOut, isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(userProfile || {});
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <div className="container my-5 text-center"><h2>Vui lòng <Link to="/signin">đăng nhập</Link> để xem tài khoản</h2></div>;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(profile);
      setEditMode(false);
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Tài Khoản Của Tôi</h1>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header">
              <h4>Thông Tin Cá Nhân {editMode && '(Chỉnh sửa)'}</h4>
              {!editMode ? (
                <button className="btn btn-warning" onClick={() => setEditMode(true)}>Chỉnh Sửa</button>
              ) : (
                <div>
                  <button className="btn btn-success me-2" onClick={handleSave}>Lưu</button>
                  <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Hủy</button>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-bold">Tên Hiển Thị</label>
                <input className="form-control" name="displayName" value={profile.displayName || ''} 
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})} disabled={!editMode} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email (Không thể đổi)</label>
                <input className="form-control" value={profile.email || ''} disabled={true} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Số Điện Thoại</label>
                <input className="form-control" name="phone" value={profile.phone || ''} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})} disabled={!editMode} />
              </div>
            </div>
          </div>
          <div className="card mt-4 shadow-sm border-0">
            <div className="card-body text-center bg-light rounded">
              <Link to="/orders" className="btn btn-outline-primary me-2">Lịch Sử Đơn Hàng</Link>
              <button className="btn btn-danger" onClick={signOut}>Đăng Xuất</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
