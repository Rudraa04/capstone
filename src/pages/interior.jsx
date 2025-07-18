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
import Footer from "../components/Footer";

export default function Interior() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const queryParams = new URLSearchParams(location.search);
  const selectedSubCategory = queryParams.get("sub");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [cartCount, setCartCount] = useState(0);

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  useEffect(() => {
  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(storedCart.length); // Just count distinct products
  };

  updateCartCount();

  window.addEventListener("cartUpdated", updateCartCount);
  return () => {
    window.removeEventListener("cartUpdated", updateCartCount);
  };
}, []);


  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const endpoints = ["tiles", "sinks", "granite", "marble", "toilets"];
        const allFetched = await Promise.all(
          endpoints.map((type) =>
            fetch(`http://localhost:5000/api/products/${type}`).then((res) =>
              res.json()
            )
          )
        );
        const combined = endpoints.flatMap((type, index) =>
          allFetched[index].map((item) => ({
            ...item,
            category: type,
          }))
        );
        setAllProducts(combined);
      } catch (err) {
        console.error("Failed to fetch products for search:", err);
      }
    };

    fetchAllProducts();
  }, []);

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

  const handleSearch = () => {
    if (query.length > 1) {
      const filtered = allProducts.filter((product) =>
        product.Name?.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/tiles")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((tile) => {
          const sub = tile.SubCategory?.toLowerCase() || "";
          return selectedSubCategory
            ? sub === selectedSubCategory.toLowerCase()
            : sub.includes("interior") ||
                sub.includes("bathroom") ||
                sub.includes("kitchen");
        });

        setTiles(filtered);
      })
      .catch((err) => console.error("Error fetching tiles:", err));
  }, [selectedSubCategory]);

  return (
    <div className="bg-white text-gray-900 font-sans">
      {/*  HEADER  */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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

      {/* Page Heading */}
      <section className="px-4 sm:px-10 py-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Interior Collection
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Explore our beautiful range of interior finishes tailored for every
          style and space.
        </p>
      </section>

      {/* Product Grid */}
      <section className="max-w-[92rem] mx-auto px-6 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tiles.map((tile) => (
            <div
              key={tile._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={tile.Image}
                  alt={tile.Name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{tile.Name}</h3>
                <p className="text-sm text-gray-500 mt-1">{tile.Description}</p>
                <Link
                  to={`/product/tiles/${tile._id}`}
                  state={{ fromTab: "tiles" }}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium inline-block text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
