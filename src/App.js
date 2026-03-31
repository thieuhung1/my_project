import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Home from './Pages/Home/Index';
import Header from './Conponents/Header/Index';
import Footer from './Conponents/Footer/Index';
function App() {
  return (
   <BrowserRouter>
   <Header />
   <Routes>
    <Route path='/' exact element={<Home/>}/>
   </Routes>
   <Footer />
   </BrowserRouter>
  );
}

export default App;
