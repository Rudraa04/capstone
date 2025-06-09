import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { motion, AnimatePresence } from "framer-motion";

import Header from "../components/Header";
import Footer from "../components/Footer";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

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
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      <div className="flex-grow px-2 py-6 sm:px-4 lg:apx-10 bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
          🛒 Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-2xl shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt="Empty cart"
              className="w-28 h-28 mb-6"
            />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven’t added anything yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-5">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col sm:flex-row gap-5 border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg border"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          ₹{item.price} / piece
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
                          🚚 Estimated delivery by {getDeliveryDate()}
                        </p>
                      </div>

                      <div className="flex items-center flex-wrap gap-3 mt-4">
                        <button
                          onClick={() =>
                            item.quantity > 1 &&
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 text-md">{item.quantity}</span>
                        <button
                          onClick={() =>
                            item.quantity < item.stock &&
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className={`px-3 py-1 border rounded-lg ${
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
                          className="text-red-600 hover:underline text-sm ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Discount</span>
                  <span>- ₹{discount}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total - discount}</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              />
              <button
                onClick={() => setDiscount(50)}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Apply Code
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
