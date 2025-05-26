import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
        >
          Logout
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Slabs Inventory */}
        <div
          className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate('/admin/slabs')}
        >
          <img
            src="/images/slabs-banner.png"
            alt="Slabs"
            className="h-32 w-full object-cover rounded-md mb-2"
          />
          <h2 className="text-lg font-semibold text-blue-800 mb-1">Slabs Inventory</h2>
          <p className="text-sm text-gray-600">Manage Marble & Granite inventory</p>
        </div>

        {/* Ceramics Inventory */}
        <div
          className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate('/admin/ceramics')}
        >
          <img
            src="/images/ceramics-banner.png"
            alt="Ceramics"
            className="h-32 w-full object-cover rounded-md mb-2"
          />
          <h2 className="text-lg font-semibold text-blue-800 mb-1">Ceramics Inventory</h2>
          <p className="text-sm text-gray-600">Manage Tiles, Bathtubs, Sinks & Toilets</p>
        </div>

        {/* Customer Support */}
        <div
          className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate('/admin/support')}
        >
          <img src="/images/support-icon.png" alt="Support" className="h-20 w-20" />
        </div>

        {/* Order Management */}
        <div
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate('/admin/orders')}
        >
          <img src="/images/order-icon.png" alt="Orders" className="h-20 w-20" />
          <span className="mt-2 text-blue-700 font-semibold text-sm">Order Management</span>
        </div>
      </div>
    </div>
  );
}
