import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

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

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(storedCart.length);
    };

    updateCartCount(); // Initial check

    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/all");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchAllProducts();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  const handleSearch = (input) => {
    const rawQuery = input || query;
    const trimmedQuery = rawQuery
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/gi, "");
    const routeMap = [
      // Specific phrases FIRST
      {
        keywords: ["exterior wall tiles", "exterior wall"],
        route: "/exterior?sub=Exterior%20Wall%20Tiles",
      },
      {
        keywords: ["exterior floor tiles", "exterior floor"],
        route: "/exterior?sub=Exterior%20Floor%20Tiles",
      },
      {
        keywords: ["interior floor tiles", "interior floor"],
        route: "/interior?sub=Interior%20Floor%20Tiles",
      },
      {
        keywords: ["bathroom tiles", "bathroom wall", "bathroom wall tiles"],
        route: "/interior?sub=Bathroom%20Wall%20Tiles",
      },
      {
        keywords: ["kitchen wall tiles", "kitchen tiles", "kitchen"],
        route: "/interior?sub=Kitchen%20Wall%20Tiles",
      },

      // General categories
      { keywords: ["interior", "interior tiles"], route: "/interior" },
      { keywords: ["exterior", "exterior tiles"], route: "/exterior" },
      {
        keywords: ["sanitary", "sanitaryware", "toilet", "sink", "bathtub"],
        route: "/sanitary",
      },
      { keywords: ["slab", "slabs", "granite", "marble"], route: "/slabs" },
      { keywords: ["ceramic", "ceramics"], route: "/ceramics?type=tiles" },
      { keywords: ["tile", "tiles"], route: "/ceramics?type=tiles" },

      // Suggestions
      {
        keywords: ["bathroom", "washroom"],
        suggest: ["tiles", "bathtubs", "sinks", "toilets"],
      },
    ];

    for (const entry of routeMap) {
      if (entry.route && entry.keywords.some((k) => trimmedQuery.includes(k))) {
        navigate(entry.route);
        return;
      }

      if (
        entry.suggest &&
        entry.keywords.some((k) => trimmedQuery.includes(k))
      ) {
        alert(`You might be looking for: ${entry.suggest.join(", ")}`);
        return;
      }
    }

    alert("No matching category found.");
    setSuggestions([]);
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="bg-white text-gray-900">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
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

          <div className="hidden md:block relative w-full max-w-md">
            <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);

                  if (value.length > 1) {
                    const filtered = products.filter((product) =>
                      product.Name?.toLowerCase().includes(value.toLowerCase())
                    );
                    setSuggestions(filtered);
                  } else {
                    setSuggestions([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1 bg-transparent outline-none text-base text-gray-700 font-medium"
              />

              <button
                onClick={() => handleSearch()}
                className="ml-2 text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                <FaSearch size={18} />
              </button>
            </div>

            {/* 🔍 Search Suggestions with Image */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 top-full mt-2 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg z-50">
                {suggestions.map((product, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate(
                        `/product/${product.category.toLowerCase()}/${
                          product._id
                        }`
                      );
                      setSuggestions([]);
                      setQuery("");
                    }}
                  >
                    <img
                      src={product.Image || "https://via.placeholder.com/40x40"}
                      alt={product.Name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                    <div>
                      <p className="text-sm font-semibold">{product.Name}</p>
                      <p className="text-xs text-gray-500">
                        {product.category}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
                <div className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-2 gap-8 w-[600px] z-50 text-base font-sans translate-x-[100px]">
                  {" "}
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
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      WALL / FLOOR TILES
                    </h3>
                    {[
                      {
                        name: "Exterior Floor Tiles",
                        to: "/exterior?sub=Exterior Floor Tiles",
                      },
                      {
                        name: "Exterior Wall Tiles",
                        to: "/exterior?sub=Exterior Wall Tiles",
                      },
                      {
                        name: "Kitchen Wall Tiles",
                        to: "/interior?sub=Kitchen Wall Tiles",
                      },
                      {
                        name: "Bathroom Wall Tiles",
                        to: "/interior?sub=Bathroom Wall Tiles",
                      },
                      {
                        name: "Interior Floor Tiles",
                        to: "/interior?sub=Interior Floor Tiles",
                      },
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
                </div>
              )}
            </div>
            {user ? (
              <>
                <Link
                  to="/cart"
                  className={`uppercase ${underlineHover} flex items-center gap-1`}
                >
                  <FaShoppingCart />
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-1 font-bold text-blue-600">
                      ({cartCount})
                    </span>
                  )}
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
            <div className="block md:hidden relative w-full max-w-md mb-4">
              <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuery(value);

                    if (value.length > 1) {
                      const filtered = products.filter((product) =>
                        product.Name?.toLowerCase().includes(
                          value.toLowerCase()
                        )
                      );
                      setSuggestions(filtered);
                    } else {
                      setSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="flex-1 bg-transparent outline-none text-base text-gray-700 font-medium"
                />

                <button
                  onClick={() => handleSearch()}
                  className="ml-2 text-blue-600 hover:text-blue-800 flex items-center justify-center"
                >
                  <FaSearch size={18} />
                </button>
              </div>

              {/* 🔍 Search Suggestions with Image */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-2 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg z-50">
                  {suggestions.map((product, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate(
                          `/product/${product.category.toLowerCase()}/${
                            product._id
                          }`
                        );
                        setSuggestions([]);
                        setQuery("");
                      }}
                    >
                      <img
                        src={
                          product.Image || "https://via.placeholder.com/40x40"
                        }
                        alt={product.Name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                      <div>
                        <p className="text-sm font-semibold">{product.Name}</p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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

      {/* CATEGORY FILTER BUTTONS */}
      <div className="flex flex-wrap gap-4 justify-center mt-8 mb-6">
        {[
          "All",
          "Marble",
          "Granite",
          "Tiles",
          "Toilets",
          "Sinks",
          "Bathtubs",
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat.toLowerCase())}
            className={`px-6 py-2 rounded-full text-sm font-semibold border ${
              selectedCategory === cat.toLowerCase()
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={
                    product.Image ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={product.Name || "No Name"}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {product.Name || "No Name"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {product.Description || "No description available"}
                </p>
                <button
                  onClick={() => {
                    const validTypes = [
                      "tiles",
                      "sinks",
                      "toilets",
                      "marble",
                      "granite",
                      "bathtubs",
                    ];
                    const type = product.category?.toLowerCase();
                    if (!type || !validTypes.includes(type)) {
                      alert(
                        "❌ Invalid product type. Cannot navigate to details."
                      );
                      return;
                    }
                    navigate(`/product/${type}/${product._id}`);
                  }}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium inline-block text-center"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
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
            <li>
              <a href="/interior">Interior</a>
            </li>
            <li>
              <a href="/exterior">Exterior</a>
            </li>
            <li>
              <a href="/sanitary">Sanitaryware</a>
            </li>
            <li>
              <a href="/slabs">Granite & Marble</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/projects">Projects</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Who We Serve */}
        <div>
          <h4 className="font-semibold mb-4">Who We Serve</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/serve/homeowners">Homeowners</a>
            </li>
            <li>
              <a href="/serve/architects">Architects</a>
            </li>
            <li>
              <a href="/serve/designers">Interior Designers</a>
            </li>
            <li>
              <a href="/serve/builders">Builders & Contractors</a>
            </li>
            <li>
              <a href="/serve/commercial">Commercial Spaces</a>
            </li>
          </ul>
        </div>

        {/* Column 5: What We Do */}
        <div>
          <h4 className="font-semibold mb-4">What We Do</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/services/custom-design">Custom Design</a>
            </li>
            <li>
              <a href="/services/bulk-orders">Bulk Orders</a>
            </li>
            <li>
              <a href="/services/quality">Quality Assurance</a>
            </li>
            <li>
              <a href="/services/delivery">Nationwide Delivery</a>
            </li>
          </ul>
        </div>

        {/* Column 6: Follow Us */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-white text-lg">
            <a
              href="https://www.patelceramics.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              🌐
            </a>
            <a
              href="https://facebook.com/patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              📘
            </a>
            <a
              href="https://instagram.com/patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              📸
            </a>
            <a
              href="https://youtube.com/@patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-700 mb-6" />

      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 gap-4 text-sm">
        <p>© {new Date().getFullYear()} Patel Ceramics. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms of Use
          </a>
          <a href="/sitemap" className="hover:text-white">
            Sitemap
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default AllProducts;
