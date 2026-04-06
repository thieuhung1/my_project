import React, { useState, useEffect } from 'react';
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../backend';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const initForm = {
    name: '',
    slug: '',
    icon: '🍽️',
    order: 0,
    active: true,
  };

  const [formData, setFormData] = useState(initForm);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      };
      
      // Auto-generate slug nếu người dùng nhập name (chỉ khi thêm mới hoặc sửa mà chưa có slug)
      if (name === 'name' && !editingId) {
         updated.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      return updated;
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({...initForm, order: categories.length + 1});
    setShowForm(true);
  };

  const openEditForm = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      icon: cat.icon || '',
      order: cat.order || 0,
      active: cat.active !== undefined ? cat.active : true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Tên và Slug không hợp lệ.");
      return;
    }
    
    setLoading(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        alert("Cập nhật danh mục thành công!");
      } else {
        await addCategory(formData);
        alert("Đã thêm danh mục!");
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu danh mục.");
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xoá danh mục "${name}"?`)) {
      setLoading(true);
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xoá danh mục.");
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="p-4 text-center text-muted">Đang tải...</div>;

  return (
    <div className="category-manager p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fs-4 fw-bold" style={{color: 'var(--blue)'}}>Quản Lý Danh Mục</h2>
        <button className="btn btn-primary px-4 py-2" onClick={openAddForm} style={{borderRadius: '12px'}}>
          <i className="bi bi-plus-lg me-2"></i>Thêm Danh Mục
        </button>
      </div>

      {showForm && (
        <div className="panel mb-4">
          <h5 className="mb-3 fw-bold">{editingId ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tên *</label>
                <input required type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: Đồ uống" />
              </div>
              
              <div className="col-md-4">
                <label className="form-label fw-semibold">Slug (Đường dẫn) *</label>
                <input required type="text" className="form-control" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="VD: do-uong" />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Icon / Emoji</label>
                <input type="text" className="form-control" name="icon" value={formData.icon} onChange={handleInputChange} placeholder="🧋" />
                <div className="mt-2 d-flex flex-wrap gap-1">
                  {['🍜','🍚','🥖','🥟','🍲','🧋','🍮','🍱','🍵','🥢'].map(ic => (
                    <span 
                      key={ic} 
                      style={{cursor: 'pointer', fontSize: '1.2rem', padding: '2px'}} 
                      onClick={() => setFormData({...formData, icon: ic})}
                      title="Chọn icon"
                    >
                      {ic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">Thứ tự hiển thị</label>
                <input type="number" min="1" className="form-control" name="order" value={formData.order} onChange={handleInputChange} />
              </div>

              <div className="col-12 d-flex align-items-center mt-4">
                <div className="form-check form-switch me-4 fs-5">
                  <input className="form-check-input bg-success border-success" type="checkbox" role="switch" name="active" id="activeSwitch" checked={formData.active} onChange={handleInputChange} />
                  <label className="form-check-label fs-6 fw-semibold text-success ms-2" htmlFor="activeSwitch">Đang hoạt động</label>
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

      {/* Danh sách */}
      <div className="panel p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{background: 'var(--track)', color: 'var(--muted)'}}>
              <tr>
                <th className="py-3 ps-4" style={{width: '10%'}}>Icon</th>
                <th style={{width: '30%'}}>Tên Danh Mục</th>
                <th style={{width: '20%'}}>Đường Dẫn (Slug)</th>
                <th className="text-center" style={{width: '15%'}}>Thứ Tự</th>
                <th className="text-center" style={{width: '10%'}}>H.Động</th>
                <th className="text-end pe-4" style={{width: '15%'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-center">Chưa có danh mục nào.</td></tr>
              ) : (
                categories.sort((a,b) => a.order - b.order).map((cat) => (
                  <tr key={cat.id}>
                    <td className="ps-4 fs-3">{cat.icon}</td>
                    <td className="fw-bold text-dark">{cat.name}</td>
                    <td className="text-muted"><kbd className="bg-light text-secondary border">{cat.slug}</kbd></td>
                    <td className="text-center fw-semibold text-primary">{cat.order}</td>
                    <td className="text-center">
                      {cat.active ? (
                        <span className="badge rounded-pill bg-success px-3">Bật</span>
                      ) : (
                        <span className="badge rounded-pill bg-secondary px-3">Tắt</span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <button className="icon-btn bg-white text-primary border me-2 shadow-none p-2" onClick={() => openEditForm(cat)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="icon-btn bg-white text-danger border shadow-none p-2" onClick={() => handleDelete(cat.id, cat.name)}>
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
