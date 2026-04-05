import React, { useState, useEffect } from 'react';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  PRODUCT_CATEGORIES
} from '../../backend';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Dữ liệu form
  const initForm = {
    name: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'burger',
    imageUrl: '',
    stock: 0,
    featured: false
  };
  const [formData, setFormData] = useState(initForm);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initForm);
    setShowForm(true);
  };

  const openEditForm = (prod) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || 0,
      discount: prod.discount || 0,
      category: prod.category || 'other',
      imageUrl: prod.imageUrl || '',
      stock: prod.stock || 0,
      featured: prod.featured || false
    });
    setShowForm(true);
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
      fetchProducts();
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
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("Lỗi xoá sản phẩm.");
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="product-manager p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fs-4 fw-bold">Quản Lý Sản Phẩm</h2>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Thêm Sản Phẩm Mới
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">{editingId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input required type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" name="category" value={formData.category} onChange={handleInputChange}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Giá gốc (VNĐ) *</label>
                  <input required type="number" min="0" className="form-control" name="price" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-danger fw-bold">Giảm giá (%)</label>
                  <input type="number" min="0" max="100" className="form-control border-danger" name="discount" value={formData.discount} onChange={handleInputChange} placeholder="0-100" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tồn kho</label>
                  <input type="number" min="0" className="form-control" name="stock" value={formData.stock} onChange={handleInputChange} />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" name="featured" id="featId" checked={formData.featured} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="featId">Sản phẩm Nổi Bật</label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Hình ảnh URL</label>
                  <input type="text" className="form-control" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                </div>
                <div className="col-12">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows="2" name="description" value={formData.description} onChange={handleInputChange}></textarea>
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-success me-2">{editingId ? 'Cập Nhật' : 'Lưu Sản Phẩm'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Ảnh</th>
                <th>Tên SP</th>
                <th>Danh mục</th>
                <th>Giá & Giảm Giá</th>
                <th>Kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-3">Chưa có sản phẩm nào.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.imageUrl || 'https://via.placeholder.com/50'} alt="sp" width="50" height="50" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                    </td>
                    <td>
                      <span className="fw-semibold">{p.name}</span>
                      {p.featured && <span className="badge bg-warning ms-2">Nổi bật</span>}
                    </td>
                    <td><span className="badge bg-secondary">{p.category}</span></td>
                    <td>
                      {p.discount > 0 ? (
                        <>
                          <span className="text-decoration-line-through text-muted small me-2">{p.price.toLocaleString()}đ</span>
                          <span className="text-danger fw-bold">{Math.round(p.price * (1 - p.discount / 100)).toLocaleString()}đ</span>
                          <span className="badge bg-danger ms-1">-{p.discount}%</span>
                        </>
                      ) : (
                        <span className="fw-bold">{p.price.toLocaleString()}đ</span>
                      )}
                    </td>
                    <td>{p.stock}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditForm(p)}>Sửa</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id, p.name)}>Xoá</button>
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