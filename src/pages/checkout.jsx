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
  const [cardLoaded, setCardLoaded] = useState(false);
  const cardRef = useRef();
  const [cardInfo, setCardInfo] = useState(null); // To show last 4 digits
  const [cardToken, setCardToken] = useState(null);
  const [cardConfirmed, setCardConfirmed] = useState(false);
  const [addressError, setAddressError] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // "success" or "error"
    size: "normal", // "normal" or "large"
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

  useEffect(() => {
    const loadSquareCard = async () => {
      let attempts = 0;
      while (!window.Square && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }

      if (!window.Square) {
        console.error("Square SDK not loaded.");
        return;
      }

      try {
        const payments = window.Square.payments(
          "sandbox-sq0idb-84Wv_eCeWbSX-fotdJL4-Q",
          "sandbox"
        );

        // Clear previous card container if any
        const container = document.getElementById("card-container");
        if (container) container.innerHTML = "";

        const card = await payments.card();
        await card.attach("#card-container");
        cardRef.current = card;
        setCardLoaded(true);
      } catch (error) {
        console.error("Error setting up Square card:", error);
      }
    };

    if (paymentMethod === "credit" || paymentMethod === "debit") {
      loadSquareCard();
    }
  }, [paymentMethod]); // ✅ re-run when paymentMethod is 'card'

  const handleConfirmCard = async () => {
    if (!cardRef.current) {
      triggerToast("❌ Card form not ready yet.", "error");
      return;
    }

    const result = await cardRef.current.tokenize();

    if (result.status !== "OK") {
      triggerToast(
        "❌ Card failed. Please check your card details.",
        "error"
      );
      return;
    }

    setCardToken(result.token);
    setCardConfirmed(true);

    if (result.details?.card?.last4) {
      setCardInfo(result.details.card.last4);
    } else {
      setCardInfo("****");
    }

    triggerToast("✅ Card confirmed successfully!", "success");
  };

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

  const handlePlaceOrder = async () => {
    // 1. Validate address
    if (!selectedAddress) {
      setAddressError(true);
      triggerToast("❌ Please select or add an address.", "error");
      return;
    } else {
      setAddressError(false);
    }

    // 2. Validate payment method
    if (paymentMethod !== "credit" && paymentMethod !== "debit") {
      triggerToast("❌ Please select a valid payment method.", "error");
      return;
    }

    // 3. Validate card confirmation
    if (!cardConfirmed || !cardToken) {
      triggerToast("❌ Please confirm your card details first.", "error");
      return;
    }

    // 4. Proceed with payment
    const sourceId = cardToken;

    try {
      const res = await fetch("http://localhost:5000/api/square/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          amount: grandTotal * 100,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(
          "orderSuccessMessage",
          "🎉 Your payment was successful! Thank you for your order."
        );

        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        navigate("/cart");
      } else {
        triggerToast("❌ Payment failed: " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ Payment request failed. Please try again.", "error");
    }
  };

  // First: calculate totalAmount properly
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const itemTotal = (price - discount) * quantity;
    return sum + itemTotal;
  }, 0);

  // Then: compute GST and Grand Total outside of reduce
  const GST_RATE = 0.05;
  const gstAmount = totalAmount * GST_RATE;
  const grandTotal = totalAmount + gstAmount;

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:px-10">
        {/* Left section with address and payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🏠 Delivery Address
            </h2>
            <div className="mb-2">
              <select
                className={`w-full border px-4 py-2 rounded-lg ${
                  addressError ? "border-red-500" : "border-gray-300"
                }`}
                value={selectedAddress}
                onChange={(e) => {
                  setSelectedAddress(Number(e.target.value));
                  setAddressError(false); // clear error when user selects
                }}
              >
                <option value="">-- Select Address --</option>
                {addressList.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} ({addr.street}, {addr.city})
                  </option>
                ))}
              </select>
              {addressError && (
                <p className="text-red-600 text-sm mt-1">
                  Please select or add an address.
                </p>
              )}
            </div>

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
          {(paymentMethod === "credit" || paymentMethod === "debit") && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6 w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {paymentMethod === "credit" ? "Credit Card" : "Debit Card"}{" "}
                Payment
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter your {paymentMethod === "credit" ? "credit" : "debit"}{" "}
                card details below. All information is securely encrypted.
              </p>

              <div
                id="card-container"
                className="min-h-[90px] border border-gray-300 rounded-md p-4 bg-gray-50"
              ></div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleConfirmCard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
                >
                  Confirm Card Details
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3 text-center">
                🔒 We use industry-standard encryption to protect your data.
              </p>
            </div>
          )}

          {cardConfirmed && cardInfo && (
            <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-md">
              Card ending in <strong>**** {cardInfo}</strong> confirmed.
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              💳 Payment Method
            </h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={paymentMethod === "credit"}
                  onChange={() => setPaymentMethod("credit")}
                />
                <span className="ml-2">Credit Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="debit"
                  checked={paymentMethod === "debit"}
                  onChange={() => setPaymentMethod("debit")}
                />
                <span className="ml-2">Debit Card</span>
              </label>
            </div>
          </div>

          {/* Place Order Button aligned left */}
          <div className="text-left flex flex-col sm:flex-row sm:items-center gap-6 mt-6">
            <button
              onClick={handlePlaceOrder}
              disabled={
                (paymentMethod === "credit" || paymentMethod === "debit") &&
                !cardConfirmed
              }
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shadow transition ${
                (paymentMethod === "credit" || paymentMethod === "debit") &&
                !cardConfirmed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Confirm & Pay ₹{grandTotal.toFixed(2)}
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full sm:w-auto bg-white text-gray-800 border border-gray-400 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-100 transition"
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
              {cartItems.map((item) => {
                const price = parseFloat(item.price || 0);
                const discount = parseFloat(item.discount || 0);
                const finalPrice = price - discount;
                const quantity = parseInt(item.quantity || 1);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b pb-4"
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div>
                        <h4 className="font-semibold text-base">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {quantity}</p>
                        <p className="text-sm text-gray-400">
                          Unit: ₹{finalPrice}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      ₹{(finalPrice * quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}

              <hr />
              <div className="space-y-2 text-sm text-gray-700 font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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
