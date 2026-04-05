import React from 'react';

const About = () => {
  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Giới Thiệu Về <span className="text-gradient-orange">FoodHub</span></h1>
        <p className="lead text-muted m-0">Nền tảng giao đồ ăn nhanh chóng, đa dạng món ngon từ khắp nơi.</p>
      </div>

      <div className="row g-4 align-items-center">
        <div className="col-md-6">
          <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop"
              alt="FoodHub"
              className="w-100 h-100 object-fit-cover"
              loading="lazy"
              onError={(e)=>{e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}}
            />
          </div>
        </div>
        <div className="col-md-6">
          <h3 className="fw-bold mb-3">Sứ mệnh của chúng tôi</h3>
          <p className="text-muted">Đem những món ăn ngon nhất đến tận tay bạn chỉ trong vòng 30 phút, với trải nghiệm mượt mà và an toàn.</p>
          <ul className="list-unstyled d-grid gap-2">
            {[
              'Giao hàng siêu tốc 30’',
              'Đa dạng món ăn Việt & quốc tế',
              'Giá hợp lý, ưu đãi mỗi ngày',
              'Ứng dụng thân thiện, hỗ trợ 24/7',
            ].map((t,i)=>(
              <li key={i} className="d-flex align-items-start gap-2">
                <i className="bi bi-check-circle-fill text-success mt-1" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;