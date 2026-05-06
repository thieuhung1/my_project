// ============================================================
// App.js - Điểm khởi động ứng dụng Food Hub
// Chỉ ghép providers, router và layout chung
// ============================================================

import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import '../styles/App.css';
import '../styles/AdminShortcutIcon.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import AppProviders from './providers/AppProviders';

// ── Pages ──────────────────────────────────────────────────
import Home from '../Pages/Home/Index';
import Products from '../Pages/Products/Index';
import ProductDetail from '../Pages/ProductDetail/Index';
import Cart from '../Pages/Cart/Index';
import SignIn from '../Pages/SignIn/Index';
import SignUp from '../Pages/SignUp/Index';
import MyList from '../Pages/MyList/Index';
import Orders from '../Pages/Orders/Index';
import MyOrders from '../Pages/MyOrders/Index';
import Search from '../Pages/Search/Index';
import Checkout from '../Pages/Checkout/Index';
import MyAccount from '../Pages/MyAccount/Index';
import Contact from '../Pages/Contact/Index';
import About from '../Pages/About/Index';
import Admin from '../Pages/Admin/Index';
import Shipper from '../Pages/Shipper/Index';
import Waiter from '../Pages/Waiter/Index';

// ── Components ─────────────────────────────────────────────
import Header from '../components/layout/Header/Index';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Footer from '../components/layout/Footer/Index';
import SupportChatIcon from '../components/features/SupportChatIcon/index';
import ChatbotIcon from '../components/features/ChatbotIcon/index';

const NotFound = () => {
  return (
    <div className="container my-5 text-center">
      <div className="display-1 mb-3">🔒</div>
      <h2 className="fw-bold">Trang không tồn tại</h2>
      <p className="text-muted mb-4">
        Trang bạn tìm kiếm không tồn tại. Vui lòng kiểm tra lại đường dẫn.
      </p>
      <Link to="/" className="btn btn-warning">
        Quay về trang chủ
      </Link>
    </div>
  );
};

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
        <Link
          key={item.to}
          to={item.to}
          className={location.pathname === item.to ? 'active' : ''}
        >
          <i className={`bi ${item.icon}`} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

const AppRoutes = () => {
  return (
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
  );
};

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <div className="App">
          <Header />
          <main>
            <AppRoutes />
          </main>
          <Footer />
          <SupportChatIcon />
          <ChatbotIcon />
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;