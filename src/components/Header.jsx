import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaSearch, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { auth } from "../firebase/firebase";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

 const handleSearch = () => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return;

  // 🔹 Direct Category Matching
  if (trimmed.includes("marble")) {
    navigate("/slabs?type=marble");
  } else if (trimmed.includes("granite")) {
    navigate("/slabs?type=granite");
  } else if (trimmed.includes("tile") || trimmed.includes("tiles")) {
    navigate("/ceramics?type=tiles");
  } else if (trimmed.includes("bathtub")) {
    navigate("/ceramics?type=bathtub");
  } else if (trimmed.includes("sink")) {
    navigate("/ceramics?type=sinks");
  } else if (trimmed.includes("toilet")) {
    navigate("/ceramics?type=toilets");

  // 🔹 SubCategory Handling
  } else if (trimmed.includes("interior floor")) {
    navigate("/interior?sub=Interior Floor Tiles");
  } else if (trimmed.includes("interior wall")) {
    navigate("/interior?sub=Interior Wall Tiles");
  } else if (trimmed.includes("bathroom")) {
    navigate("/interior?sub=Bathroom Wall Tiles");
  } else if (trimmed.includes("kitchen")) {
    navigate("/interior?sub=Kitchen Wall Tiles");
  } else if (trimmed.includes("exterior wall")) {
    navigate("/exterior?sub=Exterior Wall Tiles");
  } else if (trimmed.includes("exterior floor")) {
    navigate("/exterior?sub=Exterior Floor Tiles");

  // 🔹 Fallback
  } else {
    alert("No matching category found.");
    
  }

  setSuggestions([]);
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
    const fetchAllCategories = async () => {
      try {
        const tilesRes = await fetch(
          "http://localhost:5000/api/products/tiles"
        );
        const sinksRes = await fetch(
          "http://localhost:5000/api/products/sinks"
        );
        const graniteRes = await fetch(
          "http://localhost:5000/api/products/granite"
        );
        const marbleRes = await fetch(
          "http://localhost:5000/api/products/marble"
        );
        const toiletsRes = await fetch(
          "http://localhost:5000/api/products/toilets"
        );

        const tiles = await tilesRes.json();
        const sinks = await sinksRes.json();
        const granite = await graniteRes.json();
        const marble = await marbleRes.json();
        const toilets = await toiletsRes.json();

        const combined = [
          ...tiles.map((item) => ({ ...item, category: "Tiles" })),
          ...sinks.map((item) => ({ ...item, category: "Sinks" })),
          ...granite.map((item) => ({ ...item, category: "Granite" })),
          ...marble.map((item) => ({ ...item, category: "Marble" })),
          ...toilets.map((item) => ({ ...item, category: "Toilets" })),
        ];

        setAllProducts(combined);
      } catch (error) {
        console.error("Error fetching category products:", error);
      }
    };

    fetchAllCategories();
  }, []);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalCount);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wide"
        >
          PATEL CERAMICS
        </Link>

        <div className="relative w-full max-w-md">
          <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);

                if (value.length > 1) {
                  const filtered = allProducts.filter((product) =>
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
              onClick={handleSearch}
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
                    <p className="text-xs text-gray-500">{product.category}</p>
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

        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4">
          <div className="flex items-center border rounded-full px-4 py-2 bg-gray-100 shadow-sm my-4">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);

                if (value.length > 1) {
                  const filtered = allProducts.filter((product) =>
                    product.Name?.toLowerCase().includes(value.toLowerCase())
                  );
                  setSuggestions(filtered);
                } else {
                  setSuggestions([]);
                }
              }}
              className="flex-1 bg-transparent outline-none text-base px-2"
            />
            <button className="text-blue-600 hover:text-blue-800 p-1">
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
                  className={`uppercase ${underlineHover}`}
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
  );
}
