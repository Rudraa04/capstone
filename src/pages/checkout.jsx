import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressList, setAddressList] = useState([
    {
      id: 1,
      label: "Home",
      fullName: "Harshil Rathod",
      street: "2309-205 Heritage Drive SE",
      city: "Calgary",
      postalCode: "T2H 2J8",
      country: "Canada",
      phone: "825-558-2103",
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
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    }
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price - item.discount) * item.quantity,
    0
  );

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = () => {
    const filled = Object.values(newAddress).every((val) => val.trim() !== "");
    if (!filled) return alert("Please fill all address fields.");
    const newId = Date.now();
    setAddressList((prev) => [...prev, { id: newId, label: `Address ${prev.length + 1}`, ...newAddress }]);
    setSelectedAddress(newId);
    setShowAddressForm(false);
    setNewAddress({ fullName: "", street: "", city: "", postalCode: "", country: "", phone: "" });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return alert("Please select or add an address.");
    const address = addressList.find((a) => a.id === selectedAddress);
    localStorage.setItem("orderDetails", JSON.stringify({ address, paymentMethod, cartItems }));
    localStorage.removeItem("cartItems");
    navigate("/thank-you");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <Header />

      <div className="flex-grow px-4 py-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left section with address and payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🏠 Delivery Address</h2>
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
                  const addr = addressList.find(a => a.id === selectedAddress);
                  return (
                    <>
                      <p><strong>{addr.fullName}</strong></p>
                      <p>{addr.street}, {addr.city}</p>
                      <p>{addr.country} - {addr.postalCode}</p>
                      <p>📞 {addr.phone}</p>
                    </>
                  );
                })()}
              </div>
            )}

            {showAddressForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input name="fullName" value={newAddress.fullName} onChange={handleAddressChange} placeholder="Full Name" className="px-4 py-2 border rounded-lg" />
                <input name="phone" value={newAddress.phone} onChange={handleAddressChange} placeholder="Phone" className="px-4 py-2 border rounded-lg" />
                <input name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Street Address" className="px-4 py-2 border rounded-lg" />
                <input name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="City" className="px-4 py-2 border rounded-lg" />
                <input name="postalCode" value={newAddress.postalCode} onChange={handleAddressChange} placeholder="Postal Code" className="px-4 py-2 border rounded-lg" />
                <input name="country" value={newAddress.country} onChange={handleAddressChange} placeholder="Country" className="px-4 py-2 border rounded-lg" />
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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💳 Payment Method</h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                <span className="ml-2">Cash on Delivery</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                <span className="ml-2">UPI</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                <span className="ml-2">Credit/Debit Card</span>
              </label>
            </div>
          </div>

          {/* Place Order Button aligned left */}
          <div className="text-left">
            <button
              onClick={handlePlaceOrder}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Place Order
            </button>
          </div>
        </div>

        {/* Right section - Order Summary */}
        <div className="space-y-4 bg-white p-6 rounded-2xl shadow h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📦 Order Summary</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">No items in cart.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-2">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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