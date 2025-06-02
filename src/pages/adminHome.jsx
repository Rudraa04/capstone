import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiHeadphones,
  FiLogOut,
  FiHome,
  FiBell,
} from "react-icons/fi";
import SalesChart from "../components/SalesChart";

export default function AdminHome() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FiHome /> Admin Panel
          </h2>
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
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-8 relative">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Welcome, Admin</h1>
            <p className="text-gray-500 text-sm">
              Here's what's happening today.
            </p>
          </div>

          {/* Notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative"
            >
              <FiBell size={24} className="text-blue-700 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                3
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4">
                <h3 className="text-sm font-semibold mb-3 text-blue-700">
                  Recent Notifications
                </h3>
                <ul className="text-sm text-gray-800 space-y-2">
                  <li className="flex gap-2 items-start">
                    <span className="text-blue-500">🆕</span> New order placed:{" "}
                    <strong>#1025</strong>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-yellow-500">⚠️</span> Product{" "}
                    <strong>Marble A</strong> low in stock
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-green-500">✅</span> Ticket #2387
                    resolved
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-sm text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold text-blue-700">320</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-sm text-gray-500">Orders Today</h3>
            <p className="text-2xl font-bold text-blue-700">25</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-sm text-gray-500">New Users</h3>
            <p className="text-2xl font-bold text-blue-700">12</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-sm text-gray-500">Revenue</h3>
            <p className="text-2xl font-bold text-blue-700">$3,450</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-10">
          <h2 className="text-xl font-bold mb-4 text-blue-700">
            Recent Orders
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Order ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Status</th>
                <th className="py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">#00124</td>
                <td className="py-2">Smit Patel</td>
                <td className="py-2 text-green-600 font-semibold">Completed</td>
                <td className="py-2">$120.00</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">#00125</td>
                <td className="py-2">Om Patel</td>
                <td className="py-2 text-yellow-600 font-semibold">Pending</td>
                <td className="py-2">$85.00</td>
              </tr>
              <tr>
                <td className="py-2">#00126</td>
                <td className="py-2">Deep Patel</td>
                <td className="py-2 text-red-600 font-semibold">Cancelled</td>
                <td className="py-2">$0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-blue-700">
            Sales Overview
          </h2>
          <SalesChart />
        </div>
      </main>
    </div>
  );
}
