import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock signup & auto login
    dispatch({ type: 'LOGIN', payload: formData });
    navigate('/');
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
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Họ Tên</label>
                  <input type="text" className="form-control" name="name" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật Khẩu</label>
                  <input type="password" className="form-control" name="password" onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-warning w-100">Đăng Ký</button>
              </form>
              <p className="text-center mt-3">
                Đã có tài khoản? <Link to="/signin">Đăng Nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
