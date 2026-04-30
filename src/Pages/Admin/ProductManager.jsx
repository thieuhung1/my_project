import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllCategories
} from '../../services';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const fileInputRef = useRef(null);

  const initForm = {
    name: '',
    description: '',
    price: 0,
    discount: 0,
    category: '',
    imageUrl: '',
    stock: 0,
    featured: false
  };
  const [formData, setFormData] = useState(initForm);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
      if (catData.length &&!formData.category) {
        setFormData(f => ({...f, category: catData[0].slug }));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải dữ liệu sản phẩm hoặc danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => ({
    total: products.length,
    featured: products.filter(p => p.featured).length,
    out: products.filter(p => (p.stock || 0) === 0).length
  }), [products]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
     ...prev,
      [name]: type === 'checkbox'? checked : type === 'number'? Number(value) : value
    }));
  };

  // CHỌN ẢNH TỪ MÁY -> base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Ảnh quá lớn (>3MB). Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setFormData(prev => ({...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({...initForm, category: categories[0]?.slug || '' });
    setShowForm(true);
    clearImage();
  };

  const openEditForm = (prod) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || 0,
      discount: prod.discount || 0,
      category: prod.category || categories[0]?.slug || '',
      imageUrl: prod.imageUrl || '',
      stock: prod.stock || 0,
      featured: prod.featured || false
    });
    setShowForm(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0) {
      alert("Tên và giá không hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        alert("Cập nhật thành công!");
      } else {
        await addProduct(formData);
        alert("Thêm mới thành công!");
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu sản phẩm.");
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xoá sản phẩm "${name}"? Hành động này không thể hoàn tác.`)) {
      setLoading(true);
      try {
        await deleteProduct(id);
        alert("Đã xoá!");
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Lỗi xoá sản phẩm.");
        setLoading(false);
      }
    }
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCat]);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2 text-muted">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="product-manager p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h2 className="fw-bold mb-1" style={{
            background: 'linear-gradient(90deg,#3a49ff,#7a6bff)',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Quản Lý Sản Phẩm
          </h2>
          <div className="text-muted small">Thêm, sửa, quản lý tồn kho và khuyến mãi</div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAddForm}>
            <i className="bi bi-plus-lg" /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Thống kê */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Tổng SP', value: stats.total, icon: 'bi-box', bg: 'linear-gradient(135deg,#8b9aff,#6a5cff)' },
          { label: 'Nổi bật', value: stats.featured, icon: 'bi-star-fill', bg: 'linear-gradient(135deg,#ffb86b,#ff7a00)' },
          { label: 'Hết hàng', value: stats.out, icon: 'bi-exclamation-triangle', bg: 'linear-gradient(135deg,#ff8a8a,#ff5252)' },
        ].map((s, i) => (
          <div className="col-12 col-md-4" key={i}>
            <div className="bg-white rounded-4 shadow-sm p-3 d-flex justify-content-between align-items-center" style={{ height: 96 }}>
              <div>
                <div className="text-secondary" style={{ fontSize: 15 }}>{s.label}</div>
                <div className="fw-bold" style={{ fontSize: 34, lineHeight: 1.1 }}>{s.value}</div>
              </div>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: 52, height: 52, borderRadius: 12, background: s.bg, boxShadow: '0 8px 18px rgba(0,0,0,.12)' }}
              >
                <i className={`bi ${s.icon} fs-5`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 280 }}>
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search" /></span>
          <input
            className="form-control border-start-0"
            placeholder="Tìm tên sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ maxWidth: 200 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="card mb-4 border-0 shadow-lg rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold">{editingId? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h5>
              <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input required className="form-control form-control-lg" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ví dụ: Burger bò phô mai" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select form-select-lg" name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tồn kho</label>
                  <input type="number" min="0" className="form-control form-control-lg" name="stock" value={formData.stock} onChange={handleInputChange} />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Giá gốc (VNĐ) *</label>
                  <input required type="number" min="0" className="form-control" name="price" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-danger fw-semibold">Giảm giá (%)</label>
                  <input type="number" min="0" max="100" className="form-control" name="discount" value={formData.discount} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="feat" name="featured" checked={formData.featured} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="feat">Đánh dấu Nổi bật</label>
                  </div>
                </div>

                <div className="col-md-8">
                  <label className="form-label">Ảnh sản phẩm</label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
                  <div className="form-text">Chọn file JPG/PNG, tối đa 3MB. Ảnh sẽ được lưu kèm sản phẩm.</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Preview</label>
                  <div className="border rounded-3 d-flex align-items-center justify-content-center position-relative" style={{ height: 110, background: '#f8fafc', overflow: 'hidden' }}>
                    {formData.imageUrl? (
                      <>
                        <img src={formData.imageUrl} alt="preview" style={{ maxHeight: '100%', objectFit: 'cover' }} />
                        <button type="button" className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1" onClick={clearImage} title="Xóa ảnh">
                          <i className="bi bi-x" />
                        </button>
                      </>
                    ) : <span className="text-muted small">Chưa chọn ảnh</span>}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows="2" name="description" value={formData.description} onChange={handleInputChange} placeholder="Mô tả ngắn gọn..." />
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-success px-4">
                  <i className="bi bi-check2 me-1" /> {editingId? 'Cập nhật' : 'Lưu'}
                </button>
                <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bảng sản phẩm */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>Ảnh</th>
                <th>Tên SP</th>
                <th>Danh mục</th>
                <th>Giá & Giảm</th>
                <th>Kho</th>
                <th className="text-end" style={{ width: 170 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy sản phẩm</td></tr>
              ) : filtered.map(p => {
                const catName = categories.find(c => c.slug === p.category)?.name || p.category;
                const finalPrice = Math.round((p.price || 0) * (1 - (p.discount || 0) / 100));
                return (
                  <tr key={p.id} className="border-bottom">
                    <td>
                      <img
                        src={p.imageUrl || 'https://via.placeholder.com/56'}
                        alt={p.name}
                        width="56" height="56"
                        style={{ objectFit: 'cover', borderRadius: 12, border: '1px solid #eef2f6' }}
                      />
                    </td>
                    <td>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: 320 }}>{p.description}</div>
                      {p.featured && <span className="badge rounded-pill text-bg-warning mt-1">Nổi bật</span>}
                    </td>
                    <td><span className="badge rounded-pill text-bg-light border">{catName}</span></td>
                    <td>
                      {p.discount > 0? (
                        <div className="d-flex flex-column">
                          <span className="text-decoration-line-through text-muted small">{(p.price || 0).toLocaleString()}đ</span>
                          <span className="fw-bold text-danger">
                            {finalPrice.toLocaleString()}đ <span className="badge text-bg-danger ms-1">-{p.discount}%</span>
                          </span>
                        </div>
                      ) : (
                        <span className="fw-semibold">{(p.price || 0).toLocaleString()}đ</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${p.stock > 0? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {p.stock > 0? `${p.stock} sp` : 'Hết'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditForm(p)}>
                        <i className="bi bi-pencil-square me-1" />Sửa
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id, p.name)}>
                        <i className="bi bi-trash3 me-1" />Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}