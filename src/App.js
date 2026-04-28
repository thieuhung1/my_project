// ============================================================
// App.js - Điểm khởi động ứng dụng Food Hub
// Bọc toàn bộ app với các Context Provider của Firebase
// ============================================================

import { BrowserRouter, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// ── Pages ──────────────────────────────────────────────────
import Home from './Pages/Home/Index';
import Products from './Pages/Products/Index';
import ProductDetail from './Pages/ProductDetail/Index';
import Cart from './Pages/Cart/Index';
import SignIn from './Pages/SignIn/Index';
import SignUp from './Pages/SignUp/Index';
import MyList from './Pages/MyList/Index';
import Orders from './Pages/Orders/Index';
import MyOrders from './Pages/MyOrders/Index';
import Search from './Pages/Search/Index';
import Checkout from './Pages/Checkout/Index';
import MyAccount from './Pages/MyAccount/Index';
import Contact from './Pages/Contact/Index';
import About from './Pages/About/Index';
import Admin from './Pages/Admin/Index';
import Shipper from './Pages/Shipper/Index';
import Waiter from './Pages/Waiter/Index';

// ── Components ─────────────────────────────────────────────
import Header from './Conponents/Header/Index';
import ProtectedRoute from './Conponents/ProtectedRoute';
import Footer from './Conponents/Footer/Index';
import SupportChatIcon from './Conponents/SupportChatIcon/SupportChatIcon';

// ── Context Providers ──────────────────────────────────────
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';

const NotFound = () => (
  <div className="container my-5 text-center fade-in-up">
    <h2>404 - Không tìm thấy trang</h2>
    <p className="text-muted">Trang bạn tìm kiếm không tồn tại.</p>
    <Link to="/" className="btn btn-warning px-4">
      Về trang chủ
    </Link>
  </div>
);

const BottomNav = () => {
  const location = useLocation();
  const items = [
    { to: '/', icon: 'bi-house', label: 'Trang chủ' },
    { to: '/products', icon: 'bi-grid', label: 'Menu' },
    { to: '/cart', icon: 'bi-cart', label: 'Giỏ hàng' },
    { to: '/my-orders', icon: 'bi-bag', label: 'Đơn hàng' },
    { to: '/my-account', icon: 'bi-person', label: 'Tài khoản' },
  ];

  return (
    <nav className="bottom-nav d-md-none">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'active' : ''}>
          <i className={`bi ${item.icon}`} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="App">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/menu" element={<Products />} />
                  <Route path="/promo" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/login" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/my-list" element={<MyList />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/search" element={<Search />} />
                  <Route path="/checkout/:orderId" element={<Checkout />} />
                  <Route path="/my-account" element={<MyAccount />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
                    <Route path="/shipper" element={<Shipper />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['waiter', 'admin']} />}>
                    <Route path="/waiter" element={<Waiter />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <SupportChatIcon />
              <BottomNav />
            </div>
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
