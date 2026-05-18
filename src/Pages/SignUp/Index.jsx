// SignUp/Index.jsx - Màn hình tạo tài khoản mới.
// File này xử lý form đăng ký, validate mật khẩu, đồng ý điều khoản và điều hướng sau khi tạo account.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const { signUp, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự.');
    if (formData.password !== formData.confirm) return setError('Mật khẩu xác nhận không khớp.');
    if (!agree) return setError('Vui lòng đồng ý với Điều khoản & Chính sách.');

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (err) {
      let message = 'Đăng ký thất bại, vui lòng thử lại!';
      if (err.code === 'auth/weak-password') message = 'Mật khẩu quá yếu (tối thiểu 6 ký tự)!';
      else if (err.code === 'auth/email-already-in-use') message = 'Email này đã được sử dụng!';
      else if (err.code === 'auth/invalid-email') message = 'Địa chỉ email không hợp lệ!';
      else if (err.message?.includes('400')) message = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại!';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)',
        padding: '2rem 1rem'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
              <div className="card-body p-4 p-lg-5">
                {/* HEADER */}
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{ width: 64, height: 64, background: '#ffc107', borderRadius: '1rem', boxShadow: '0 8px 20px rgba(255,193,7,0.3)' }}>
                    <span style={{ fontSize: '2rem' }}>🎉</span>
                  </div>
                  <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Tạo tài khoản</h2>
                  <p className="text-muted">Tham gia FoodHub nhận ưu đãi ngay hôm nay</p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center py-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <small>{error}</small>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Họ tên</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-muted" /></span>
                      <input type="text" className="form-control border-start-0 ps-0" name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" required style={{ boxShadow: 'none' }} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Email</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-muted" /></span>
                      <input type="email" className="form-control border-start-0 ps-0" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={{ boxShadow: 'none' }} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Mật khẩu</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock text-muted" /></span>
                      <input type={showPw ? 'text' : 'password'} className="form-control border-start-0 border-end-0 ps-0" name="password" value={formData.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" required style={{ boxShadow: 'none' }} />
                      <button type="button" className="btn btn-light border" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                        <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
                      </button>
                    </div>
                    {/* strength bar */}
                    <div className="d-flex gap-1 mt-2">
                      {[1,2,3].map(i => (
                        <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= pwStrength ? (pwStrength === 1 ? '#dc3545' : pwStrength === 2 ? '#ffc107' : '#198754') : '#e9ecef' }} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Xác nhận mật khẩu</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0"><i className="bi bi-shield-check text-muted" /></span>
                      <input type={showPw ? 'text' : 'password'} className="form-control border-start-0 ps-0" name="confirm" value={formData.confirm} onChange={handleChange} placeholder="Nhập lại mật khẩu" required style={{ boxShadow: 'none' }} />
                    </div>
                  </div>

                  <div className="form-check mb-4">
                    <input id="agree" className="form-check-input" type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
                    <label htmlFor="agree" className="form-check-label small">
                      Tôi đồng ý với <Link to="/terms" style={{ color: '#ff9800', textDecoration: 'none' }}>Điều khoản</Link> & <Link to="/privacy" style={{ color: '#ff9800', textDecoration: 'none' }}>Chính sách</Link>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-warning w-100 fw-bold py-3 shadow-sm" disabled={loading} style={{ borderRadius: '0.75rem', fontSize: '1rem' }}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2" /> Đang tạo tài khoản...</>) : 'Đăng ký miễn phí'}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 small">
                  Đã có tài khoản? <Link to="/signin" className="fw-bold" style={{ color: '#ff9800', textDecoration: 'none' }}>Đăng nhập ngay</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;