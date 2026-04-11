// ============================================================
// App.js - Điểm khởi động ứng dụng Food Hub
// Bọc toàn bộ app với các Context Provider của Firebase
// ============================================================

import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// ── Pages ──────────────────────────────────────────────────
import Home          from './Pages/Home/Index';
import Products      from './Pages/Products/Index';
import ProductDetail from './Pages/ProductDetail/Index';
import Cart          from './Pages/Cart/Index';
import SignIn        from './Pages/SignIn/Index';
import SignUp        from './Pages/SignUp/Index';
import MyList        from './Pages/MyList/Index';
import Orders        from './Pages/Orders/Index';
import Search        from './Pages/Search/Index';
import MyAccount     from './Pages/MyAccount/Index';
import Contact       from './Pages/Contact/Index';
import About         from './Pages/About/Index';
import Admin         from './Pages/Admin/Index';
import Shipper       from './Pages/Shipper/Index';
import Waiter        from './Pages/Waiter/Index';

// ── Components ─────────────────────────────────────────────
import Header from './Conponents/Header/Index';
import ProtectedRoute from './Conponents/ProtectedRoute';
import Footer from './Conponents/Footer/Index';
import SupportChatIcon from './Conponents/SupportChatIcon/SupportChatIcon';

// ── Context Providers (kết nối Firebase backend) ───────────
import { AuthProvider }    from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider }    from './contexts/CartContext';

// ── Trang 404 ─────────────────────────────────────────────
const NotFound = () => (
  <div className="container my-5 text-center">
    <h2>404 - Không tìm thấy trang</h2>
    <p className="text-muted">Trang bạn tìm kiếm không tồn tại.</p>
    <Link to="/" className="btn btn-warning px-4">
      Về trang chủ
    </Link>
  </div>
);

function App() {
  return (
    // 1️⃣ AuthProvider - Ngoài cùng, quản lý đăng nhập Firebase
    <AuthProvider>
      {/* 2️⃣ ProductProvider - Lấy sản phẩm từ Firestore */}
      <ProductProvider>
        {/* 3️⃣ CartProvider - Giỏ hàng (cần Auth để checkout) */}
        <CartProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/products"    element={<Products />} />
              <Route path="/menu"        element={<Products />} />
              <Route path="/promo"       element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart"        element={<Cart />} />
              <Route path="/signin"      element={<SignIn />} />
              <Route path="/login"       element={<SignIn />} />
              <Route path="/signup"      element={<SignUp />} />
              <Route path="/my-list"     element={<MyList />} />
              <Route path="/orders"      element={<Orders />} />
              <Route path="/search"      element={<Search />} />
              <Route path="/my-account"  element={<MyAccount />} />
              <Route path="/contact"     element={<Contact />} />
              <Route path="/about"       element={<About />} />
              
              {/* --- Routes bảo vệ cho mục Admin và Shipper --- */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
                <Route path="/shipper" element={<Shipper />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['waiter', 'admin']} />}>
                <Route path="/waiter" element={<Waiter />} />
              </Route>

              <Route path="*"            element={<NotFound />} />
            </Routes>
<Footer />
        <SupportChatIcon />
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
