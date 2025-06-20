import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/homepage.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Profile from "./pages/profile.jsx";
import Slabs from "./pages/slabs.jsx";
import Ceramics from "./pages/ceramics.jsx";
import Cart from "./pages/cart.jsx";
import Checkout from "./pages/checkout.jsx"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/adminLogin.jsx";
import AdminHome from "./pages/adminHome.jsx";
import AddProduct from "./admin/AddProduct";
import Interior from "./pages/interior.jsx";
import Exterior from "./pages/exterior.jsx";
import Sanitary from "./pages/sanitary.jsx";
import BedroomWall from "./pages/BedroomWall";
import BedroomFloor from "./pages/BedroomFloor";
import ProductDetail from "./pages/ProductDetail";

import SlabsInventory from "./admin/SlabsInventory.jsx";
import CeramicsInventory from "./admin/CeramicsInventory.jsx";
import MarbleInventory from "./admin/MarbleInventory.jsx";
import GraniteInventory from "./admin/GraniteInventory.jsx";
import TilesInventory from "./admin/TilesInventory.jsx";
import BathtubInventory from "./admin/BathtubInventory.jsx";
import SinkInventory from "./admin/SinkInventory.jsx";
import ToiletInventory from "./admin/ToiletInventory.jsx";

import OrderManagement from "./admin/OrderManagement";
import CustomerSupport from "./admin/CustomerSupport.jsx";
import SalesReports from "./admin/SalesReports.jsx";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/slabs" element={<Slabs />} />
        <Route path="/ceramics" element={<Ceramics />} />
        <Route path="/interior" element={<Interior />} />
        <Route path="/exterior" element={<Exterior />} />
        <Route path="/sanitary" element={<Sanitary />} />
        <Route path="/bedroomwall" element={<BedroomWall />} />
        <Route path="/bedroomfloor" element={<BedroomFloor />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} /> {/* ✅ Added */}
        <Route path="/product/:type/:id" element={<ProductDetail />} />

        {/* Admin routes */}
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/addproduct" element={<AddProduct />} />
        <Route path="/admin/slabs" element={<SlabsInventory />} />
        <Route path="/admin/ceramics" element={<CeramicsInventory />} />
        <Route path="/admin/inventory/marble" element={<MarbleInventory />} />
        <Route path="/admin/inventory/granite" element={<GraniteInventory />} />
        <Route path="/admin/inventory/tiles" element={<TilesInventory />} />
        <Route path="/admin/inventory/bathtubs" element={<BathtubInventory />} />
        <Route path="/admin/inventory/sinks" element={<SinkInventory />} />
        <Route path="/admin/inventory/toilets" element={<ToiletInventory />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/support" element={<CustomerSupport />} />
        <Route path="/admin/reports" element={<SalesReports />} />
      
      </Routes>
    </BrowserRouter>
  );
}
