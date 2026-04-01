import React from 'react';

const About = () => {
  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <h1>Giới Thiệu Về FoodHub</h1>
      <p className="lead">FoodHub - Nền tảng giao đồ ăn nhanh chóng, đa dạng món ngon từ khắp nơi.</p>
      <div className="row">
        <div className="col-md-6">
          <img src="https://via.placeholder.com/600x400?text=FoodHub" alt="FoodHub" className="img-fluid rounded shadow" />
        </div>
        <div className="col-md-6">
          <h3>Sứ Mệnh Của Chúng Tôi</h3>
          <p>Đem những món ăn ngon nhất đến tận tay bạn chỉ trong vòng 30 phút.</p>
          <ul>
            <li>Giao hàng siêu tốc</li>
            <li>Đa dạng món ăn</li>
            <li>Giá cả hợp lý</li>
            <li>Ứng dụng thân thiện</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
