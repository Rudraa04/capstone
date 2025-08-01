import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
//firebase informs us if a user is logged in and what their info is
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase"; // our firebase setup
//this one lets only special users go into special pages
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/homepage.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Profile from "./pages/profile.jsx";
import Slabs from "./pages/slabs.jsx";
import Ceramics from "./pages/ceramics.jsx";
import Cart from "./pages/cart.jsx";
import Checkout from "./pages/checkout.jsx";
import Interior from "./pages/interior.jsx";
import Exterior from "./pages/exterior.jsx";
import Sanitary from "./pages/sanitary.jsx";
import ProductDetail from "./pages/ProductDetail";
import AllProducts from "./pages/allProduct.jsx";

// Admin pages
import AdminHome from "./pages/adminHome.jsx";
import AddProduct from "./admin/AddProduct";
import AddMarble from "./admin/AddMarble";
import AddGranite from "./admin/AddGranite";
import AddTiles from "./admin/AddTiles";
import AddBathtub from "./admin/AddBathtub";
import AddSink from "./admin/AddSink";
import AddToilet from "./admin/AddToilet";
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

// Footer Pages
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";
import Blog from "./pages/BLog.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfUse from "./pages/TermsOfUse";
import Sitemap from "./pages/Sitemap";

// Who We Serve
import Homeowners from "./pages/serve/Homeowners.jsx";
import Architects from "./pages/serve/Architects.jsx";
import Designers from "./pages/serve/Designers.jsx";
import Builders from "./pages/serve/Builders.jsx";
import Commercial from "./pages/serve/Commercial.jsx";

// What We Do
import CustomDesign from "./pages/services/CustomDesign.jsx";
import BulkOrders from "./pages/services/BulkOrders.jsx";
import QualityAssurance from "./pages/services/QualityAssurance.jsx";
import NationwideDelivery from "./pages/services/NationwideDelivery.jsx";

export default function App() {
  //store the user's role (like "admin" or "customer")
  const [userRole, setUserRole] = useState(null);
  // This helps us wait while checking the user's role
  const [loading, setLoading] = useState(true);
  //Check if someone is logged in and get their role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); //  { role: "admin" } in Firestore (in admin cases)
        } else {
          setUserRole(null); // just in case the doc doesn't exist
        }
      } else {
        setUserRole(null); // no one is logged in
      }
      setLoading(false); // we're done checking
    });

    return () => unsubscribe();
  }, []);
  //loading message
  if (loading) return <div>Loading...</div>;

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

      
        <Route path="/product/:type/:id" element={<ProductDetail />} />
        <Route path="/products" element={<AllProducts />} />
        {/* Company */}
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />

        {/* Who We Serve */}
        <Route path="/serve/homeowners" element={<Homeowners />} />
        <Route path="/serve/architects" element={<Architects />} />
        <Route path="/serve/designers" element={<Designers />} />
        <Route path="/serve/builders" element={<Builders />} />
        <Route path="/serve/commercial" element={<Commercial />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/sitemap" element={<Sitemap />} />
        {/* What We Do */}
        <Route path="/services/custom-design" element={<CustomDesign />} />
        <Route path="/services/bulk-orders" element={<BulkOrders />} />
        <Route path="/services/quality" element={<QualityAssurance />} />
        <Route path="/services/delivery" element={<NationwideDelivery />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addproduct"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/slabs"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <SlabsInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ceramics"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <CeramicsInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/marble"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <MarbleInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/granite"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <GraniteInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/tiles"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <TilesInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/bathtubs"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <BathtubInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/sinks"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <SinkInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/toilets"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <ToiletInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <OrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <CustomerSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <SalesReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addmarble"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddMarble />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addgranite"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddGranite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addtiles"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddTiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addbathtub"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddBathtub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addsink"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddSink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addtoilet"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["admin"]}>
              <AddToilet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["customer", "admin"]}>
              <Cart/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute userRole={userRole} allowedRoles={["customer", "admin"]}>
              <Checkout/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
