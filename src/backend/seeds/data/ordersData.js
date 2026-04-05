// ============================================================
// ordersData.js - Dữ liệu mẫu đơn hàng
// ============================================================

// productIndex tham chiếu đến thứ tự trong productsData
// userIndex tham chiếu đến thứ tự trong usersData

const ordersData = [
  {
    userIndex: 1, // Trần Thị Bình
    userName: "Trần Thị Bình",
    phone: "0912345678",
    address: "456 Lê Lợi, Quận 3, Hồ Chí Minh",
    items: [
      { productIndex: 0, quantity: 2 },  // Classic Beef Burger x2
      { productIndex: 15, quantity: 2 }, // Trà Sữa Trân Châu x2
    ],
    paymentMethod: "cash",
    status: "delivered",
    note: "Cho ít đường trà sữa nhé",
  },
  {
    userIndex: 2, // Lê Minh Khoa
    userName: "Lê Minh Khoa",
    phone: "0923456789",
    address: "12 Trần Hưng Đạo, Quận 5, Hồ Chí Minh",
    items: [
      { productIndex: 4, quantity: 1 },  // Margherita Pizza x1
      { productIndex: 6, quantity: 1 },  // Pepperoni Pizza x1
      { productIndex: 17, quantity: 2 }, // Iced Coffee Latte x2
    ],
    paymentMethod: "banking",
    status: "delivered",
    note: "",
  },
  {
    userIndex: 3, // Phạm Thị Hoa
    userName: "Phạm Thị Hoa",
    phone: "0934567890",
    address: "88 Nguyễn Trãi, Quận 1, Hồ Chí Minh",
    items: [
      { productIndex: 7, quantity: 1 },  // Salmon Nigiri x1
      { productIndex: 8, quantity: 1 },  // Dragon Roll x1
    ],
    paymentMethod: "cash",
    status: "delivering",
    note: "Giao trước 12h trưa",
  },
  {
    userIndex: 1,
    userName: "Trần Thị Bình",
    phone: "0912345678",
    address: "789 Điện Biên Phủ, Bình Thạnh, Hồ Chí Minh",
    items: [
      { productIndex: 21, quantity: 1 }, // Gà Rán Giòn x1
      { productIndex: 22, quantity: 1 }, // Cánh Gà Sốt Cay x1
      { productIndex: 15, quantity: 1 }, // Trà Sữa x1
    ],
    paymentMethod: "cash",
    status: "confirmed",
    note: "Gà cay vừa thôi",
  },
  {
    userIndex: 2,
    userName: "Lê Minh Khoa",
    phone: "0923456789",
    address: "12 Trần Hưng Đạo, Quận 5, Hồ Chí Minh",
    items: [
      { productIndex: 18, quantity: 2 }, // Chocolate Lava Cake x2
      { productIndex: 19, quantity: 1 }, // Tiramisu x1
    ],
    paymentMethod: "banking",
    status: "pending",
    note: "Sinh nhật bạn gái, gói đẹp giúp mình nha!",
  },
  {
    userIndex: 4, // Võ Đức Nam
    userName: "Võ Đức Nam",
    phone: "0945678901",
    address: "34 Cách Mạng Tháng 8, Quận 10, Hồ Chí Minh",
    items: [
      { productIndex: 1, quantity: 1 },  // Double Smash Burger x1
      { productIndex: 10, quantity: 1 }, // Spaghetti Carbonara x1
      { productIndex: 17, quantity: 1 }, // Iced Coffee Latte x1
    ],
    paymentMethod: "cash",
    status: "cancelled",
    note: "",
  },
];

module.exports = ordersData;
