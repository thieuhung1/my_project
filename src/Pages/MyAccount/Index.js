import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MyAccount = () => {
  const { user, dispatch, isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(user || {});

  if (!isAuthenticated) {
    return <div className="container my-5 text-center"><h2>Vui lòng <Link to="/signin">đăng nhập</Link> để xem tài khoản</h2></div>;
  }

  const handleSave = () => {
    dispatch({ type: 'LOGIN', payload: profile });
    setEditMode(false);
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
                <label className="form-label">Tên</label>
                <input className="form-control" value={profile.name || ''} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} disabled={!editMode} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={profile.email || ''} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})} disabled={!editMode} />
              </div>
            </div>
          </div>
          <div className="card mt-4">
            <div className="card-body text-center">
              <Link to="/orders" className="btn btn-info me-2">Đơn Hàng</Link>
              <Link to="/" className="btn btn-secondary" onClick={() => dispatch({type: 'LOGOUT'})}>Đăng Xuất</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
