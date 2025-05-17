import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <div className="w-full flex justify-between items-center">
        {/* Logo aligned far left */}
        <Link to="/" className="text-2xl md:text-3xl font-extrabold tracking-wider text-black pl-2">
          PATEL CERAMICS
        </Link>

        {/* Search Bar centered */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 w-[400px] max-w-full border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm"
          />
        </div>

        {/* Nav links on right */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-black text-base font-medium transition">
            Home
          </Link>
          <Link to="/login" className="text-gray-700 hover:text-black text-base font-medium transition">
            Login
          </Link>
          <Link to="/signup" className="text-gray-700 hover:text-black text-base font-medium transition">
            Sign Up
          </Link>
          <Link to="/cart" className="text-gray-700 hover:text-black text-base font-medium transition">
            Cart
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-black text-base font-medium transition">
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
  