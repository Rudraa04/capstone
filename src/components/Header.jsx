  import React, { useState } from 'react';
  import { Link } from 'react-router-dom';
  import { FaSearch } from 'react-icons/fa';

  export default function Header() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState([]);
    const [size, setSize] = useState([]);
    const [color, setColor] = useState([]);

    const toggleFilter = (setter, value, state) => {
      setter(
        state.includes(value) ? state.filter((item) => item !== value) : [...state, value]
      );
    };

    const handleSearch = () => {
      console.log('Search with filters:', { query, category, size, color });
      // Implement real search logic or backend call here
    };

    const categories = ['Tiles', 'Marble', 'Granite'];
    const sizes = ['12x12', '16x16', '24x24'];
    const colors = ['White', 'Gray', 'Black'];

    return (
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
        <div className="w-full flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-extrabold tracking-wider text-black pl-2">
            PATEL CERAMIC
          </Link>

          {/* Multi-Filter Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm space-x-2 w-[700px] max-w-full">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm px-2"
              />

              {/* Filter Dropdowns */}
              {[
                { label: 'Category', options: categories, value: category, setter: setCategory },
                { label: 'Size', options: sizes, value: size, setter: setSize },
                { label: 'Color', options: colors, value: color, setter: setColor }
              ].map(({ label, options, value, setter }) => (
                <div key={label} className="relative group">
                  {/* Filter Button */}
                  <button className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition font-medium">
                    {label}
                  </button>

                  {/* Dropdown Content */}
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

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-md transition"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-black text-base font-medium transition">Home</Link>
            <Link to="/login" className="text-gray-700 hover:text-black text-base font-medium transition">Login</Link>
            <Link to="/signup" className="text-gray-700 hover:text-black text-base font-medium transition">Sign Up</Link>
            <Link to="/cart" className="text-gray-700 hover:text-black text-base font-medium transition">Cart</Link>
            <Link to="/profile" className="text-gray-700 hover:text-black text-base font-medium transition">Profile</Link>
          </div>
        </div>
      </header>
    );
  }
