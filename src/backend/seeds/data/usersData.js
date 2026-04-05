// ============================================================
// usersData.js - Dữ liệu mẫu người dùng
// ============================================================

const usersData = [
  {
    displayName: "Nguyễn Văn Admin",
    email: "admin@foodhub.vn",
    phone: "0901234567",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    role: "admin",
    addresses: [
      {
        label: "Văn phòng",
        street: "123 Nguyễn Huệ, Quận 1",
        city: "Hồ Chí Minh",
        isDefault: true,
      },
    ],
  },
  {
    displayName: "Trần Thị Bình",
    email: "binh.tran@gmail.com",
    phone: "0912345678",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=binh",
    role: "customer",
    addresses: [
      {
        label: "Nhà",
        street: "456 Lê Lợi, Quận 3",
        city: "Hồ Chí Minh",
        isDefault: true,
      },
      {
        label: "Công ty",
        street: "789 Điện Biên Phủ, Quận Bình Thạnh",
        city: "Hồ Chí Minh",
        isDefault: false,
      },
    ],
  },
  {
    displayName: "Lê Minh Khoa",
    email: "khoa.le@hotmail.com",
    phone: "0923456789",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=khoa",
    role: "customer",
    addresses: [
      {
        label: "Nhà",
        street: "12 Trần Hưng Đạo, Quận 5",
        city: "Hồ Chí Minh",
        isDefault: true,
      },
    ],
  },
  {
    displayName: "Phạm Thị Hoa",
    email: "hoa.pham@yahoo.com",
    phone: "0934567890",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=hoa",
    role: "customer",
    addresses: [
      {
        label: "Nhà riêng",
        street: "88 Nguyễn Trãi, Quận 1",
        city: "Hồ Chí Minh",
        isDefault: true,
      },
    ],
  },
  {
    displayName: "Võ Đức Nam",
    email: "nam.vo@gmail.com",
    phone: "0945678901",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nam",
    role: "staff",
    addresses: [
      {
        label: "Nhà",
        street: "34 Cách Mạng Tháng 8, Quận 10",
        city: "Hồ Chí Minh",
        isDefault: true,
      },
    ],
  },
];

module.exports = usersData;
