import React, { useState, useEffect } from 'react';
import {
  getAllCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from '../../backend';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const initForm = {
    code: '',
    discountType: 'percent', // 'percent' hoặc 'fixed'
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,  // chỉ dùng nếu type là percent
    validUntil: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initForm);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách mã giảm giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initForm);
    setShowForm(true);
  };

  const openEditForm = (cp) => {
    setEditingId(cp.id);
    
    // Convert Firestore Timestamp (mặc dù Coupon lấy string date tùy setup)
    // Giả định validUntil đang lưu dạng yyyy-mm-dd
    setFormData({
      code: cp.code || '',
      discountType: cp.discountType || 'percent',
      discountValue: cp.discountValue || 0,
      minOrderValue: cp.minOrderValue || 0,
      maxDiscount: cp.maxDiscount || 0,
      validUntil: cp.validUntil || '',
      isActive: cp.isActive !== undefined ? cp.isActive : true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || formData.discountValue <= 0) {
      alert("Vui lòng nhập mã hợp lệ và mức giảm lớn hơn 0.");
      return;
    }
    
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        code: formData.code.toUpperCase()
      };

      if (editingId) {
        await updateCoupon(editingId, dataToSave);
        alert("Cập nhật mã giảm giá thành công!");
      } else {
        await addCoupon(dataToSave);
        alert("Đã thêm mã mới!");
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu mã giảm giá.");
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Bạn có chắc muốn xoá mã ${code}? Dữ liệu sẽ mất vĩnh viễn.`)) {
      setLoading(true);
      try {
        await deleteCoupon(id);
        fetchCoupons();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xoá mã.");
        setLoading(false);
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCouponStatus(id);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Chuyển trạng thái thất bại.");
    }
  };

  if (loading) return <div className="p-4 text-center text-muted">Đang tải...</div>;

  return (
    <div className="coupon-manager p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fs-4 fw-bold" style={{color: 'var(--blue)'}}>Quản Lý Khuyến Mãi</h2>
        <button className="btn btn-primary px-4 py-2" onClick={openAddForm} style={{borderRadius: '12px'}}>
          <i className="bi bi-plus-lg me-2"></i>Thêm Mã Mới
        </button>
      </div>

      {showForm && (
        <div className="panel mb-4">
          <h5 className="mb-3 fw-bold">{editingId ? 'Sửa Mã: ' + formData.code : 'Tạo Mã Mới'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Mã Coupon *</label>
                <input required type="text" className="form-control" name="code" value={formData.code} onChange={handleInputChange} style={{textTransform: 'uppercase'}} placeholder="VD: TET2025" />
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">Loại giảm</label>
                <select className="form-select" name="discountType" value={formData.discountType} onChange={handleInputChange}>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Tiền mặt (VNĐ)</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold text-danger">Giá trị giảm *</label>
                <input required type="number" min="1" className="form-control" name="discountValue" value={formData.discountValue} onChange={handleInputChange} placeholder={formData.discountType==='percent' ? '10' : '50000'} />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Đơn tối thiểu (VNĐ)</label>
                <input type="number" min="0" className="form-control" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} />
              </div>

              {formData.discountType === 'percent' && (
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Giảm tối đa (VNĐ)</label>
                  <input type="number" min="0" className="form-control" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} placeholder="Không giới hạn nếu bỏ trống" />
                </div>
              )}

              <div className="col-md-4">
                <label className="form-label fw-semibold">Hạn sử dụng</label>
                <input type="date" className="form-control" name="validUntil" value={formData.validUntil} onChange={handleInputChange} />
              </div>

              <div className="col-12 d-flex align-items-center mt-4">
                <div className="form-check form-switch me-4 fs-5">
                  <input className="form-check-input bg-success border-success" type="checkbox" role="switch" name="isActive" id="flexSwitchCheckDefault" checked={formData.isActive} onChange={handleInputChange} />
                  <label className="form-check-label fs-6 fw-semibold text-success ms-2" htmlFor="flexSwitchCheckDefault">Hiệu lực ngay</label>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-success px-4 bg-gradient me-2 shadow-sm rounded-pill">
                <i className="bi bi-device-hdd me-2"></i> {editingId ? 'Cập Nhật' : 'Lưu Lại'}
              </button>
              <button type="button" className="btn btn-light px-4 rounded-pill text-muted fw-semibold" onClick={() => setShowForm(false)}>Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Table danh sách mã */}
      <div className="panel p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead style={{background: 'var(--track)', color: 'var(--muted)'}}>
              <tr>
                <th className="py-3 text-start ps-4">Mã Coupon</th>
                <th>Giảm giá</th>
                <th>Đơn tối thiểu</th>
                <th>Hạn Mức</th>
                <th>Hiệu lực</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan="6" className="py-4">Chưa có mã giảm giá nào.</td></tr>
              ) : (
                coupons.map((cp) => (
                  <tr key={cp.id}>
                    <td className="text-start ps-4">
                      <span className="fw-bold d-inline-block px-3 py-1 rounded" style={{background: '#fef2f2', color: '#ef4444', border: '1px dashed #fca5a5', letterSpacing: '2px'}}>
                        {cp.code}
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      {cp.discountType === 'percent' ? `-${cp.discountValue}%` : `-${cp.discountValue.toLocaleString()}đ`}
                    </td>
                    <td className="text-muted">{cp.minOrderValue > 0 ? `${cp.minOrderValue.toLocaleString()}đ` : 'Mọi đơn'}</td>
                    <td className="text-muted small">
                      {cp.validUntil ? new Date(cp.validUntil).toLocaleDateString("vi-VN") : 'Vĩnh viễn'}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggle(cp.id)}
                        className={`btn btn-sm rounded-pill fw-semibold ${cp.isActive ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                        style={{width: '90px'}}
                      >
                        {cp.isActive ? 'Đang bật' : 'Đã tắt'}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn bg-white text-primary border me-2 shadow-none p-2" onClick={() => openEditForm(cp)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="icon-btn bg-white text-danger border shadow-none p-2" onClick={() => handleDelete(cp.id, cp.code)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
