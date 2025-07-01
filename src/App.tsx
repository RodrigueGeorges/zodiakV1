import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Guidance from './pages/Guidance';
import Natal from './pages/Natal';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RegisterComplete from './pages/RegisterComplete';
import Subscribe from './pages/Subscribe';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Test from './pages/Test';
import BottomNavBar from './components/BottomNavBar';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guidance" element={<Guidance />} />
        <Route path="/natal" element={<Natal />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/complete" element={<RegisterComplete />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/test" element={<Test />} />
      </Routes>
      <BottomNavBar />
    </Router>
  );
}

export default App;