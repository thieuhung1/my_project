import React from 'react';

// --- DỮ LIỆU ---
const ABOUT_HERO = 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop';
const STORY_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';
const TEAM_IMG = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop';
const PLACEHOLDER = '/ASSETS/Images/placeholder.jpg';

const HIGHLIGHTS = [
  'Giao hàng siêu tốc 30 phút trong nội thành',
  'Hơn 10.000 món ăn Việt và quốc tế',
  'Giá minh bạch, ưu đãi mỗi ngày',
  'Ứng dụng thân thiện, hỗ trợ 24/7',
];

const VALUES = [
  { icon: 'bi-lightning-charge-fill', title: 'Tốc độ', desc: 'Tối ưu tuyến đường và bếp đối tác để món ăn đến tay bạn còn nóng.' },
  { icon: 'bi-shield-check', title: 'Tin cậy', desc: 'Kiểm duyệt nhà hàng, đánh giá thật, hoàn tiền nếu sai món.' },
  { icon: 'bi-heart-fill', title: 'Tận tâm', desc: 'CSKH người thật, phản hồi trong 2 phút, đồng hành đến miếng cuối.' },
  { icon: 'bi-globe2', title: 'Bền vững', desc: 'Tối ưu bao bì, khuyến khích tài xế xanh và đơn hàng gộp thông minh.' },
];

const STATS = [
  { value: '2M+', label: 'Người dùng hoạt động' },
  { value: '35k+', label: 'Đối tác nhà hàng' },
  { value: '28', label: 'Tỉnh thành phủ sóng' },
  { value: '4.8/5', label: 'Điểm hài lòng trung bình' },
];

const TIMELINE = [
  { year: '2021', text: 'Khởi đầu tại TP.HCM với 50 quán ăn địa phương.' },
  { year: '2022', text: 'Ra mắt FoodHub Pro cho quán, tối ưu thời gian chuẩn bị món.' },
  { year: '2023', text: 'Mở rộng Hà Nội, Đà Nẵng. Đạt 1 triệu đơn đầu tiên.' },
  { year: '2024', text: 'Tích hợp AI gợi ý món ăn cá nhân hóa.' },
  { year: '2025', text: 'Ra mắt giao hàng xanh và bao bì tái chế.' },
];

const STEPS = [
  { icon: 'bi-search', title: 'Chọn món', desc: 'Tìm theo vị, giá, khoảng cách hoặc AI gợi ý.' },
  { icon: 'bi-bag-check', title: 'Đặt & thanh toán', desc: 'Ví điện tử, thẻ, COD đều an toàn.' },
  { icon: 'bi-fire', title: 'Bếp chuẩn bị', desc: 'Nhà hàng nhận đơn tức thì, cập nhật thời gian thực.' },
  { icon: 'bi-bicycle', title: 'Giao siêu tốc', desc: 'Tài xế gần nhất nhận đơn, theo dõi live trên bản đồ.' },
];

const handleImageError = (e) => { e.currentTarget.src = PLACEHOLDER; };

