# 🚀 FoodHub - Frontend Giao Đồ Ăn Việt Nam

## 📋 **Tính Năng Hoàn Chỉnh**
✅ **12 Pages**: Home, Products, ProductDetail, Cart, SignIn/SignUp, MyList, Orders, Search, MyAccount, Contact, About  
✅ **State Management**: Context API (Auth/Cart/Product) + localStorage  
✅ **UI/UX**: Bootstrap 5 responsive, theme cam-trắng (#FF6B35), animations, loading spinners  
✅ **Performance**: Lazy loading, optimized grids, mock API delay  
✅ **Food VN**: Phở, Bánh Mì, Bánh Xèo... với ảnh ASSETS/Images  

## 🛠 **Tech Stack**
```
React 19 + Router v7
Bootstrap 5 + Icons
Context API + useReducer
ESLint + Prettier
CRA (react-scripts 5.0.1)
```

## 🚀 **Chạy Project**
```bash
npm install
npm start
```
Mở http://localhost:3000

## 📁 **Cấu Trúc Code**
```
src/
├── App.js - Router + Layout
├── contexts/
│   ├── AuthContext.js - Đăng nhập localStorage
│   ├── CartContext.js - Giỏ hàng reducer + count badge
│   └── ProductContext.js - Mock API + loading VN foods
├── Pages/ - 12 pages w/ useContext
└── Conponents/Header.js - Nav responsive + search/cart
```

## ✨ **Tối Ưu Nổi Bật**
- **Products/MyList/Search**: Grid responsive `col-xl-3 lg-4 md-6`, filter/search/pagination, hover-lift
- **ProductDetail**: Carousel, quantity input, badges Hot/free ship, breadcrumb
- **Home**: Hero slider, featured carousel w/ IntersectionObserver fade-in
- **Header**: Fixed nav, cart badge live, search `/search?q=query`
- **Cart**: Table editable quantity, remove, total VNĐ
- **Auth**: Protected Orders/MyAccount, mock login
- **Performance**: Loading spinners, lazy imgs, memoized products
- **Responsive**: Mobile-first Bootstrap, hamburger menu
- **Animations**: CSS keyframes fadeInUp/slideIn, hover scale/shadow

## 🎨 **Theme Cam-Trắng**
```css
:root {
  --orange: #FF6B35;
  --white: #FFFFFF;
  --shadow: 0 4px 20px rgba(255,107,53,0.15);
}
```

## 📱 **Demo Flow**
1. Home → Featured products → Add to Cart
2. Products → Filter → Detail → Quantity → Cart
3. SignUp/Login → MyAccount/Orders
4. Search "phở" → Results grid
5. Cart → Checkout → Orders history

**Ready production, dễ kết nối API backend! 🔥**

