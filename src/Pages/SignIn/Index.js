import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const { signIn, signInWithGoogle, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // BẮT BUỘC: Tự động chuyển hướng về trang chủ sau khi đăng nhập Google thành công
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password, { remember });
      navigate('/');
    } catch (err) {
      let message = 'Email hoặc mật khẩu không chính xác!';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Email hoặc mật khẩu không chính xác!';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Tài khoản tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau!';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ!';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch {
      setError('Đăng nhập Google thất bại!');
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
                <h2 className="fw-bold m-0">Đăng nhập</h2>
                <p className="text-muted small m-0">Chào mừng trở lại FoodHub!</p>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-envelope" /></span>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold">Mật khẩu</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><i className="bi bi-lock" /></span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                      <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input id="remember" className="form-check-input" type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
                    <label htmlFor="remember" className="form-check-label small">Ghi nhớ đăng nhập</label>
                  </div>
                  <Link to="/forgot" className="small text-decoration-none">Quên mật khẩu?</Link>
                </div>

                <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm" disabled={loading}>
                  {loading ? (<><span className="spinner-border spinner-border-sm me-2" /> Đang xử lý...</>) : 'Đăng nhập'}
                </button>
              </form>

              <div className="text-center my-3"><span className="text-muted small">— hoặc —</span></div>

              <button
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <i className="bi bi-google text-danger" /> Đăng nhập với Google
              </button>

              <p className="text-center mt-3 small m-0">
                Chưa có tài khoản? <Link to="/signup" className="fw-bold text-decoration-none">Đăng ký</Link>
              </p>
            </div>
          </div>
          <p className="text-center text-muted small mt-3">
            Bằng việc tiếp tục, bạn đồng ý với <Link to="/terms">Điều khoản</Link> &amp; <Link to="/privacy">Chính sách</Link> của FoodHub.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;