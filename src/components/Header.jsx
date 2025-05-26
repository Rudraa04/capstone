import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔧 State for search and filters
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState([]);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);

  const categories = ['Tiles', 'Marble', 'Granite'];
  const sizes = ['12x12', '16x16', '24x24'];
  const colors = ['White', 'Gray', 'Black'];

  // Toggle filter checkbox
  const toggleFilter = (setter, value, state) => {
    setter(state.includes(value)
      ? state.filter((item) => item !== value)
      : [...state, value]
    );
  };

  const handleSearch = () => {
    console.log('Search with filters:', { query, category, size, color });
    // Implement actual search or navigation
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <div className="w-full flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-black">PATEL CERAMICS</Link>

        {/* Multi-Filter Search Bar */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm space-x-2 w-[700px] max-w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm px-2"
            />

            {[
              { label: 'Category', options: categories, value: category, setter: setCategory },
              { label: 'Size', options: sizes, value: size, setter: setSize },
              { label: 'Color', options: colors, value: color, setter: setColor }
            ].map(({ label, options, value, setter }) => (
              <div key={label} className="relative group">
                <button className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition font-medium">
                  {label}
                </button>
                <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 bg-white border border-gray-200 rounded-md shadow-lg w-48 transition-all duration-200">
                  <div className="p-2 space-y-1">
                    {options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 text-sm text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={value.includes(option)}
                          onChange={() => toggleFilter(setter, option, value)}
                          className="accent-orange-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
            >
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-black text-base font-medium transition">Home</Link>

          {!isLoggedIn && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-black text-base font-medium transition">Login</Link>
              <Link to="/signup" className="text-gray-700 hover:text-black text-base font-medium transition">Sign Up</Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-black text-base font-medium transition">Profile</Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-black text-base font-medium transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
