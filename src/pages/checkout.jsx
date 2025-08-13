import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { api } from "../api";

/* ===== helpers (pricing + product type) ===== */
function isTilesItem(it = {}) {
  const tag = String(it.kind || it.type || it.category || it.productType || "").toLowerCase();
  return /tile/.test(tag);
}
function isStoneItem(it = {}) {
  const tag = String(it.kind || it.type || it.category || it.productType || "").toLowerCase();
  return tag.includes("marble") || tag.includes("granite");
}
const BOX_CONFIG = {
  "48x24": { tilesPerBox: 2, sqftPerBox: 16 },
  "24x24": { tilesPerBox: 4, sqftPerBox: 16 },
  "12x18": { tilesPerBox: 6, sqftPerBox: 9 },
  "12x12": { tilesPerBox: 8, sqftPerBox: 8 },
};
function getBoxInfo(sizeStr = "") {
  const key = String(sizeStr || "").replace(/\s+/g, "");
  if (BOX_CONFIG[key]) return BOX_CONFIG[key];
  const [L, W] = key.split("x").map(Number);
  const sqftPerTile = L && W ? (L * W) / 144 : 0;
  return { tilesPerBox: 1, sqftPerBox: sqftPerTile };
}
function computeLineTotal(it = {}) {
  const price = parseFloat(it.price) || 0;
  const qty = parseInt(it.quantity) || 0;

  if (isTilesItem(it)) {
    const { sqftPerBox } = getBoxInfo(it.size || it.specs?.size || "");
    return price * sqftPerBox * qty; // ₹/sqft × sqft/box × boxes
  }
  if (isStoneItem(it) && it.totalSqft) {
    return price * it.totalSqft;      // ₹/sqft × total sqft (custom size × qty)
  }
  return price * qty;                 // sinks, toilets, bathtubs...
}
function normalizeProductType(v) {
  const s = String(v || "").toLowerCase();
  if (s.includes("tile")) return "Tile";
  if (s.includes("granite")) return "Granite";
  if (s.includes("marble")) return "Marble";
  if (s.includes("sink") || s.includes("basin")) return "Sink";
  if (s.includes("toilet") || s.includes("wc") || s.includes("commode")) return "Toilet";
  if (s.includes("bathtub") || s.includes("tub")) return "Bathtub";
  return "Other";
}

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
  const [addressList, setAddressList] = useState([]);
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
  const [cardInfo, setCardInfo] = useState(null);
  const [cardToken, setCardToken] = useState(null);
  const [cardConfirmed, setCardConfirmed] = useState(false);
  const [addressError, setAddressError] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    size: "normal",
  });
  const triggerToast = (message, type = "success", size = "normal", duration = 10000) => {
    setToast({ show: true, message, type, size });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success", size: "normal" });
    }, duration);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const savedAddresses = localStorage.getItem(`addresses_${currentUser.uid}`);
        if (savedAddresses) setAddressList(JSON.parse(savedAddresses));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("cart") ?? localStorage.getItem("cartItems");
      setCartItems(raw ? JSON.parse(raw) : []);
    };
    load();
    window.addEventListener("cartUpdated", load);
    return () => window.removeEventListener("cartUpdated", load);
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
  }, [paymentMethod]);

  const handleConfirmCard = async () => {
    if (!cardRef.current) {
      triggerToast("❌ Card form not ready yet.", "error");
      return;
    }
    const result = await cardRef.current.tokenize();
    if (result.status !== "OK") {
      triggerToast("❌ Card failed. Please check your card details.", "error");
      return;
    }
    setCardToken(result.token);
    setCardConfirmed(true);
    if (result.details?.card?.last4) setCardInfo(result.details.card.last4);
    else setCardInfo("****");
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

  const handleAddAddress = async () => {
    const filled = Object.values(newAddress).every((val) => val.trim() !== "");
    if (!filled) return alert("Please fill all address fields.");

    const newId = Date.now();
    const updatedList = [
      ...addressList,
      { id: newId, label: `Address ${addressList.length + 1}`, ...newAddress },
    ];

    setAddressList(updatedList);
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

    if (user) {
      localStorage.setItem(`addresses_${user.uid}`, JSON.stringify(updatedList));

      const primaryAddress = updatedList[0];
      const formattedAddress = `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.country} - ${primaryAddress.postalCode}`;

      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            phone: primaryAddress.phone,
            address: formattedAddress,
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Failed to update profile with address:", err.message);
      }
    }
  };

  const handleDeleteAddress = async (idToDelete) => {
    const updated = addressList.filter((addr) => addr.id !== idToDelete);
    setAddressList(updated);
    if (selectedAddress === idToDelete) setSelectedAddress("");

    if (user) {
      localStorage.setItem(`addresses_${user.uid}`, JSON.stringify(updated));
      if (idToDelete === addressList[0]?.id) {
        if (updated.length > 0) {
          const nextPrimary = updated[0];
          const formatted = `${nextPrimary.street}, ${nextPrimary.city}, ${nextPrimary.country} - ${nextPrimary.postalCode}`;
          try {
            await setDoc(
              doc(db, "users", user.uid),
              { phone: nextPrimary.phone, address: formatted },
              { merge: true }
            );
          } catch (err) {
            console.error("Error updating profile after deletion:", err.message);
          }
        } else {
          try {
            await setDoc(
              doc(db, "users", user.uid),
              { phone: "", address: "" },
              { merge: true }
            );
          } catch (err) {
            console.error("Error clearing profile:", err.message);
          }
        }
      }
    }
  };

  async function saveOrderAfterPayment(cartItems, grandTotal, paymentResult) {
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const items = (cartItems || []).map((ci) => ({
      productId: ci._id || ci.id,
      sku: ci.sku,
      productType: normalizeProductType(ci.category || ci.type || ci.kind || ci.productType),
      name: ci.name,
      quantity: parseInt(ci.quantity || 1, 10),
      price: Number(ci.price || 0) - Number(ci.discount || 0),
      unit: ci.unit || "box",
      image: ci.image,
      specs: ci.specs || {
        size: ci.customSizeLabel || ci.size,
        color: ci.color,
        finish: ci.finish,
        totalSqft: ci.totalSqft || null,
        customHeightIn: ci.customHeightIn || null,
        customWidthIn: ci.customWidthIn || null,
      },
    }));

    const addr = addressList.find((a) => a.id === selectedAddress) || {};
    const shippingAddress = {
      name: addr.fullName || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "",
      phone: addr.phone || "",
    };

    const subtotal = (cartItems || []).reduce((s, ci) => s + computeLineTotal(ci), 0);
    const taxTotal = +(subtotal * 0.05).toFixed(2);
    const shippingFee = 0;

    const receiptUrl = paymentResult?.payment?.receipt_url;
    const last4 = paymentResult?.payment?.card_details?.card?.last_4;
    const brand = paymentResult?.payment?.card_details?.card?.card_brand;

    await api.post(
      "/api/orders",
      {
        items,
        currency: "INR",
        subtotal,
        taxTotal,
        shippingFee,
        totalAmount: Number(grandTotal.toFixed(2)),
        status: "Paid",
        customerName: shippingAddress.name,
        shippingAddress,
        payment: {
          processor: "Square",
          receiptUrl,
          last4,
          brand,
        },
        timeline: [{ label: "Ordered", at: new Date().toISOString() }],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /* ===== totals (displayed in ₹, Square will get cents) ===== */
  const totalAmount = cartItems.reduce((sum, item) => sum + computeLineTotal(item), 0);
  const GST_RATE = 0.05;
  const gstAmount = totalAmount * GST_RATE;
  const grandTotal = totalAmount + gstAmount;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setAddressError(true);
      triggerToast("❌ Please select or add an address.", "error");
      return;
    } else {
      setAddressError(false);
    }

    if (paymentMethod !== "credit" && paymentMethod !== "debit") {
      triggerToast("❌ Please select a valid payment method.", "error");
      return;
    }

    if (!cardConfirmed || !cardToken) {
      triggerToast("❌ Please confirm your card details first.", "error");
      return;
    }

    // Square expects the smallest currency unit (cents). Make it an integer.
    const amountCents = Math.max(1, Math.round(grandTotal * 100));

    // Optional: guard against oversized payments (e.g., > CA$50,000)
    if (amountCents > 5_000_000) {
      triggerToast("❌ Amount exceeds card limit for a single payment.", "error");
      return;
    }

    const sourceId = cardToken;

    try {
      const res = await fetch("http://localhost:5000/api/square/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          amount: amountCents, // send integer cents (do NOT send dollars)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await saveOrderAfterPayment(cartItems, grandTotal, data.result);

        localStorage.removeItem("cartItems");
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        localStorage.setItem(
          "orderSuccessMessage",
          "🎉 Your payment was successful! Thank you for your order."
        );

        navigate("/cart"); // or navigate("/profile")
      } else {
        triggerToast("❌ Payment failed: " + (data.message || "Unknown error"), "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ Payment request failed. Please try again.", "error");
    }
  };

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
              <div className="space-y-2 mb-4">
                {addressList.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded"
                  >
                    <label className="flex items-center gap-2 w-full">
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => {
                          setSelectedAddress(addr.id);
                          setAddressError(false);
                        }}
                      />
                      <span className="text-sm">
                        {addr.label} — {addr.street}, {addr.city}
                      </span>
                    </label>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-500 hover:text-red-700 text-sm ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {addressError && (
                  <p className="text-red-600 text-sm mt-1">
                    Please select or add an address.
                  </p>
                )}
              </div>
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
                  const addr = addressList.find((a) => a.id === selectedAddress);
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
                {paymentMethod === "credit" ? "Credit Card" : "Debit Card"} Payment
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter your {paymentMethod === "credit" ? "credit" : "debit"} card details below. All information is securely encrypted.
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

          {/* Place Order Button */}
          <div className="text-left flex flex-col sm:flex-row sm:items-center gap-6 mt-6">
            <button
              onClick={handlePlaceOrder}
              disabled={(paymentMethod === "credit" || paymentMethod === "debit") && !cardConfirmed}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shadow transition ${
                (paymentMethod === "credit" || paymentMethod === "debit") && !cardConfirmed
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
                    key={`${item.id}-${item.customSizeLabel || item.size || ""}`}
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

                        {isStoneItem(item) && (item.customSizeLabel || item.size) && (
                          <p className="text-xs text-gray-500">
                            Size: {item.customSizeLabel || `${item.size} in`}
                          </p>
                        )}
                        {isTilesItem(item) && item.size && (
                          <p className="text-xs text-gray-500">Box Size: {item.size}</p>
                        )}

                        <p className="text-sm text-gray-500">Qty: {quantity}</p>

                        {isStoneItem(item) ? (
                          <p className="text-sm text-gray-400">
                            Price per Sqft: ₹{finalPrice.toFixed(2)}
                          </p>
                        ) : isTilesItem(item) ? (
                          <p className="text-sm text-gray-400">
                            Price per Sqft: ₹{finalPrice.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Unit Price: ₹{finalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-medium">
                      ₹{computeLineTotal(item).toFixed(2)}
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
            toast.size === "large" ? "max-w-xs sm:max-w-sm p-6 text-xl font-bold" : "p-4 text-sm"
          } rounded-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          {toast.size === "large" && <div className="text-4xl mb-2 animate-bounce">🎉</div>}
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
}
