import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

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
    // This runs the enclosed code once when the component first loads
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // listen to user login status.If the user logs in or logs out, this function gets called.It also gives you the currentUser object if someone is logged in.
      setUser(currentUser); // Set the user state to the current user
      if (currentUser) {
        // If a user is logged in
        const savedAddresses = localStorage.getItem(
          `addresses_${currentUser.uid}`
        ); // Retrieve saved addresses from localStorage using the user's UID
        if (savedAddresses) {
          // If there are saved addresses
          setAddressList(JSON.parse(savedAddresses)); // Convert the saved address data from string to an array/object, and store it in the addressList state
        }
      }
    });
    return () => unsubscribe(); // Cleanup function to unsubscribe from the auth state listener when the component unmounts
  }, []);

  useEffect(() => {
    const storedItems = localStorage.getItem("cartItems"); //It tries to get any cart items that were saved in localStorage
    if (storedItems) {
      // If there are items in localStorage
      setCartItems(JSON.parse(storedItems)); // If yes, it converts it back into an array and stores it in the cartItems state, so the cart can display them.
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
    // automatically load when component loads
    const loadSquareCard = async () => {
      // Function to load Square card form input
      let attempts = 0; // Initialize attempts to 0
      while (!window.Square && attempts < 10) {
        // it Checks if window.Square is available which that means the Square SDK has loaded in the browser
        await new Promise((resolve) => setTimeout(resolve, 200)); // if not it waits 200 milliseconds(0.2 sec) and tries again.
        attempts++; // it does this maximum 10 times
      }

      if (!window.Square) {
        console.error("Square SDK not loaded.");
        return; // If Square SDK is still not loaded after 10 attempts, log an error and exit
      }

      try {
        const payments = window.Square.payments(
          // Initialize Square payments with your application ID
          "sandbox-sq0idb-84Wv_eCeWbSX-fotdJL4-Q",
          "sandbox"
        );

        // Clear previous card container if any
        const container = document.getElementById("card-container"); // it will find card by its div id of card-container
        if (container) container.innerHTML = ""; // Clear any existing content in the card container
        11;
        const card = await payments.card(); // Create a new Square card instance
        await card.attach("#card-container"); //This inserts the Square card input UI into the #card-container div on the screen.
        cardRef.current = card; // Saves the card object into a ref so we can use it later.
        setCardLoaded(true); // Set cardLoaded to true to indicate the card input is ready
      } catch (error) {
        // If there is an error during setup it will logs error
        console.error("Error setting up Square card:", error);
      }
    };

    if (paymentMethod === "credit" || paymentMethod === "debit") {
      // this check if the selected payment method is credit or debit, then run the loadSquareCard() function.
      loadSquareCard();
    }
  }, [paymentMethod]); //  re-run when paymentMethod is 'card'

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

    if (result.details?.card?.last4) {
      setCardInfo(result.details.card.last4);
    } else {
      setCardInfo("****");
    }

    triggerToast("✅ Card confirmed successfully!", "success");
  };

  const handleLogout = async () => {
    await signOut(auth); // Sign out the user from Firebase
    setUser(null); // clear the user state
    alert("Logged out!"); // send an alert to the user
    navigate("/login"); // navigate back to login page
  };
  const handleAddressChange = (e) => {
    // This is a function triggered when a user types into an address form input (like name, phone, etc.)
    const { name, value } = e.target; // will take name and value from input field
    setNewAddress((prev) => ({ ...prev, [name]: value })); // It updates the newAddress state with the new value for the specific field that was changed.
  };
  const handleAddAddress = async () => {
    const filled = Object.values(newAddress).every((val) => val.trim() !== ""); // checks if all address fields are filled
    if (!filled) return alert("Please fill all address fields."); // If any field is empty, it shows an alert and stops the function.

    const newId = Date.now(); //  Creates a unique ID for the address using the current timestamp.
    const updatedList = [
      //Adds the new address to the existing list. label will be like "Address 1", "Address 2", etc.
      ...addressList,
      { id: newId, label: `Address ${addressList.length + 1}`, ...newAddress },
    ];

    setAddressList(updatedList); // Updates the addressList state with the new address.
    setSelectedAddress(newId); //Sets this new one as selected
    setShowAddressForm(false); // Hides the address form after submission
    setNewAddress({
      fullName: "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    }); // Resets the newAddress state to clear the form fields

    if (user) {
      // Save to localStorage under unique key for that user
      localStorage.setItem(
        `addresses_${user.uid}`,
        JSON.stringify(updatedList)
      );

      // saves the first address as the primary one and formats it as a single string
      const primaryAddress = updatedList[0];
      const formattedAddress = `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.country} - ${primaryAddress.postalCode}`;

      try {
        await setDoc(
          doc(db, "users", user.uid), //Saves the phone number and address to that user’s Firestore document.
          {
            phone: primaryAddress.phone,
            address: formattedAddress,
          },
          { merge: true } //only update these fields, don’t erase others.
        );
      } catch (err) {
        console.error("Failed to update profile with address:", err.message);
      }
    }
  };

  const handleDeleteAddress = async (idToDelete) => {
    const updated = addressList.filter((addr) => addr.id !== idToDelete); // Filters out the address with the ID to delete from the addressList
    setAddressList(updated); // Updates the addressList state with the remaining addresses

    if (selectedAddress === idToDelete) {
      // If the user deleted the currently selected address, unselect it.
      setSelectedAddress("");
    }

    if (user) {
      localStorage.setItem(`addresses_${user.uid}`, JSON.stringify(updated)); //Saves the updated address list.

      // If the deleted one was the first address used in profile, update Firestore
      if (idToDelete === addressList[0]?.id) {
        // If the deleted address was the primary one
        if (updated.length > 0) {
          //then uses next address in the list as primary and update it to firebase
          const nextPrimary = updated[0];
          const formatted = `${nextPrimary.street}, ${nextPrimary.city}, ${nextPrimary.country} - ${nextPrimary.postalCode}`;
          try {
            await setDoc(
              doc(db, "users", user.uid),
              {
                phone: nextPrimary.phone,
                address: formatted,
              },
              { merge: true } //only update these fields, don’t erase others.
            );
          } catch (err) {
            console.error(
              "Error updating profile after deletion:",
              err.message
            );
          }
        } else {
          // No address left, so clear from profile
          try {
            await setDoc(
              doc(db, "users", user.uid),
              {
                phone: "",
                address: "",
              },
              { merge: true } // only update these fields, don’t erase others.
            );
          } catch (err) {
            console.error("Error clearing profile:", err.message);
          }
        }
      }
    }
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
    const sourceId = cardToken; //This takes the token you got from Square (cardRef.current.tokenize()) and stores it in a variable called sourceId.

    try {
      const res = await fetch("http://localhost:5000/api/square/payment", {
        // calls your backend API to process the payment
        method: "POST", // posts the payment request
        headers: { "Content-Type": "application/json" }, //
        body: JSON.stringify({
          // sends the payment details to your backend
          sourceId,
          amount: grandTotal * 100, //total amount in cents (because Square expects cents)
        }),
      });

      const data = await res.json(); // parses the response from your backend

      if (res.ok) {
        //if the payment was successful
        localStorage.setItem(
          //Save a success message in localStorage — this will be shown on the Cart page.
          "orderSuccessMessage",
          "🎉 Your payment was successful! Thank you for your order."
        );

        localStorage.removeItem("cart"); //  Clear the user's cart after payment.
        window.dispatchEvent(new Event("cartUpdated")); //  Notify other components (like the cart icon in the header) that the cart is now empty.

        navigate("/cart"); // Redirect the user to the Cart page
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
