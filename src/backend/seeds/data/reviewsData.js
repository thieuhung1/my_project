// ============================================================
// reviewsData.js - Dữ liệu mẫu đánh giá sản phẩm
// ============================================================

// Lưu ý: productIndex và userIndex tham chiếu đến thứ tự trong
// mảng products và users đã được seed trước đó.

const reviewsData = [
  {
    productIndex: 0, // Classic Beef Burger
    userIndex: 1,    // Trần Thị Bình
    rating: 5,
    comment: "Burger rất ngon, thịt bò tươi và mềm, sốt đặc biệt tuyệt vời! Sẽ order lại lần nữa.",
  },
  {
    productIndex: 0,
    userIndex: 2,
    rating: 4,
    comment: "Vị ngon, giao hàng nhanh. Chỉ hơi tiếc là khoai tây hơi nguội khi đến nơi.",
  },
  {
    productIndex: 1, // Double Smash Burger
    userIndex: 3,
    rating: 5,
    comment: "Đây là burger ngon nhất mình từng ăn! Thịt smash giòn rụm, pho mai chảy mịn. Hoàn hảo!",
  },
  {
    productIndex: 4, // Margherita Pizza
    userIndex: 1,
    rating: 5,
    comment: "Pizza chuẩn vị Ý, bánh mỏng giòn đế, phô mai thơm béo. Rất hài lòng!",
  },
  {
    productIndex: 4,
    userIndex: 2,
    rating: 4,
    comment: "Ngon và tươi, sẽ order thêm lần sau. Mong quán có thêm size lớn hơn.",
  },
  {
    productIndex: 6, // Pepperoni Pizza
    userIndex: 3,
    rating: 5,
    comment: "Xúc xích pepperoni đậm vị, nhiều nhân, phô mai béo ngậy. Cực kỳ recommend!",
  },
  {
    productIndex: 7, // Salmon Nigiri
    userIndex: 4,
    rating: 5,
    comment: "Cá hồi tươi, cơm vừa ngon, dịch vụ tốt. Sẽ ủng hộ thường xuyên.",
  },
  {
    productIndex: 10, // Spaghetti Carbonara
    userIndex: 1,
    rating: 4,
    comment: "Carbonara chuẩn vị, sốt không bị đặc quá, thịt xông khói đậm đà. Ngon!",
  },
  {
    productIndex: 15, // Trà Sữa Trân Châu
    userIndex: 2,
    rating: 5,
    comment: "Trân châu mềm dai, không quá ngọt, rất vừa miệng! Order hàng ngày luôn 😍",
  },
  {
    productIndex: 17, // Iced Coffee Latte
    userIndex: 3,
    rating: 5,
    comment: "Cà phê thơm, đậm vừa, đá không làm loãng vị. Uống buổi sáng là tuyệt!",
  },
  {
    productIndex: 18, // Chocolate Lava Cake
    userIndex: 4,
    rating: 5,
    comment: "Bánh nóng hổi, chocolate chảy ra khi cắt vào - không thể ngon hơn! ❤️",
  },
  {
    productIndex: 21, // Gà Rán Giòn
    userIndex: 1,
    rating: 5,
    comment: "Gà giòn rụm, gia vị thấm đều, khoai tây kèm theo ngon không kém. 5 sao!",
  },
  {
    productIndex: 22, // Cánh Gà Sốt Cay
    userIndex: 2,
    rating: 4,
    comment: "Sốt cay ngọt rất ổn, 8 cánh gà ăn no. Chỉ mong cay hơn một chút nữa!",
  },
];

module.exports = reviewsData;
