import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import slabBanner from "../images/slabs-banner.png";

export default function Ceramics() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get("type") || "tiles";
  const [activeTab, setActiveTab] = useState(initialType.toLowerCase());
  const [filters, setFilters] = useState({ category: [], size: [], color: [] });
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  return (
    <div className="bg-white text-gray-900">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-700 hover:text-blue-900"
            >
              <FaArrowLeft size={18} />
            </button>
            <Link
              to="/"
              className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wide"
            >
              PATEL CERAMICS
            </Link>
          </div>

          <div className="hidden md:flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full max-w-md hover:border-gray-600 transition-colors duration-200">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base px-2 text-gray-700 font-medium"
            />
            <button
              onClick={() => console.log("Search query:", query)}
              className="text-blue-600 hover:text-blue-800 p-1"
            >
              <FaSearch size={18} />
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[16px] font-medium text-gray-700">
            <Link to="/" className={`uppercase ${underlineHover}`}>
              Home
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProductDropdown(!showProductDropdown)}
                className={`uppercase ${underlineHover}`}
              >
                Products
              </button>
              {showProductDropdown && (
                <div className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-4 gap-10 w-[1200px] max-w-screen-xl z-50 text-base font-sans translate-x-[100px]">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      CATEGORY
                    </h3>
                    {[
                      "Marble",
                      "Granite",
                      "Tiles",
                      "Sinks",
                      "Bathtubs",
                      "Toilets",
                    ].map((item) => (
                      <Link
                        key={item}
                        to={`/ceramics?type=${item.toLowerCase()}`}
                        className="block text-gray-700 hover:text-blue-600 mb-3 transition-colors"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {user ? (
              <>
                <Link
                  to="/cart"
                  className={`uppercase ${underlineHover} flex items-center gap-1`}
                >
                  <FaShoppingCart /> Cart
                </Link>
                <Link
                  to="/profile"
                  state={
                    localStorage.getItem("fromAdmin") === "true"
                      ? { fromAdmin: true }
                      : {}
                  }
                  className={`uppercase ${underlineHover} flex items-center gap-1`}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className={`uppercase text-red-500 hover:text-red-600 ${underlineHover}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={`uppercase ${underlineHover}`}>
                Login/Signup
              </Link>
            )}
          </nav>

          <button
            className="md:hidden text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-4">
            <div className="flex items-center border rounded-full px-4 py-2 bg-gray-100 shadow-sm my-4">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base px-2"
              />
              <button
                onClick={() => console.log("Search query:", query)}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <FaSearch size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-4 text-[16px] font-medium text-gray-700">
              <Link to="/" className="uppercase">
                Home
              </Link>
              <Link to="/slabs" className="uppercase">
                Slabs
              </Link>
              <Link to="/ceramics" className="uppercase">
                Ceramics
              </Link>
              {user ? (
                <>
                  <Link to="/cart" className="uppercase">
                    Cart
                  </Link>
                  <Link
                    to="/profile"
                    state={
                      localStorage.getItem("fromAdmin") === "true"
                        ? { fromAdmin: true }
                        : {}
                    }
                    className={`uppercase ${underlineHover} flex items-center gap-1`}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="uppercase text-left text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="uppercase">
                  Login/Signup
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${slabBanner})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Finest Ceramic Fixtures</h1>
          <p className="text-lg">
            Stylish Tiles, Sinks, and Sanitaryware for Elegant Interiors
          </p>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Explore Ceramic Products</h2>
          <p className="text-gray-600">
            Choose a category and filter your options
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* FILTER SIDEBAR */}
          <aside className="w-full lg:w-[220px] space-y-8">
            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Filter Products
              </h3>
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">
                  Search by Category
                </h4>
                {["Tiles", "Sinks", "Bathtubs", "Toilets"].map((option) => (
                  <label
                    key={option}
                    className="block text-sm text-gray-800 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.category.includes(option)}
                      onChange={() => toggleFilter("category", option)}
                    />
                    {option}
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">
                  Search by Size
                </h4>
                {["12x12", "16x16", "24x24", "30x30"].map((option) => (
                  <label
                    key={option}
                    className="block text-sm text-gray-800 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.size.includes(option)}
                      onChange={() => toggleFilter("size", option)}
                    />
                    {option}
                  </label>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Search by Color
                </h4>
                {["White", "Ivory", "Beige", "Gray", "Black"].map((option) => (
                  <label
                    key={option}
                    className="block text-sm text-gray-800 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.color.includes(option)}
                      onChange={() => toggleFilter("color", option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-4 mb-8">
              {["tiles", "bathtub", "sinks", "toilets"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold border ${
                    activeTab === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition"
                >
                  <img
                    src={`https://source.unsplash.com/400x300/?${activeTab},ceramic&sig=${i}`}
                    alt={`Ceramic ${i + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} #
                      {i + 1}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Elegant and functional. Designed for modern spaces.
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white px-4 sm:px-10 py-12 mt-16 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Patel Ceramics</h3>
            <p className="text-gray-300">
              Crafting beauty in every tile. Serving excellence across India and
              globally.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Wall Tiles</li>
              <li>Floor Tiles</li>
              <li>Sanitaryware</li>
              <li>Granite & Marble</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>About Us</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Who We Serve</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Homeowners</li>
              <li>Architects</li>
              <li>Interior Designers</li>
              <li>Builders & Contractors</li>
              <li>Commercial Spaces</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">What We Do</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Tile Manufacturing</li>
              <li>Custom Design</li>
              <li>Bulk Orders</li>
              <li>Quality Assurance</li>
              <li>Nationwide Delivery</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4 text-white text-lg">
              <span role="img" aria-label="web">
                🌐
              </span>
              <span role="img" aria-label="facebook">
                📘
              </span>
              <span role="img" aria-label="instagram">
                📸
              </span>
              <span role="img" aria-label="youtube">
                ▶
              </span>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-700 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 gap-4 text-sm">
          <p>© 2025 Patel Ceramics. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Use
            </a>
            <a href="#" className="hover:text-white">
              Sitemap
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
