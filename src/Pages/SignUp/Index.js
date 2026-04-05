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

  // Tăng tính ổn định: Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
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

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--border-radius)' }}>
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="display-6">🚀</div>
                <h2 className="fw-bold m-0">Tạo tài khoản</h2>
                <p className="text-muted small m-0">Tham gia FoodHub để nhận ưu đãi!</p>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Họ tên</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-person" /></span>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-envelope" /></span>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Mật khẩu</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-lock" /></span>
                    <input type={showPw ? 'text' : 'password'} className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" required />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                      <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Xác nhận mật khẩu</label>
                  <input type={showPw ? 'text' : 'password'} className="form-control" name="confirm" value={formData.confirm} onChange={handleChange} placeholder="Nhập lại mật khẩu" required />
                </div>

                <div className="form-check mb-3">
                  <input id="agree" className="form-check-input" type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
                  <label htmlFor="agree" className="form-check-label small">
                    Tôi đồng ý với <Link to="/terms">Điều khoản</Link> &amp; <Link to="/privacy">Chính sách</Link>.
                  </label>
                </div>

                <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm" disabled={loading}>
                  {loading ? (<><span className="spinner-border spinner-border-sm me-2" /> Đang đăng ký...</>) : 'Đăng ký'}
                </button>
              </form>

              <p className="text-center mt-3 small m-0">
                Đã có tài khoản? <Link to="/signin" className="fw-bold text-decoration-none">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;