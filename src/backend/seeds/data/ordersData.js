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
      { productIndex: 0, quantity: 2 },
      { productIndex: 15, quantity: 2 },
    ],
    paymentMethod: "COD",
    paymentStatus: "PAID",
    paymentProvider: "LOCAL",
    status: "COMPLETED",
    note: "Cho ít đường trà sữa nhé",
  },
  {
    userIndex: 2,
    userName: "Lê Minh Khoa",
    phone: "0923456789",
    address: "12 Trần Hưng Đạo, Quận 5, Hồ Chí Minh",
    items: [
      { productIndex: 4, quantity: 1 },
      { productIndex: 6, quantity: 1 },
      { productIndex: 17, quantity: 2 },
    ],
    paymentMethod: "COD",
    paymentStatus: "PAID",
    paymentProvider: "LOCAL",
    status: "COMPLETED",
    note: "",
  },
  {
    userIndex: 3,
    userName: "Phạm Thị Hoa",
    phone: "0934567890",
    address: "88 Nguyễn Trãi, Quận 1, Hồ Chí Minh",
    items: [
      { productIndex: 7, quantity: 1 },
      { productIndex: 8, quantity: 1 },
    ],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    paymentProvider: "LOCAL",
    status: "DELIVERING",
    note: "Giao trước 12h trưa",
  },
  {
    userIndex: 1,
    userName: "Trần Thị Bình",
    phone: "0912345678",
    address: "789 Điện Biên Phủ, Bình Thạnh, Hồ Chí Minh",
    items: [
      { productIndex: 21, quantity: 1 },
      { productIndex: 22, quantity: 1 },
      { productIndex: 15, quantity: 1 },
    ],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    paymentProvider: "LOCAL",
    status: "CONFIRMED",
    note: "Gà cay vừa thôi",
  },
  {
    userIndex: 2,
    userName: "Lê Minh Khoa",
    phone: "0923456789",
    address: "12 Trần Hưng Đạo, Quận 5, Hồ Chí Minh",
    items: [
      { productIndex: 18, quantity: 2 },
      { productIndex: 19, quantity: 1 },
    ],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    paymentProvider: "LOCAL",
    status: "PENDING",
    note: "Sinh nhật bạn gái, gói đẹp giúp mình nha!",
  },
  {
    userIndex: 4,
    userName: "Võ Đức Nam",
    phone: "0945678901",
    address: "34 Cách Mạng Tháng 8, Quận 10, Hồ Chí Minh",
    items: [
      { productIndex: 1, quantity: 1 },
      { productIndex: 10, quantity: 1 },
      { productIndex: 17, quantity: 1 },
    ],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    paymentProvider: "LOCAL",
    status: "CANCELLED",
    note: "",
  },
];

module.exports = ordersData;
