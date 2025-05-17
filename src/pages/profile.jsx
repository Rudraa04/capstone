import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear auth data here if needed (e.g., localStorage.clear())
    navigate('/login');
  };

  return (
    <div className="bg-[#fdf4ec] min-h-screen text-[#3a2d25] font-sans">
      <Header />

      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">My Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              value="John Doe"
              className="w-full border border-gray-300 px-4 py-2 rounded-md bg-[#fdf9f3]"
              disabled
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value="john@example.com"
              className="w-full border border-gray-300 px-4 py-2 rounded-md bg-[#fdf9f3]"
              disabled
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Address</label>
            <textarea
              value="123 Main Street, Alberta"
              className="w-full border border-gray-300 px-4 py-2 rounded-md bg-[#fdf9f3]"
              rows={3}
              disabled
            />
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 text-right">
          <button
            onClick={handleSignOut}
            className="bg-[#c2703d] text-white px-6 py-2 rounded hover:bg-[#a55c30] transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
