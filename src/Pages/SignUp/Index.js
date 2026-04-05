import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { signUp } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (err) {
      console.error('[SignUp Error]', err);
      let message = 'Đăng ký thất bại, vui lòng thử lại!';
      
      // Dịch lỗi Firebase sang tiếng Việt
      if (err.code === 'auth/weak-password') {
        message = 'Mật khẩu quá yếu (tối thiểu 6 ký tự)!';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email này đã được sử dụng cho tài khoản khác!';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ!';
      } else if (err.message?.includes('400')) {
        message = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin!';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Đăng Ký</h2>
              {error && <div className="alert alert-danger p-2 small">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Họ Tên</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Mật Khẩu</label>
                  <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm" disabled={loading}>
                  {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </button>
              </form>
              <p className="text-center mt-3 small">
                Đã có tài khoản? <Link to="/signin" className="fw-bold text-decoration-none">Đăng Nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
