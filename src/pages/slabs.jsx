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

import marble1 from "../images/marble1.png";
import marble2 from "../images/marble2.png";
import marble3 from "../images/marble3.png";
import marble4 from "../images/marble4.png";
import marble5 from "../images/marble5.png";
import marble6 from "../images/marble6.png";
import marble7 from "../images/marble7.png";
import marble8 from "../images/marble8.png";

import granite1 from "../images/granite1.png";
import granite2 from "../images/granite2.png";
import granite3 from "../images/granite3.png";
import granite4 from "../images/granite4.png";
import granite5 from "../images/granite5.png";
import granite6 from "../images/granite6.png";
import granite7 from "../images/granite7.png";
import granite8 from "../images/granite8.png";

export default function Slabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = location.state?.fromAdmin || false;
  const [activeTab, setActiveTab] = useState("marble"); // default

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type") || "marble";
    setActiveTab(type.toLowerCase());
  }, [location.search]);

  const [filters, setFilters] = useState({ category: [], size: [], color: [] });
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const marbleImages = [
    marble1,
    marble2,
    marble3,
    marble4,
    marble5,
    marble6,
    marble7,
    marble8,
  ];
  const graniteImages = [
    granite1,
    granite2,
    granite3,
    granite4,
    granite5,
    granite6,
    granite7,
    granite8,
  ];
  const graniteData = [
    {
      name: "Black Galaxy Granite",
      desc: "Classic black finish with golden speckles. Perfect for countertops and vanities.",
    },
    {
      name: "Ruby Red Granite",
      desc: "Deep red granite with dark veins. Ideal for bold, statement interiors.",
    },
    {
      name: "Alaska White Granite",
      desc: "Bright white granite with subtle gray patterns. Enhances modern kitchens.",
    },
    {
      name: "Steel Grey Granite",
      desc: "Mid-tone grey with consistent grain. Suitable for both floors and facades.",
    },
    {
      name: "Ivory Brown Granite",
      desc: "A warm blend of beige and brown. Great for cozy living spaces.",
    },
    {
      name: "Forest Green Granite",
      desc: "Natural green with dark accents. Adds a lush, earthy feel to any setting.",
    },
    {
      name: "Blue Pearl Granite",
      desc: "Luxurious blue granite with a shimmering finish. A favorite for luxury spaces.",
    },
    {
      name: "Tan Brown Granite",
      desc: "Dark brown with chocolate and black flecks. Durable and elegant.",
    },
  ];

  const marbleData = [
    {
      name: "Golden Emperador Marble",
      desc: "Rich golden tones with dramatic dark veins. A luxurious choice for upscale interiors.",
    },
    {
      name: "Rosa Aurora Marble",
      desc: "Soft pink hue with delicate veining. Ideal for bathrooms and serene settings.",
    },
    {
      name: "Verde Alpi Marble",
      desc: "Deep green marble with white veins. Adds bold character to any space.",
    },
    {
      name: "Crema Marfil Marble",
      desc: "Creamy beige marble, classic and versatile. Matches any decor style.",
    },
    {
      name: "Carrara White Marble",
      desc: "Iconic white marble with soft gray veins. A timeless choice for elegant surfaces.",
    },
    {
      name: "Jaisalmer Yellow Marble",
      desc: "Warm golden-yellow tones. Popular in Indian architecture and temples.",
    },
    {
      name: "Calacatta Gold Marble",
      desc: "White marble with bold gold and brown veins. Premium and eye-catching.",
    },
    {
      name: "Udaipur Green Marble",
      desc: "Bright green marble with natural white veining. Eco-inspired and unique.",
    },
  ];

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
      {/* === HEADER === */}
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
                <div
                  className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-4 gap-10
    w-[1200px] max-w-screen-xl z-50 text-base font-sans transform translate-x-[100px]"
                >
                  {/* CATEGORY */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      CATEGORY
                    </h3>
                    {[
                      { name: "Marble", to: "/slabs?type=marble" },
                      { name: "Granite", to: "/slabs?type=granite" },
                      { name: "Tiles", to: "/ceramics?type=tiles" },
                      { name: "Sinks", to: "/ceramics?type=sinks" },
                      { name: "Bathtubs", to: "/ceramics?type=bathtub" },
                      { name: "Toilets", to: "/ceramics?type=toilets" },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="block text-gray-700 hover:text-blue-600 mb-3 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* WALL TILES */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      WALL TILES
                    </h3>
                    {[
                      "Bathroom Wall Tiles",
                      "Kitchen Wall Tiles",
                      "Outdoor Wall Tiles",
                      "Living Room Wall Tiles",
                      "Bedroom Wall Tiles",
                      "Wall Tiles for Commercial Spaces",
                    ].map((item) => (
                      <span key={item} className="block text-gray-700 mb-3">
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* FLOOR TILES */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      FLOOR TILES
                    </h3>
                    {[
                      "Living Room Floor Tiles",
                      "Outdoor Floor Tiles",
                      "Bedroom Floor Tiles",
                      "Kitchen Floor Tiles",
                      "Bathroom Floor tiles",
                      "Floor Tiles for Commercial Spaces",
                    ].map((item) => (
                      <span key={item} className="block text-gray-700 mb-3">
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* TILE FINDER */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      TILE FINDER
                    </h3>
                    <select className="w-full mb-4 p-3 border border-gray-300 rounded text-gray-700 hover:border-blue-500 transition-colors">
                      <option>Select Size</option>
                      <option>12x12</option>
                      <option>16x16</option>
                      <option>24x24</option>
                    </select>
                    <select className="w-full mb-4 p-3 border border-gray-300 rounded text-gray-700 hover:border-blue-500 transition-colors">
                      <option>Select Finish</option>
                      <option>Glossy</option>
                      <option>Matte</option>
                      <option>Textured</option>
                    </select>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                      Search
                    </button>
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

      {/* Hero Section */}
      <section
        className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center shadow-inner"
        style={{ backgroundImage: `url(${slabBanner})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
            Premium Slabs Collection
          </h1>
          <p className="text-lg md:text-xl mt-4 font-light">
            Elegant Marbles & Durable Granites for Every Space
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Explore by Type</h2>
          <p className="text-gray-600 text-lg mt-2">
            Select a slab type and filter by attributes
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter Panel */}
          <aside className="w-full lg:w-[260px] space-y-8">
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Filters</h3>

              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Category</h4>
                  {["Marble", "Granite"].map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(item)}
                        onChange={() => toggleFilter("category", item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>

                {/* Size Filter */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Size</h4>
                  {["8x4 ft", "10x5 ft", "12x6 ft"].map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.size.includes(item)}
                        onChange={() => toggleFilter("size", item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Color</h4>
                  {["White", "Black", "Gray", "Beige"].map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.color.includes(item)}
                        onChange={() => toggleFilter("color", item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex gap-4 flex-wrap mb-8 justify-center md:justify-start">
              {["marble", "granite"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    activeTab === type
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Slabs
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activeTab === "granite" &&
                graniteImages.map((img, i) => {
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                    >
                      <div className="relative">
                        <img
                          src={img}
                          alt={graniteData[i].name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800">
                          {graniteData[i].name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {graniteData[i].desc}
                        </p>
                        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}

                {activeTab === "marble" &&
                  marbleImages.map((img, i) => {
                    const marbleData = [
                      {
                        name: "Golden Emperador Marble",
                        desc: "Golden tones with bold dark veins. Premium interior choice.",
                      },
                      {
                        name: "Rosa Aurora Marble",
                        desc: "Soft pink marble with delicate lines. Ideal for bathrooms.",
                      },
                      {
                        name: "Verde Alpi Marble",
                        desc: "Dark green marble with white veins. Striking and rich.",
                      },
                      {
                        name: "Crema Marfil Marble",
                        desc: "Beige marble, elegant and timeless. Works in all spaces.",
                      },
                      {
                        name: "Carrara White Marble",
                        desc: "Classic white marble with light gray veining. Versatile look.",
                      },
                      {
                        name: "Jaisalmer Yellow Marble",
                        desc: "Warm yellow marble from Rajasthan. Great for sunny interiors.",
                      },
                      {
                        name: "Calacatta Gold Marble",
                        desc: "White with dramatic gold veins. Perfect for luxury designs.",
                      },
                      {
                        name: "Udaipur Green Marble",
                        desc: "Natural green tones. Durable and nature-inspired style.",
                      },
                    ];

                    return (
                      <div
                        key={i}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                      >
                        <div className="relative">
                          <img
                            src={img}
                            alt={marbleData[i].name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-800">
                            {marbleData[i].name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {marbleData[i].desc}
                          </p>
                          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 sm:px-10 py-12 mt-16 text-sm">
        {/* Top Section - 6 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {/* Column 1: Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Patel Ceramics</h3>
            <p className="text-gray-300">
              Crafting beauty in every tile. Serving excellence across India and
              globally.
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Wall Tiles</li>
              <li>Floor Tiles</li>
              <li>Sanitaryware</li>
              <li>Granite & Marble</li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>About Us</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>

          {/* Column 4: Who We Serve */}
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

          {/* Column 5: What We Do */}
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

          {/* Column 6: Follow Us */}
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

        {/* Divider */}
        <hr className="border-t border-gray-700 mb-6" />

        {/* Bottom Row */}
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