const About = () => {
  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      {/* HERO */}
      <div className="text-center mb-5">
        <span className="badge badge-gradient rounded-pill px-3 py-2 mb-3">Về FoodHub</span>
        <h1 className="fw-bold display-5">
          Đồ ăn ngon, <span className="text-gradient-orange">đến nhanh hơn</span> bạn nghĩ
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: 720 }}>
          FoodHub là nền tảng giao đồ ăn được xây dựng tại Việt Nam, kết nối hàng chục nghìn nhà hàng với hàng triệu thực khách bằng công nghệ định tuyến thông minh và trải nghiệm một chạm.
        </p>
      </div>

      <div className="ratio ratio-21x9 rounded-4 overflow-hidden shadow-orange mb-5">
        <img src={ABOUT_HERO} alt="FoodHub hero" className="w-100 h-100 object-fit-cover" loading="lazy" onError={handleImageError} />
      </div>

      {/* HIGHLIGHTS + SỨ MỆNH */}
      <div className="row g-5 align-items-center mb-5">
        <div className="col-lg-6">
          <h3 className="fw-bold mb-3">Sứ mệnh của chúng tôi</h3>
          <p className="text-muted">
            Chúng tôi tin một bữa ăn ngon không chỉ no bụng mà còn tiết kiệm thời gian cho bạn sống trọn vẹn hơn. FoodHub tối ưu từng phút: từ lúc bạn mở app, chọn món, đến khi tài xế gõ cửa.
          </p>
          <ul className="list-unstyled d-grid gap-2 mt-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="d-flex align-items-start gap-2">
                <i className="bi bi-check-circle-fill text-success mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">Tầm nhìn 2030</h5>
            <p className="text-muted mb-0">
              Trở thành nền tảng ẩm thực số 1 Đông Nam Á, nơi mọi người có thể khám phá hương vị địa phương, đặt món trong 10 giây và nhận hàng trong 20 phút ở các đô thị lớn, với dấu chân carbon thấp nhất ngành.
            </p>
          </div>
        </div>
      </div>

      {/* CON SỐ */}
      <div className="row g-3 text-center mb-5">
        {STATS.map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className="card h-100 py-4 fade-in-up">
              <div className="display-6 fw-bold text-gradient-orange">{s.value}</div>
              <div className="text-muted small mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CÂU CHUYỆN */}
      <div className="row g-5 align-items-center mb-5">
        <div className="col-md-6 order-md-2">
          <div className="ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
            <img src={STORY_IMG} alt="Câu chuyện FoodHub" className="w-100 h-100 object-fit-cover" onError={handleImageError} />
          </div>
        </div>
        <div className="col-md-6">
          <h3 className="fw-bold mb-3">Câu chuyện bắt đầu từ một cơn đói lúc 11h đêm</h3>
          <p className="text-muted">
            Năm 2021, ba kỹ sư ở Sài Gòn không tìm được quán phở nào còn mở. Họ tự hỏi: tại sao đặt xe thì 3 phút có, còn đặt đồ ăn thì không? FoodHub ra đời để giải bài toán tốc độ, minh bạch và trải nghiệm.
          </p>
          <div className="mt-4">
            {TIMELINE.map((t) => (
              <div key={t.year} className="d-flex gap-3 mb-3">
                <div className="fw-bold text-gradient-orange" style={{ width: 60 }}>{t.year}</div>
                <div className="text-muted">{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GIÁ TRỊ */}
      <div className="mb-5">
        <h3 className="fw-bold text-center mb-4">Giá trị cốt lõi</h3>
        <div className="row g-4">
          {VALUES.map((v) => (
            <div className="col-md-6 col-lg-3" key={v.title}>
              <div className="card h-100 p-4 text-center">
                <i className={`bi ${v.icon} fs-1 text-gradient-orange mb-3`} />
                <h6 className="fw-bold">{v.title}</h6>
                <p className="text-muted small mb-0">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUY TRÌNH */}
      <div className="mb-5">
        <h3 className="fw-bold text-center mb-4">Đặt món chỉ 4 bước</h3>
        <div className="row g-4">
          {STEPS.map((s, i) => (
            <div className="col-md-6 col-lg-3" key={s.title}>
              <div className="card h-100 p-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <span className="badge rounded-circle badge-gradient" style={{ width: 32, height: 32, lineHeight: '22px' }}>{i + 1}</span>
                  <i className={`bi ${s.icon} fs-4 text-gradient-orange`} />
                </div>
                <h6 className="fw-bold">{s.title}</h6>
                <p className="text-muted small mb-0">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ĐỘI NGŨ */}
      <div className="row g-5 align-items-center mb-5">
        <div className="col-md-6">
          <div className="ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
            <img src={TEAM_IMG} alt="Đội ngũ FoodHub" className="w-100 h-100 object-fit-cover" onError={handleImageError} />
          </div>
        </div>
        <div className="col-md-6">
          <h3 className="fw-bold mb-3">Con người đứng sau FoodHub</h3>
          <p className="text-muted">
            Chúng tôi là tập hợp của đầu bếp công nghệ, chuyên gia logistics, và những người yêu đồ ăn. Mỗi tuần, đội ngũ thử hơn 100 món mới để đảm bảo chất lượng đối tác.
          </p>
          <ul className="text-muted">
            <li>Chính sách minh bạch đánh giá: không xóa review xấu.</li>
            <li>Đào tạo an toàn thực phẩm miễn phí cho đối tác.</li>
            <li>Quỹ hỗ trợ quán nhỏ chuyển đổi số.</li>
          </ul>
        </div>
      </div>

      {/* CAM KẾT */}
      <div className="card border-0 shadow-md p-4 p-md-5 mb-5" style={{ background: 'linear-gradient(135deg, #fff7f2, #ffffff)' }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h4 className="fw-bold mb-2">Cam kết FoodHub</h4>
            <p className="text-muted mb-0">
              Giao trễ, chúng tôi tặng voucher. Sai món, hoàn tiền 100%. Bạn chỉ cần lo chọn món ngon, phần còn lại để FoodHub.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <a href="/download" className="btn btn-warning btn-lg shadow-orange">
              <i className="bi bi-phone me-2" /> Tải ứng dụng
            </a>
          </div>
        </div>
      </div>

      {/* FAQ NGẮN */}
      <div className="mb-5">
        <h3 className="fw-bold text-center mb-4">Câu hỏi thường gặp</h3>
        <div className="accordion" id="faq">
          <div className="accordion-item">
            <h2 className="accordion-header"><button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#f1">FoodHub giao trong bao lâu?</button></h2>
            <div id="f1" className="accordion-collapse collapse show" data-bs-parent="#faq"><div className="accordion-body text-muted">Trung bình 25-30 phút nội thành. Bạn xem thời gian dự kiến theo thời gian thực trên app.</div></div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#f2">Phí giao hàng tính thế nào?</button></h2>
            <div id="f2" className="accordion-collapse collapse" data-bs-parent="#faq"><div className="accordion-body text-muted">Tính theo khoảng cách và giờ cao điểm, hiển thị minh bạch trước khi thanh toán.</div></div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#f3">Làm sao trở thành đối tác?</button></h2>
            <div id="f3" className="accordion-collapse collapse" data-bs-parent="#faq"><div className="accordion-body text-muted">Đăng ký tại foodhub.vn/partner, đội ngũ sẽ liên hệ trong 24h để hỗ trợ onboarding.</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;