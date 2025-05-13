import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/homepage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more routes later */}
      </Routes>
    </BrowserRouter>
  );
}
