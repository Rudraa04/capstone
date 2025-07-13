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
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/all"); // your new backend route
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
                                  { name: "Exterior Floor Tiles", to: "/exteriorfloor" },
                                  { name: "Exterior Wall Tiles", to: "/exteriorwall" },
                                  { name: "Kitchen Wall Tiles", to: "/kitchenwall" },
                                  { name: "Bathroom Wall Tiles", to: "/bathroomwall" },
                                  { name: "Interior Floor Tiles", to: "/interiorfloor" },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div
            key={index}
            className="border rounded p-4 shadow hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <img
                src={
                  product.Image ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={product.Name || "No Name"}
                className="h-40 w-full object-cover mb-3"
              />
              <h2 className="text-lg font-semibold">
                {product.Name || "No Name"}
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                {product.Description || "No description available"}
              </p>
              <p className="font-bold mb-4">₹{product.Price ?? "N/A"}</p>
            </div>

            <button
              onClick={() => {
                const validTypes = [
                  "tiles",
                  "sinks",
                  "toilets",
                  "marble",
                  "granite",
                ];
                const type = product.category?.toLowerCase(); // ✅ FIXED HERE

                if (!type || !validTypes.includes(type)) {
                  alert("❌ Invalid product type. Cannot navigate to details.");
                  return;
                }

                navigate(`/product/${type}/${product._id}`);
              }}
              className="mt-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

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
            <h4 className="font-semibold mb-4">What We </h4>
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
};

export default AllProducts;
