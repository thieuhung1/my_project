import React from 'react';

const Contact = () => {
  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Liên Hệ</h1>
      <div className="row">
        <div className="col-md-8">
          <form>
            <div className="mb-3">
              <label className="form-label">Họ Tên</label>
              <input type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Tin Nhắn</label>
              <textarea className="form-control" rows="5" required></textarea>
            </div>
            <button type="submit" className="btn btn-warning">Gửi</button>
          </form>
        </div>
        <div className="col-md-4">
          <h5>Thông Tin Liên Hệ</h5>
          <p><i className="bi bi-telephone"></i> 0123 456 789</p>
          <p><i className="bi bi-envelope"></i> support@foodhub.vn</p>
          <p><i className="bi bi-geo-alt"></i> Hà Nội, Việt Nam</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
