import React, { useMemo, useState, useEffect } from 'react';
import { sendSupportMessage } from '../../backend/services/supportChatService';
import { useAuth } from '../../contexts/AuthContext';
import { serverTimestamp } from 'firebase/database';

const getAnonymousChatId = () => {
  const saved = localStorage.getItem('anon_chat_id');
  if (saved) return saved;
  const nextId = `anon-${Math.random().toString(36).substring(7)}`;
  localStorage.setItem('anon_chat_id', nextId);
  return nextId;
};

const Contact = () => {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const chatId = useMemo(() => (user ? user.uid : getAnonymousChatId()), [user]);
  const topics = ['Đơn hàng', 'Hoàn tiền', 'Đối tác nhà hàng', 'Khác'];

  useEffect(() => {
    if (user) {
      setFormData(f => ({ ...f, name: user.displayName || '', email: user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => setSent(false), 4000);
      return () => clearTimeout(t);
    }
  }, [sent]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (formData.message.trim().length < 10) {
      setError('Vui lòng nhập ít nhất 10 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendSupportMessage(chatId, {
        text: `[Liên hệ] Họ tên: ${formData.name}\nEmail: ${formData.email}\nNội dung: ${formData.message}`,
        userId: user?.uid || chatId,
        userName: formData.name || user?.displayName || 'Khách',
        direction: 'user',
        timestamp: serverTimestamp()
      });
      setSent(true);
      setFormData({ name: user?.displayName || '', email: user?.email || '', message: '' });
    } catch (err) {
      setError('Gửi thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: 'bi-telephone-fill', label: 'Hotline', value: '1900 1234' },
    { icon: 'bi-envelope-fill', label: 'Email', value: 'support@foodhub.vn' },
    { icon: 'bi-geo-alt-fill', label: 'Địa chỉ', value: 'TP. Vinh, Nghệ An' },
  ];

  return (
    <div className="container my-5 fade-in-up">
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 pulse-slow" style={{width:64, height:64, background:'var(--light-orange)'}}>
          <i className="bi bi-chat-heart-fill fs-3" style={{color:'var(--primary-orange)'}}></i>
        </div>
        <h1 className="fw-bold text-gradient-orange mb-2" style={{fontFamily:'Roboto Condensed, sans-serif'}}>
          Liên Hệ FoodHub
        </h1>
        <p className="text-muted mb-1">Chúng tôi phản hồi trong 5 phút, 7:00 - 22:00</p>
        <span className="badge badge-gradient rounded-pill px-3 py-2">Đang online</span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              {sent && (
                <div className="alert alert-success d-flex align-items-center slide-in-right" style={{borderRadius:'12px'}}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Cảm ơn bạn! Tin nhắn đã được gửi, chúng tôi sẽ liên hệ sớm.
                </div>
              )}
              {error && (
                <div className="alert alert-danger d-flex align-items-center" style={{borderRadius:'12px'}} id="form-error">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                </div>
              )}

              <div className="mb-4">
                <small className="text-muted fw-semibold">Chủ đề nhanh:</small>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {topics.map(t => (
                    <button key={t} type="button" className="btn btn-sm rounded-pill" style={{background:'var(--light-orange)', color:'var(--dark-orange)'}}
                      onClick={() => setFormData({...formData, message: `[${t}] ` + formData.message})}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={onSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-semibold">Họ tên</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white" style={{borderRadius:'12px 0 0 12px', borderRight:0}}>
                        <i className="bi bi-person" style={{color:'var(--primary-orange)'}}></i>
                      </span>
                      <input id="name" type="text" className="form-control" style={{borderRadius:'0 12px 12px 0', borderLeft:0}} required placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold">Email</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white" style={{borderRadius:'12px 0 0 12px', borderRight:0}}>
                        <i className="bi bi-envelope" style={{color:'var(--primary-orange)'}}></i>
                      </span>
                      <input id="email" type="email" className="form-control" style={{borderRadius:'0 12px 12px 0', borderLeft:0}} required placeholder="ban@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="message" className="form-label fw-semibold d-flex justify-content-between">
                      <span>Tin nhắn</span>
                      <small className="text-muted">{formData.message.length}/500</small>
                    </label>
                    <textarea id="message" className="form-control" style={{borderRadius:'12px'}} rows="5" required maxLength={500} placeholder="Bạn cần hỗ trợ về đơn hàng, hoàn tiền..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}/>
                  </div>
                </div>
                <button type="submit" className="btn btn-warning btn-ripple text-white btn-lg rounded-pill px-5 mt-4 shadow-orange" disabled={loading || formData.message.length < 10} aria-describedby={error ? 'form-error' : undefined}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</> : <><i className="bi bi-send-fill me-2"/>Gửi liên hệ</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 slide-in-right">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Thông tin liên hệ</h5>
              {contactItems.map(item => (
                <div key={item.label} className="d-flex align-items-center gap-3 mb-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{width:44, height:44, background:'var(--light-orange)'}}>
                    <i className={`bi ${item.icon}`} style={{color:'var(--primary-orange)'}}></i>
                  </div>
                  <div>
                    <div className="small text-muted">{item.label}</div>
                    <div className="fw-semibold">{item.value}</div>
                  </div>
                </div>
              ))}

              <div className="d-flex gap-2 my-3">
                <a href="#" className="btn btn-sm rounded-circle" style={{width:36, height:36, background:'var(--light-orange)', color:'var(--primary-orange)'}}><i className="bi bi-facebook"></i></a>
                <a href="#" className="btn btn-sm rounded-circle" style={{width:36, height:36, background:'var(--light-orange)', color:'var(--primary-orange)'}}><i className="bi bi-tiktok"></i></a>
                <a href="#" className="btn btn-sm rounded-circle" style={{width:36, height:36, background:'var(--light-orange)', color:'var(--primary-orange)'}}><i className="bi bi-chat-dots"></i></a>
              </div>

              <hr className="my-4" />

              <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
                <iframe title="FoodHub Vinh" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.8!2d105.68!3d18.67!2m3!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3139cde0!2sVinh!5e0!3m2!1svi!2s!4v1710000000000" style={{border:0}}/>
              </div>
              <div className="mt-3 text-center">
                <small className="text-muted"><i className="bi bi-clock me-1"></i>Mở cửa: 7:00 - 22:00 hàng ngày</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 