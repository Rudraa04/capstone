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

export default function Slabs() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("marble");
  const [graniteProducts, setGraniteProducts] = useState([]);
  const [marbleProducts, setMarbleProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    size: [],
    color: [],
    origin: [],
  });
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const [granite, setGranite] = useState([]);

  const filterOptions = {
    marble: {
      size: ["75 x 38", "72 x 36", "80 x 38", "75 x 36"],
      color: ["Milky White", "Green", "Gold", "Light Pink", "Beige"],
      origin: ["West India", "South India", "North India"],
    },
    granite: {
      size: [
        "102x38",
        "104x38",
        "104x40",
        "108x40",
        "108x42",
        "110x40",
        "110x42",
        "110x43",
        "110x44",
      ],
      color: ["Black", "Red", "Grey", "White"],
      origin: ["South India", "North India", "West India"],
    },
  };
  //mapping for granite
  const mapGraniteColor = (color) => {
    if (!color) return "";
    const c = color.toLowerCase();
    if (c.includes("black")) return "Black";
    if (c.includes("red")) return "Red";
    if (c.includes("grey") || c.includes("gray")) return "Grey";
    if (c.includes("white")) return "White";
    return "";
  };

  const mapGraniteOrigin = (origin) => {
    if (!origin) return "";
    const o = origin.toLowerCase();
    if (o.includes("south")) return "South India";
    if (o.includes("north")) return "North India";
    if (o.includes("west")) return "West India";
    return "";
  };
  const mapGraniteSize = (size) => {
    if (!size) return "";
    const s = size.toLowerCase().replace(/\s/g, "");
    if (s.includes("104x38")) return "104x38";
    if (s.includes("108x40")) return "108x40";
    if (s.includes("108x42")) return "108x42";
    if (s.includes("110x42")) return "110x42";
    if (s.includes("110x44")) return "110x44";
    return "";
  };

  //mapping for marble
  const mapMarbleSize = (size) => {
    if (!size) return "";
    const s = size.toLowerCase().replace(/\s/g, "");
    if (s.includes("75x38")) return "75 x 38";
    if (s.includes("72x36")) return "72 x 36";
    if (s.includes("80x38")) return "80 x 38";
    if (s.includes("75x36")) return "75 x 36";
    return "";
  };

  const mapMarbleColor = (color) => {
    if (!color) return "";
    const c = color.toLowerCase();
    if (c.includes("milky")) return "Milky White";
    if (c.includes("green")) return "Green";
    if (c.includes("gold")) return "Gold";
    if (c.includes("pink")) return "Light Pink";
    if (c.includes("beige")) return "Beige";
    return "";
  };

  const mapMarbleOrigin = (origin) => {
    if (!origin) return "";
    const o = origin.toLowerCase();
    if (o.includes("west")) return "West India";
    if (o.includes("south")) return "South India";
    if (o.includes("north")) return "North India";
    return "";
  };

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

  useEffect(() => {
    const fetchMarbleProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/marble"
        );
        const data = await response.json();
        setMarbleProducts(data);
      } catch (error) {
        console.error("Error fetching marble products:", error);
      }
    };
    fetchMarbleProducts();
  }, []);

  useEffect(() => {
    const fetchGraniteProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/granite"
        );
        const data = await response.json();
        setGraniteProducts(data);
      } catch (error) {
        console.error("Error fetching granite products:", error);
      }
    };
    fetchGraniteProducts();
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
  //filter granite products based on selected filters
  const filteredGranite = graniteProducts.filter((product) => {
    const sizeValue = mapGraniteSize(product.Size || "");
    const colorValue = mapGraniteColor(product.Color || "");
    const originValue = mapGraniteOrigin(product.Origin || "");

    const sizeMatch =
      !filters.size ||
      filters.size.length === 0 ||
      filters.size.includes(sizeValue);
    const colorMatch =
      !filters.color ||
      filters.color.length === 0 ||
      filters.color.includes(colorValue);
    const originMatch =
      !filters.origin ||
      filters.origin.length === 0 ||
      filters.origin.includes(originValue);

    return sizeMatch && colorMatch && originMatch;
  });
  //filter marble products based on selected filters
  const filteredMarble = marbleProducts.filter((product) => {
    const sizeValue = mapMarbleSize(product.Size || "");
    const colorValue = mapMarbleColor(product.Color || "");
    const originValue = mapMarbleOrigin(product.Origin || "");

    const sizeMatch =
      !filters.size ||
      filters.size.length === 0 ||
      filters.size.includes(sizeValue);
    const colorMatch =
      !filters.color ||
      filters.color.length === 0 ||
      filters.color.includes(colorValue);
    const originMatch =
      !filters.origin ||
      filters.origin.length === 0 ||
      filters.origin.includes(originValue);

    return sizeMatch && colorMatch && originMatch;
  });

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
      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-12">
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
                {/* Size Filter */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Size</h4>
                  {(filterOptions[activeTab]?.size || []).map((item) => (
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
                  {(filterOptions[activeTab]?.color || []).map((item) => (
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
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">
                    Place of Origin
                  </h4>
                  {(filterOptions[activeTab]?.origin || []).map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.origin.includes(item)}
                        onChange={() => toggleFilter("origin", item)}
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
                filteredGranite.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={product.Image}
                        alt={product.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {product.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.Description}
                      </p>
                      <Link to={`/product/granite/${product._id}`}>
                        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}

              {activeTab === "marble" &&
                filteredMarble.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={product.Image}
                        alt={product.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {product.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.Description}
                      </p>
                      <Link
                        to={`/product/marble/${product._id}`}
                        state={{ fromTab: "marble" }}
                      >
                        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
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
