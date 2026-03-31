import { BrowserRouter, Route, Router } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Home from './Pages/Home/Index';
import Header from './Conponents/Header/Index';
function App() {
  return (
   <BrowserRouter>
   <Header />

   <Router>
    <Route path='/' exact = {true} element={<Home/>}/>
   </Router>
   </BrowserRouter>
  );
}

export default App;