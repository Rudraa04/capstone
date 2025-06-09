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
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const fromAdmin = location.state?.fromAdmin || false;

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
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wide"
        >
          PATEL CERAMICS
        </Link>

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
              <div className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-4 gap-10 w-[1200px] max-w-screen-xl z-50 text-base font-sans transform translate-x-[100px]">
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
  );
}
