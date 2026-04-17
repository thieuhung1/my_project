import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác!';
    case 'auth/too-many-requests':
      return 'Tài khoản tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau!';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ!';
    default:
      return 'Đăng nhập thất bại!';
  }
};

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const { signIn, signInWithGoogle, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
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
      setError(getAuthErrorMessage(err?.code));
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
            <div 
              className="card border-0 shadow-lg"
              style={{ borderRadius: '1.5rem', overflow: 'hidden' }}
            >
              <div className="card-body p-4 p-lg-5">
                {/* HEADER */}
                <div className="text-center mb-4">
                  <div 
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 64, height: 64,
                      background: '#ffc107',
                      borderRadius: '1rem',
                      boxShadow: '0 8px 20px rgba(255,193,7,0.3)'
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>🍔</span>
                  </div>
                  <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Chào mừng trở lại</h2>
                  <p className="text-muted">Đăng nhập FoodHub để tiếp tục đặt món</p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center py-2 mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <small>{error}</small>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Email</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-envelope text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        style={{ boxShadow: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Mật khẩu</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-lock text-muted" />
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        style={{ boxShadow: 'none' }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-light border" 
                        onClick={() => setShowPw(s => !s)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input id="remember" className="form-check-input" type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
                      <label htmlFor="remember" className="form-check-label small">Ghi nhớ tôi</label>
                    </div>
                    <Link to="/forgot" className="small fw-medium text-decoration-none" style={{ color: '#ff9800' }}>
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-warning w-100 fw-bold py-3 shadow-sm" 
                    disabled={loading}
                    style={{ borderRadius: '0.75rem', fontSize: '1rem' }}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" /> Đang đăng nhập...</>
                    ) : (
                      'Đăng nhập'
                    )}
                  </button>
                </form>

                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="px-3 text-muted small text-uppercase">hoặc</span>
                  <hr className="flex-grow-1" />
                </div>

                <button
                  className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{ borderRadius: '0.75rem' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Tiếp tục với Google
                </button>

                <p className="text-center mt-4 mb-0 small">
                  Chưa có tài khoản? <Link to="/signup" className="fw-bold" style={{ color: '#ff9800', textDecoration: 'none' }}>Tạo tài khoản ngay</Link>
                </p>
              </div>
            </div>

            <p className="text-center text-muted small mt-4 px-3">
              Bằng việc tiếp tục, bạn đồng ý với <Link to="/terms" className="text-decoration-none">Điều khoản</Link> & <Link to="/privacy" className="text-decoration-none">Chính sách</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;