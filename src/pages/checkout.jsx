import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import { auth } from "../firebase/firebase";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressList, setAddressList] = useState([
    {
      id: 1,
      label: "Home",
      fullName: "Harshil Rathod",
      street: "1601 16 Ave NW",
      city: "Calgary",
      postalCode: "T29 xxx",
      country: "Canada",
      phone: "xxx-xxx-xxx",
    },
  ]);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    }
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = () => {
    const filled = Object.values(newAddress).every((val) => val.trim() !== "");
    if (!filled) return alert("Please fill all address fields.");
    const newId = Date.now();
    setAddressList((prev) => [
      ...prev,
      { id: newId, label: `Address ${prev.length + 1}`, ...newAddress },
    ]);
    setSelectedAddress(newId);
    setShowAddressForm(false);
    setNewAddress({
      fullName: "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return alert("Please select or add an address.");
    const address = addressList.find((a) => a.id === selectedAddress);
    localStorage.setItem(
      "orderDetails",
      JSON.stringify({ address, paymentMethod, cartItems })
    );
    localStorage.removeItem("cartItems");
    navigate("/thank-you");
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price - item.discount) * item.quantity,
    0
  );

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
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
                                  { name: "Exterior Floor Tiles", to: "/exterior?sub=Exterior%20Floor%20Tiles" },
                                  { name: "Exterior Wall Tiles", to: "/exterior?sub=Exterior%20Wall%20Tiles" },
                                  { name: "Kitchen Wall Tiles", to: "/kitchenwall?sub=Kitchen%20Wall%20Tiles" },
                                  { name: "Bathroom Wall Tiles", to: "/bathroomwall?sub=Bathroom%20Wall%20Tiles" },
                                  { name: "Interior Floor Tiles", to: "/interiorfloor?sub=Interior%20Floor%20Tiles" },
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

      <div className="flex-grow px-4 py-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left section with address and payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🏠 Delivery Address
            </h2>
            <select
              className="w-full border px-4 py-2 rounded-lg mb-2"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(Number(e.target.value))}
            >
              <option value="">-- Select Address --</option>
              {addressList.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.label} ({addr.street}, {addr.city})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-blue-600 hover:underline text-sm mb-4"
            >
              {showAddressForm ? "Cancel" : "+ Add New Address"}
            </button>

            {selectedAddress && (
              <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                {(() => {
                  const addr = addressList.find(
                    (a) => a.id === selectedAddress
                  );
                  return (
                    <>
                      <p>
                        <strong>{addr.fullName}</strong>
                      </p>
                      <p>
                        {addr.street}, {addr.city}
                      </p>
                      <p>
                        {addr.country} - {addr.postalCode}
                      </p>
                      <p>📞 {addr.phone}</p>
                    </>
                  );
                })()}
              </div>
            )}

            {showAddressForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  name="fullName"
                  value={newAddress.fullName}
                  onChange={handleAddressChange}
                  placeholder="Full Name"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleAddressChange}
                  placeholder="Phone"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  name="street"
                  value={newAddress.street}
                  onChange={handleAddressChange}
                  placeholder="Street Address"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  name="city"
                  value={newAddress.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  name="postalCode"
                  value={newAddress.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Postal Code"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  name="country"
                  value={newAddress.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="px-4 py-2 border rounded-lg"
                />
                <div className="md:col-span-2">
                  <button
                    onClick={handleAddAddress}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              💳 Payment Method
            </h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="ml-2">Cash on Delivery</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <span className="ml-2">UPI</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span className="ml-2">Credit/Debit Card</span>
              </label>
            </div>
          </div>

          {/* Place Order Button aligned left */}
          <div className="text-left flex flex-col sm:flex-row sm:items-center gap-6 mt-4">
            <button
              onClick={handlePlaceOrder}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition"
            >
              Place Order
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="w-full sm:w-auto bg-white text-blue-600 border border-blue-500 px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-50 transition"
            >
              ← Back to Cart
            </button>
          </div>
        </div>

        {/* Right section - Order Summary */}
        <div className="space-y-4 bg-white p-6 rounded-2xl shadow h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📦 Order Summary
          </h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">No items in cart.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-2"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-medium">
                    ₹{(item.price - item.discount) * item.quantity}
                  </div>
                </div>
              ))}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
