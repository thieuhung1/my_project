import React, { useState } from 'react';

const Contact = () => {
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: gửi form lên backend
    setSent(true);
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Liên Hệ</h1>
        <p className="text-muted m-0">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {sent && <div className="alert alert-success">Cảm ơn bạn! Tin nhắn đã được gửi.</div>}
              <form onSubmit={onSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Họ tên</label>
                    <input type="text" className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Tin nhắn</label>
                    <textarea className="form-control" rows="5" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-warning mt-3">
                  <i className="bi bi-send me-1" /> Gửi
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Thông tin liên hệ</h5>
              <div className="d-flex align-items-start gap-2 mb-2"><i className="bi bi-telephone mt-1" /><span>1900 1234</span></div>
              <div className="d-flex align-items-start gap-2 mb-2"><i className="bi bi-envelope mt-1" /><span>support@foodhub.vn</span></div>
              <div className="d-flex align-items-start gap-2"><i className="bi bi-geo-alt mt-1" /><span>TP. Vinh, Nghệ An</span></div>
              <hr />
              <div className="ratio ratio-16x9 rounded-3 overflow-hidden">
                <iframe
                  title="map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9!2d105.69!3d18.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVmluaA!5e0!3m2!1svi!2s!4v1710000000000">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;