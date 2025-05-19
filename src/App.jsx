import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/homepage.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Profile from './pages/profile.jsx';
import Slabs from './pages/slabs.jsx';
import Ceramics from './pages/ceramics.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Default is Home */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/slabs" element={<Slabs />} />
        <Route path="/ceramics" element={<Ceramics />} />
      </Routes>
    </BrowserRouter>
  );
}
