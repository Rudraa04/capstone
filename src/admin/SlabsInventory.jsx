import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGem, FaMountain, FaPlus } from "react-icons/fa";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiHome,
} from "react-icons/fi";

export default function SlabsInventory() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const items = [
    {
      label: "Marble Inventory",
      description: "Manage all marble slabs",
      path: "/admin/inventory/marble",
      icon: <FaGem size={24} className="text-blue-600" />,
      count: 24,
    },
    {
      label: "Granite Inventory",
      description: "Manage all granite slabs",
      path: "/admin/inventory/granite",
      icon: <FaMountain size={24} className="text-blue-600" />,
      count: 17,
    },
  ];

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <div>
          <button
            onClick={() => navigate("/adminHome")}
            className="text-2xl font-bold text-blue-700 flex items-center gap-2 hover:text-blue-900 transition"
          >
            <FiHome /> Admin Panel
          </button>
        </div>
        <nav className="space-y-4 text-sm">
          <button
            onClick={() => navigate("/admin/slabs")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
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
            onClick={() => navigate("/admin/useraccess")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiUsers /> User Access
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
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-800">Slabs Inventory</h1>
          <div className="flex gap-3">
            <button
              onClick={() => alert("Add New feature coming soon!")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FaPlus /> Add New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white border border-gray-200 hover:border-blue-500 rounded-xl p-6 shadow-sm hover:shadow-lg transition duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.label}
                  </h2>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {item.count}
                </span>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
