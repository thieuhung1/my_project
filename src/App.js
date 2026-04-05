/**
 * App.js - Ứng dụng chính FoodHub (E-commerce đồ ăn Việt Nam)
 * Quản lý routing, layout chính với Header, Routes, Footer.
 * Sử dụng React Router v6 cho SPA navigation.
 * 
 * Tính năng:
 * - 12 routes chính (Home, Products, Cart, Auth, etc.)
 * - 404 fallback
 * - Bootstrap CSS global
 * - Fixed Header/Footer
 * 
 * Clean code: Lazy loading routes có thể thêm để optimize bundle.
 * @author Your Name
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

// Import các thành phần layout tĩnh (không cần lazy load)
import Header from './components/Conponents/Header/Index';
import Footer from './components/Conponents/Footer/Index';

/**
 * Sử dụng React.lazy để trì hoãn việc tải mã nguồn của các trang (Code Splitting).
 * Giúp giảm thời gian tải trang đầu tiên (Initial Load Time).
 */
const Home = lazy(() => import('./Pages/Home/Index'));
const Products = lazy(() => import('./Pages/Products/Index'));
const ProductDetail = lazy(() => import('./Pages/ProductDetail/Index'));
const Cart = lazy(() => import('./Pages/Cart/Index'));
const SignIn = lazy(() => import('./Pages/SignIn/Index'));
const SignUp = lazy(() => import('./Pages/SignUp/Index'));
const MyList = lazy(() => import('./Pages/MyList/Index'));
const Orders = lazy(() => import('./Pages/Orders/Index'));
const Search = lazy(() => import('./Pages/Search/Index'));
const MyAccount = lazy(() => import('./Pages/MyAccount/Index'));
const Contact = lazy(() => import('./Pages/Contact/Index'));
const About = lazy(() => import('./Pages/About/Index'));

/**
 * Loading Spinner đơn giản hiển thị khi chờ tải trang.
 */
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-warning" role="status">
      <span className="visually-hidden">Đang tải trang...</span>
    </div>
  </div>
);

/**
 * Component App - Cấu trúc chính của ứng dụng FoodHub.
 * Định nghĩa bộ định tuyến (Router) và bố cục (Layout) tổng thể.
 */
function App() {
  return (
    <BrowserRouter>
      {/* Header xuất hiện trên mọi trang */}
      <Header />
      
      {/* Container chính cho nội dung các trang */}
      <main className="main-content" style={{ marginTop: '80px', minHeight: '80vh' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/search" element={<Search />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            
            {/* 404 Fallback - Trang không tồn tại */}
            <Route path="*" element={<div className="container text-center mt-5"><h3>404 - Không tìm thấy trang này</h3></div>} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer xuất hiện ở cuối mọi trang */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
