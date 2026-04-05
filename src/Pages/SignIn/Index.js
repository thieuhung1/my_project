import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      console.error('[SignIn Error]', err);
      let message = 'Email hoặc mật khẩu không chính xác!';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Email hoặc mật khẩu không chính xác!';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Tài khoản đã bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau!';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ!';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Đăng nhập Google thất bại!');
    }
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Đăng Nhập</h2>
              {error && <div className="alert alert-danger p-2 small">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Mật Khẩu</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>
              </form>
              <div className="text-center my-3">
                <span className="text-muted small">─ Hoặc ─</span>
              </div>
              <button 
                className="btn btn-outline-dark w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                onClick={handleGoogleLogin}
              >
                <i className="bi bi-google text-danger"></i> Đăng nhập với Google
              </button>
              <p className="text-center mt-3 small">
                Chưa có tài khoản? <Link to="/signup" className="fw-bold text-decoration-none">Đăng Ký</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
