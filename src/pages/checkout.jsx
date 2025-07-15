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
  const [cardLoaded, setCardLoaded] = useState(false);
  const cardRef = useRef();


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
    // ✅ Wait until the Square SDK is available
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
        "sandbox-sq0idb-84Wv_eCeWbSX-fotdJL4-Q", // ✅ your actual sandbox App ID
        "sandbox"
      );

      const card = await payments.card();
      await card.attach("#card-container");
      cardRef.current = card;
      setCardLoaded(true);
    } catch (error) {
      console.error("Error setting up Square card:", error);
    }
  };

  if (paymentMethod === "card") {
    loadSquareCard();
  }
}, [paymentMethod]); // ✅ re-run when paymentMethod is 'card'


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
  if (!selectedAddress) return alert("Please select or add an address.");

  const address = addressList.find((a) => a.id === selectedAddress);

  if (paymentMethod === "card") {
    if (!cardRef.current) return alert("Card form not ready yet");

    // 1. Tokenize the card
    const result = await cardRef.current.tokenize();

    if (result.status !== "OK") {
      return alert("Card tokenization failed. Please check your card details.");
    }

    const sourceId = result.token;

    try {
      // 2. Send token to backend
      const res = await fetch("http://localhost:5000/api/square/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          amount: totalAmount*100, // Use the total from cart
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Payment successful!");
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/thank-you");
      } else {
        console.error(data);
        alert("Payment failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Payment request failed. Please try again.");
    }

    return; // Exit the function so it doesn’t continue to COD flow
  }

  // 👇 For COD or UPI — keep existing logic
  localStorage.setItem("orderDetails", JSON.stringify({ address, paymentMethod, cartItems }));
  localStorage.removeItem("cartItems");
  navigate("/thank-you");
};

const totalAmount = cartItems.reduce((sum, item) => {
  const price = parseFloat(item.price) || 0;
  const discount = parseFloat(item.discount) || 0;
  const quantity = parseInt(item.quantity) || 1;

  const itemTotal = (price - discount) * quantity;
  return sum + itemTotal;
}, 0);


  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
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
          {paymentMethod === "card" && (
  <div className="mt-4">
    <div id="card-container" className="border rounded p-4"></div>
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
                    ₹{(parseFloat(item.price || 0) - parseFloat(item.discount || 0)) * parseInt(item.quantity || 1)}
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
