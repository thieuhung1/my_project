import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Home from './Pages/Home/Index';
import Products from './Pages/Products/Index';
import ProductDetail from './Pages/ProductDetail/Index';
import Cart from './Pages/Cart/Index';
import SignIn from './Pages/SignIn/Index';
import SignUp from './Pages/SignUp/Index';
import MyList from './Pages/MyList/Index';
import Orders from './Pages/Orders/Index';
import Search from './Pages/Search/Index';
import MyAccount from './Pages/MyAccount/Index';
import Contact from './Pages/Contact/Index';
import About from './Pages/About/Index';
import Header from './Conponents/Header/Index';
import Footer from './Conponents/Footer/Index';
function App() {
  return (
   <BrowserRouter>
   <Header />
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
    <Route path="/search" element={<Search />} />
    <Route path="/my-account" element={<MyAccount />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<div className="container my-5 text-center animate__fadeIn"><h2>404 - Không tìm thấy trang</h2><Link to="/" className="btn btn-warning">Trang chủ</Link></div>} />
   </Routes>
   <Footer />
   </BrowserRouter>
  );
}

export default App;
