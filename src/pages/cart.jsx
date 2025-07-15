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

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    size: "normal",
  });

  const triggerToast = (
    message,
    type = "success",
    size = "normal",
    duration = 10000
  ) => {
    setToast({ show: true, message, type, size });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success", size: "normal" });
    }, duration);
  };

  useEffect(() => {
    const message = localStorage.getItem("orderSuccessMessage");
    if (message) {
      triggerToast(message, "success", "large", 15000);
      localStorage.removeItem("orderSuccessMessage");
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [discount, setDiscount] = useState(0);

  const handleQuantityChange = (id, newQuantity) => {
    const updated = cartItems.map((item) =>
      item.name === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemoveItem = (id) => {
    const filtered = cartItems.filter((item) => item.name !== id);
    setCartItems(filtered);
    localStorage.setItem("cart", JSON.stringify(filtered));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const totalItemDiscount = cartItems.reduce((sum, item) => {
    const discount = parseFloat(item.discount) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return sum + discount * quantity;
  }, 0);

  const total = subtotal - totalItemDiscount - (parseFloat(discount) || 0);

  return (
    <div className="flex flex-col min-h-screen text-gray-900 font-sans bg-gray-50">
      <Header />

      <div className="flex-grow px-2 py-6 sm:px-4 lg:px-10 ">
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
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            {item.name}
                          </h2>
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
                          <p className="text-sm text-gray-500 font-bold mt-1">
                            Estimated delivery by {getDeliveryDate()}
                          </p>
                        </div>
                        <div className="text-right">
                          {item.discount > 0 && (
                            <p className="text-sm text-gray-500 line-through">
                              ₹{item.price * item.quantity}
                            </p>
                          )}
                          <p className="text-lg font-bold text-gray-900">
                            ₹
                            {(
                              (parseFloat(item.price || 0) -
                                parseFloat(item.discount || 0)) *
                              parseInt(item.quantity || 0)
                            ).toFixed(2)}
                          </p>

                          {item.discount > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              You save ₹
                              {(
                                parseFloat(item.discount || 0) *
                                parseInt(item.quantity || 0)
                              ).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-3 mt-4">
                        <button
                          onClick={() =>
                            item.quantity > 1 &&
                            handleQuantityChange(item.name, item.quantity - 1)
                          }
                          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-lg font-bold"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-4 text-md font-medium bg-gray-100 py-1 rounded">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            item.quantity < item.stock &&
                            handleQuantityChange(item.name, item.quantity + 1)
                          }
                          className={`px-3 py-1 border border-gray-300 rounded-lg text-lg font-bold ${
                            item.quantity >= item.stock
                              ? "text-gray-400 cursor-not-allowed"
                              : "hover:bg-gray-100"
                          }`}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.name)}
                          className="text-red-600 hover:underline text-sm ml-auto font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700 font-semibold">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 font-semibold">
                  <span>Total Item Discount</span>
                  <span>- ₹{totalItemDiscount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 font-semibold">
                  <span>Extra Discount</span>
                  <span>- ₹{discount}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("cartItems", JSON.stringify(cartItems));
                  navigate("/checkout");
                }}
                className="w-full py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Checkout
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full mt-2 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
              >
                ← Back to Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      {toast.show && (
        <div
          onClick={() => setToast({ ...toast, show: false })}
          className={`fixed bottom-4 right-4 z-50 animate-slideIn cursor-pointer shadow-xl transition-all duration-500 ${
            toast.size === "large"
              ? "max-w-xs sm:max-w-sm p-6 text-xl font-bold"
              : "p-4 text-sm"
          } rounded-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.size === "large" && (
            <div className="text-4xl mb-2 animate-bounce">🎉</div>
          )}
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
}
