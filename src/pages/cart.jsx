import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function getDeliveryDate() {
  const today = new Date();
  today.setDate(today.getDate() + 3);
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function Cart() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Glossy White Floor Tile",
      price: 25,
      quantity: 2,
      stock: 10,
      image: "https://source.unsplash.com/300x300/?tile,white",
    },
    {
      id: 2,
      name: "Marble Effect Wall Tile",
      price: 40,
      quantity: 1,
      stock: 2,
      image: "https://source.unsplash.com/300x300/?tile,marble",
    },
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 md:py-5 lg:px-10">
        <div className="w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-black">
            PATEL CERAMICS
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-black font-medium">
              Home
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-black font-medium flex items-center gap-1"
            >
              <FaShoppingCart /> Cart
            </Link>
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-black font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-700 hover:text-black font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-black font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-black font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#f3f3f3] min-h-screen px-4 py-10 sm:px-6 lg:px-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-lg shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt="Empty cart"
              className="w-32 h-32 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven’t added anything yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4 border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-32 h-32 object-cover rounded border"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          ₹{item.price} per piece
                        </p>
                        <p
                          className={`text-sm mt-1 font-medium ${
                            item.stock === 0
                              ? "text-red-500"
                              : item.stock <= 3
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.stock === 0
                            ? "Out of Stock"
                            : item.stock <= 3
                            ? `Only ${item.stock} left`
                            : "In Stock"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          🚚 Delivery by {getDeliveryDate()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() =>
                            item.quantity > 1 &&
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1 border rounded hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() =>
                            item.quantity < item.stock &&
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className={`px-3 py-1 border rounded ${
                            item.quantity >= item.stock
                              ? "text-gray-400 cursor-not-allowed"
                              : "hover:bg-gray-100"
                          }`}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 text-sm hover:underline ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right sm:w-24 mt-4 sm:mt-0">
                      <p className="text-lg font-bold text-gray-800">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit border lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Promo Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => {
                      if (promoCode.trim().toUpperCase() === "WELCOME10") {
                        setDiscount(total * 0.1);
                      } else {
                        alert("Invalid promo code");
                        setDiscount(0);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-2">
                Subtotal ({cartItems.length} items):{" "}
                <span className="font-semibold">₹{total}</span>
              </p>
              {discount > 0 && (
                <p className="text-gray-700 mb-2">
                  Discount (WELCOME10):{" "}
                  <span className="font-semibold text-green-600">
                    − ₹{discount.toFixed(2)}
                  </span>
                </p>
              )}
              <p className="text-gray-700 mb-4">
                Total:{" "}
                <span className="font-bold">
                  ₹{(total - discount).toFixed(2)}
                </span>
              </p>
              <p className="text-green-600 text-sm mb-4">
                Eligible for Free Shipping
              </p>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg text-sm transition">
                Proceed to Checkout
              </button>
              <button
                onClick={() => navigate("/")}
                className="block w-full text-center mt-4 text-blue-600 hover:underline text-sm"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-10 py-12 mt-16 text-sm">
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

          {/* ✅ Column 5: What We Do */}
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
    </>
  );
}
