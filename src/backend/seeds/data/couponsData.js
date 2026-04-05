const couponsData = [
  {
    code: 'WELCOME10',
    name: 'Chào mừng thành viên mới',
    type: 'percent',
    value: 10,
    minOrder: 100000,
    maxUses: 100,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'SAVE20K',
    name: 'Giảm 20k đơn 150k+',
    type: 'fixed',
    value: 20000,
    minOrder: 150000,
    maxUses: 50,
    usedCount: 12,
    isActive: true,
  },
  {
    code: 'FLASH50',
    name: 'Flash Sale 50%',
    type: 'percent',
    value: 50,
    minOrder: 50000,
    maxUses: 20,
    usedCount: 18,
    isActive: false,
  },
];

module.exports = couponsData;

