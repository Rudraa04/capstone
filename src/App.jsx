import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/homepage.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Profile from './pages/profile.jsx'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Default is Home now */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
