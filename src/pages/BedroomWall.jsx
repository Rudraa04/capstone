import Header from "../components/Header";
import Footer from "../components/Footer";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import { auth } from "../firebase/firebase";

import bedroomwall1 from "../images/bedroomwall1.jpg";
import bedroomwall2 from "../images/bedroomwall2.jpg";
import bedroomwall3 from "../images/bedroomwall3.jpg";
import bedroomwall4 from "../images/bedroomwall4.jpg";

const bedroomWallTiles = [
  {
    img: bedroomwall1,
    name: "Classic Beige Tile",
    desc: "Warm tones perfect for cozy bedrooms.",
  },
  {
    img: bedroomwall2,
    name: "Modern Mix Tile",
    desc: "Stylish blend of textures for a modern look.",
  },
  {
    img: bedroomwall3,
    name: "Wood Matte Tile",
    desc: "Earthy texture ideal for serene settings.",
  },
  {
    img: bedroomwall4,
    name: "Striped Pattern Tile",
    desc: "Unique strip patterns for elegant walls.",
  },
];

export default function BedroomWall() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

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
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="bg-white text-gray-900">
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

          <div className="hidden md:flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base px-2 text-gray-700 font-medium"
            />
            <button className="text-blue-600 hover:text-blue-800 p-1">
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
                onChange={(e) => setQuery(e.target.value)}
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

      <section
        className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center shadow-inner"
        style={{ backgroundImage: `url(${bedroomwall1})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-extrabold">Bedroom Wall Tiles</h1>
          <p className="text-lg mt-4">
            Elegant tiles that add warmth and personality to your space
          </p>
        </div>
      </section>

      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Explore Bedroom Tiles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {bedroomWallTiles.map((tile, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
            >
              <img
                src={tile.img}
                alt={tile.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{tile.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tile.desc}</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
