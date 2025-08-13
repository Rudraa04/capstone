import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGem, FaMountain } from "react-icons/fa";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiHome,
  FiGlobe,
} from "react-icons/fi";
import axios from "axios";

export default function SlabsInventory() {
  const navigate = useNavigate();
  const [marbleCount, setMarbleCount] = useState(0);
  const [graniteCount, setGraniteCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const marbleRes = await axios.get("http://localhost:5000/api/products/marble");
        const graniteRes = await axios.get("http://localhost:5000/api/products/granite");
        setMarbleCount(marbleRes.data.length);
        setGraniteCount(graniteRes.data.length);
      } catch (error) {
        console.error("Error fetching product counts:", error);
      }
    };
    fetchCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const items = [
    {
      label: "Marble Inventory",
      description: "Manage all marble slabs",
      path: "/admin/inventory/marble",
      icon: <FaGem size={20} className="text-blue-600" />,
      count: marbleCount,
    },
    {
      label: "Granite Inventory",
      description: "Manage all granite slabs",
      path: "/admin/inventory/granite",
      icon: <FaMountain size={20} className="text-blue-600" />,
      count: graniteCount,
    },
  ];

  return (
    <div className="flex min-h-screen text-gray-800 bg-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <div>
          <button
  onClick={() => navigate("/admin")}
  className="text-2xl font-bold text-blue-700 flex items-center gap-2 hover:text-blue-900 transition"
>
  <FiHome /> Admin Panel
</button>

        </div>
        <nav className="space-y-4 text-sm">
          <button
            onClick={() => navigate("/admin/slabs")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left bg-gray-200 rounded-md font-semibold"
          >
            <FiBox /> Slabs Inventory
          </button>
          <button
            onClick={() => navigate("/admin/ceramics")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiPackage /> Ceramics Inventory
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiSettings /> Orders
          </button>
          <button
            onClick={() => navigate("/admin/support")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiHeadphones /> Customer Support
          </button>
          <button
            onClick={() => navigate("/admin/reports")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiTrendingUp /> Sales & Reports
          </button>
         
          <button
            onClick={() => navigate("/", { state: { fromAdmin: true } })}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"
          >
            <FiGlobe /> Customer Homepage
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-100 rounded-md"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 sm:px-10 py-6 sm:py-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          Slabs Inventory
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="group bg-white/70 backdrop-blur-md border border-gray-200 hover:border-blue-600 rounded-2xl p-5 shadow hover:shadow-md transition cursor-pointer"
            >
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 mb-1">
                    {item.label}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {item.count} items
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
