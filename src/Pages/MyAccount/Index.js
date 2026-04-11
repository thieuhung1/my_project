import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MyAccount = () => {
  const { userProfile, updateUser, signOut, isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(userProfile || {});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { setProfile(userProfile || {}); }, [userProfile]);

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

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(p => ({ ...p, photoURL: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1 className="fw-bold mb-4">Tài khoản của tôi</h1>
      <div className="row justify-content-center g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4">
              <div className="position-relative d-inline-block">
                <img
                  src={profile.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.displayName || 'User') + '&background=FFE0CC&color=E55A2B'}
                  alt="avatar"
                  className="rounded-circle shadow-sm"
                  style={{ width: 120, height: 120, objectFit: 'cover' }}
                />
                <button className="btn btn-sm btn-light position-absolute bottom-0 end-0 border" onClick={onPickFile} title="Đổi ảnh">
                  <i className="bi bi-camera" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={onFileChange} />
              </div>
              <h5 className="mt-3 mb-0">{profile.displayName || 'Thành viên'}</h5>
              <div className="text-muted small">{profile.email}</div>
            </div>
          </div>
          <div className="card mt-3 border-0 shadow-sm">
            <div className="card-body d-grid gap-2">
              <button className="btn btn-danger" onClick={signOut}><i className="bi bi-box-arrow-right me-2" /> Đăng xuất</button>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <h5 className="m-0">Thông tin cá nhân {editMode && <span className="text-muted">(chỉnh sửa)</span>}</h5>
              {!editMode ? (
                <button className="btn btn-warning btn-sm" onClick={() => setEditMode(true)}><i className="bi bi-pencil me-1" /> Chỉnh sửa</button>
              ) : (
                <div className="d-flex gap-2">
                  <button className="btn btn-success btn-sm" onClick={handleSave} disabled={loading}>
                    {loading ? 'Đang lưu...' : (<><i className="bi bi-check2 me-1" /> Lưu</>)}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(false); setProfile(userProfile || {}); }}>Hủy</button>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Tên hiển thị</label>
                  <input className="form-control" value={profile.displayName || ''} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} disabled={!editMode} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email (không đổi)</label>
                  <input className="form-control" value={profile.email || ''} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Số điện thoại</label>
                  <input className="form-control" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!editMode} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Địa chỉ</label>
                  <input className="form-control" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={!editMode} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;