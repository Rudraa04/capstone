import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import { auth } from "../firebase/firebase"; // uses your existing client Firebase
import { createTicket } from "../api/customerTickets";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

const CustomerSupport = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    category: "", // "order" | "payment" | "product" | "general" | "accountissue"
    email: "",
    country: "",
    message: "",
    orderNumber: "", // Mongo ObjectId when category="order"
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successTicket, setSuccessTicket] = useState(null); // holds API response on success

  const isMongoId = (s) => /^[a-f\d]{24}$/i.test(s || "");
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

  // Compose a clear issue blob for admins to read
  const buildIssueText = () => {
    // put all fields in one readable blob for agents
    const topicMap = {
      order: "Order Issue",
      payment: "Payment Problem",
      product: "Product Inquiry",
      general: "General Question",
      accountissue: "Account Issues",
    };
    return [
      formData.subject && `Subject: ${formData.subject}`,
      formData.category &&
        `Topic: ${topicMap[formData.category] || formData.category}`,
      formData.country && `Country: ${formData.country}`,
      formData.orderNumber && `Order: ${formData.orderNumber}`,
      formData.email && `Contact Email (provided): ${formData.email}`,
      "",
      formData.message || "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessTicket(null);

    // Must be logged in so we can send UID; backend expects a real Firebase user
    const user = auth.currentUser;
    if (!user) {
      setErrorMsg("Please log in to submit a support ticket.");
      return;
    }

    // Basic validations
    if (!formData.category) return setErrorMsg("Please select a topic.");
    if (!formData.subject.trim()) return setErrorMsg("Please add a subject.");
    if (!formData.message.trim())
      return setErrorMsg("Please describe your issue.");
    if (formData.email && !isEmail(formData.email)) {
      return setErrorMsg("Please enter a valid contact email.");
    }
    if (formData.category === "order") {
      if (!formData.orderNumber.trim())
        return setErrorMsg("Please enter your Order Number.");
      if (!isMongoId(formData.orderNumber.trim())) {
        return setErrorMsg(
          "Order Number looks invalid. It must be a 24-character ID."
        );
      }
    }

    const payload = {
      customerId: user.uid, // ✅ server stores UID; verified via Firebase Admin
      issue: buildIssueText(), // ✅ one blob containing subject/topic/country/email/message
      orderId:
        formData.category === "order" ? formData.orderNumber.trim() : null, // ✅ shown in admin modal
    };

    setSubmitting(true);
    try {
      const res = await createTicket(payload);
      setSuccessTicket(res);
      // reset (keep category so the form doesn't jump)
      setFormData((prev) => ({
        ...prev,
        subject: "",
        country: "",
        message: "",
        orderNumber: "",
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const countryOptions = [
    { value: "Afghanistan", label: "Afghanistan" },
    { value: "Albania", label: "Albania" },
    { value: "Algeria", label: "Algeria" },
    { value: "Andorra", label: "Andorra" },
    { value: "Angola", label: "Angola" },
    { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
    { value: "Argentina", label: "Argentina" },
    { value: "Armenia", label: "Armenia" },
    { value: "Australia", label: "Australia" },
    { value: "Austria", label: "Austria" },
    { value: "Azerbaijan", label: "Azerbaijan" },
    { value: "Bahamas", label: "Bahamas" },
    { value: "Bahrain", label: "Bahrain" },
    { value: "Bangladesh", label: "Bangladesh" },
    { value: "Barbados", label: "Barbados" },
    { value: "Belarus", label: "Belarus" },
    { value: "Belgium", label: "Belgium" },
    { value: "Belize", label: "Belize" },
    { value: "Benin", label: "Benin" },
    { value: "Bhutan", label: "Bhutan" },
    { value: "Bolivia", label: "Bolivia" },
    { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
    { value: "Botswana", label: "Botswana" },
    { value: "Brazil", label: "Brazil" },
    { value: "Brunei", label: "Brunei" },
    { value: "Bulgaria", label: "Bulgaria" },
    { value: "Burkina Faso", label: "Burkina Faso" },
    { value: "Burundi", label: "Burundi" },
    { value: "Cabo Verde", label: "Cabo Verde" },
    { value: "Cambodia", label: "Cambodia" },
    { value: "Cameroon", label: "Cameroon" },
    { value: "Canada", label: "Canada" },
    { value: "Central African Republic", label: "Central African Republic" },
    { value: "Chad", label: "Chad" },
    { value: "Chile", label: "Chile" },
    { value: "China", label: "China" },
    { value: "Colombia", label: "Colombia" },
    { value: "Comoros", label: "Comoros" },
    { value: "Congo (Congo-Brazzaville)", label: "Congo (Congo-Brazzaville)" },
    { value: "Costa Rica", label: "Costa Rica" },
    { value: "Croatia", label: "Croatia" },
    { value: "Cuba", label: "Cuba" },
    { value: "Cyprus", label: "Cyprus" },
    { value: "Czechia (Czech Republic)", label: "Czechia (Czech Republic)" },
    {
      value: "Democratic Republic of the Congo",
      label: "Democratic Republic of the Congo",
    },
    { value: "Denmark", label: "Denmark" },
    { value: "Djibouti", label: "Djibouti" },
    { value: "Dominica", label: "Dominica" },
    { value: "Dominican Republic", label: "Dominican Republic" },
    { value: "Ecuador", label: "Ecuador" },
    { value: "Egypt", label: "Egypt" },
    { value: "El Salvador", label: "El Salvador" },
    { value: "Equatorial Guinea", label: "Equatorial Guinea" },
    { value: "Eritrea", label: "Eritrea" },
    { value: "Estonia", label: "Estonia" },
    { value: "Eswatini (fmr. Swaziland)", label: "Eswatini (fmr. Swaziland)" },
    { value: "Ethiopia", label: "Ethiopia" },
    { value: "Fiji", label: "Fiji" },
    { value: "Finland", label: "Finland" },
    { value: "France", label: "France" },
    { value: "Gabon", label: "Gabon" },
    { value: "Gambia", label: "Gambia" },
    { value: "Georgia", label: "Georgia" },
    { value: "Germany", label: "Germany" },
    { value: "Ghana", label: "Ghana" },
    { value: "Greece", label: "Greece" },
    { value: "Grenada", label: "Grenada" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "Guinea", label: "Guinea" },
    { value: "Guinea-Bissau", label: "Guinea-Bissau" },
    { value: "Guyana", label: "Guyana" },
    { value: "Haiti", label: "Haiti" },
    { value: "Honduras", label: "Honduras" },
    { value: "Hungary", label: "Hungary" },
    { value: "Iceland", label: "Iceland" },
    { value: "India", label: "India" },
    { value: "Indonesia", label: "Indonesia" },
    { value: "Iran", label: "Iran" },
    { value: "Iraq", label: "Iraq" },
    { value: "Ireland", label: "Ireland" },
    { value: "Israel", label: "Israel" },
    { value: "Italy", label: "Italy" },
    { value: "Jamaica", label: "Jamaica" },
    { value: "Japan", label: "Japan" },
    { value: "Jordan", label: "Jordan" },
    { value: "Kazakhstan", label: "Kazakhstan" },
    { value: "Kenya", label: "Kenya" },
    { value: "Kiribati", label: "Kiribati" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Kyrgyzstan", label: "Kyrgyzstan" },
    { value: "Laos", label: "Laos" },
    { value: "Latvia", label: "Latvia" },
    { value: "Lebanon", label: "Lebanon" },
    { value: "Lesotho", label: "Lesotho" },
    { value: "Liberia", label: "Liberia" },
    { value: "Libya", label: "Libya" },
    { value: "Liechtenstein", label: "Liechtenstein" },
    { value: "Lithuania", label: "Lithuania" },
    { value: "Luxembourg", label: "Luxembourg" },
    { value: "Madagascar", label: "Madagascar" },
    { value: "Malawi", label: "Malawi" },
    { value: "Malaysia", label: "Malaysia" },
    { value: "Maldives", label: "Maldives" },
    { value: "Mali", label: "Mali" },
    { value: "Malta", label: "Malta" },
    { value: "Marshall Islands", label: "Marshall Islands" },
    { value: "Mauritania", label: "Mauritania" },
    { value: "Mauritius", label: "Mauritius" },
    { value: "Mexico", label: "Mexico" },
    { value: "Micronesia", label: "Micronesia" },
    { value: "Moldova", label: "Moldova" },
    { value: "Monaco", label: "Monaco" },
    { value: "Mongolia", label: "Mongolia" },
    { value: "Montenegro", label: "Montenegro" },
    { value: "Morocco", label: "Morocco" },
    { value: "Mozambique", label: "Mozambique" },
    { value: "Myanmar (Burma)", label: "Myanmar (Burma)" },
    { value: "Namibia", label: "Namibia" },
    { value: "Nauru", label: "Nauru" },
    { value: "Nepal", label: "Nepal" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Nicaragua", label: "Nicaragua" },
    { value: "Niger", label: "Niger" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "North Korea", label: "North Korea" },
    { value: "North Macedonia", label: "North Macedonia" },
    { value: "Norway", label: "Norway" },
    { value: "Oman", label: "Oman" },
    { value: "Palau", label: "Palau" },
    { value: "Palestine State", label: "Palestine State" },
    { value: "Panama", label: "Panama" },
    { value: "Papua New Guinea", label: "Papua New Guinea" },
    { value: "Paraguay", label: "Paraguay" },
    { value: "Peru", label: "Peru" },
    { value: "Philippines", label: "Philippines" },
    { value: "Poland", label: "Poland" },
    { value: "Portugal", label: "Portugal" },
    { value: "Qatar", label: "Qatar" },
    { value: "Romania", label: "Romania" },
    { value: "Russia", label: "Russia" },
    { value: "Rwanda", label: "Rwanda" },
    { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
    { value: "Saint Lucia", label: "Saint Lucia" },
    {
      value: "Saint Vincent and the Grenadines",
      label: "Saint Vincent and the Grenadines",
    },
    { value: "Samoa", label: "Samoa" },
    { value: "San Marino", label: "San Marino" },
    { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "Senegal", label: "Senegal" },
    { value: "Serbia", label: "Serbia" },
    { value: "Seychelles", label: "Seychelles" },
    { value: "Sierra Leone", label: "Sierra Leone" },
    { value: "Singapore", label: "Singapore" },
    { value: "Slovakia", label: "Slovakia" },
    { value: "Slovenia", label: "Slovenia" },
    { value: "Solomon Islands", label: "Solomon Islands" },
    { value: "Somalia", label: "Somalia" },
    { value: "South Africa", label: "South Africa" },
    { value: "South Korea", label: "South Korea" },
    { value: "South Sudan", label: "South Sudan" },
    { value: "Spain", label: "Spain" },
    { value: "Sri Lanka", label: "Sri Lanka" },
    { value: "Sudan", label: "Sudan" },
    { value: "Suriname", label: "Suriname" },
    { value: "Sweden", label: "Sweden" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "Syria", label: "Syria" },
    { value: "Tajikistan", label: "Tajikistan" },
    { value: "Tanzania", label: "Tanzania" },
    { value: "Thailand", label: "Thailand" },
    { value: "Timor-Leste", label: "Timor-Leste" },
    { value: "Togo", label: "Togo" },
    { value: "Tonga", label: "Tonga" },
    { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
    { value: "Tunisia", label: "Tunisia" },
    { value: "Turkey", label: "Turkey" },
    { value: "Turkmenistan", label: "Turkmenistan" },
    { value: "Tuvalu", label: "Tuvalu" },
    { value: "Uganda", label: "Uganda" },
    { value: "Ukraine", label: "Ukraine" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "United States", label: "United States" },
    { value: "Uruguay", label: "Uruguay" },
    { value: "Uzbekistan", label: "Uzbekistan" },
    { value: "Vanuatu", label: "Vanuatu" },
    { value: "Vatican City", label: "Vatican City" },
    { value: "Venezuela", label: "Venezuela" },
    { value: "Vietnam", label: "Vietnam" },
    { value: "Yemen", label: "Yemen" },
    { value: "Zambia", label: "Zambia" },
    { value: "Zimbabwe", label: "Zimbabwe" },
  ];

  const userEmail = auth.currentUser?.email || "";

  return (
    <>
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-blue-800 hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-blue-800">
            Contact Customer Support
          </h1>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        )}
        {successTicket && (
          <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
            Ticket created:{" "}
            <span className="font-semibold">
              {successTicket.ticketId || successTicket._id?.slice(-6)}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-6"
        >
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              What can we help you with today?
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              <option value="order">Order Issue</option>
              <option value="payment">Payment Problem</option>
              <option value="product">Product Inquiry</option>
              <option value="general">General Question</option>
              <option value="accountissue">Account Issues</option>
            </select>
          </div>

          {/* Order Number - only if "Order Issue" is selected */}
          {formData.category === "order" && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) =>
                  setFormData({ ...formData, orderNumber: e.target.value })
                }
                placeholder="Enter your order number (24-char ID)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                Example: 64f3ab19e3c2b4e112345678
              </div>
            </div>
          )}

          {/* Contact Email (optional, for your team’s context only) */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              How can we contact you?
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email || userEmail}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email address"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  !formData.email || isEmail(formData.email || userEmail)
                    ? "border-gray-300 focus:ring-blue-500"
                    : "border-red-300 focus:ring-red-500"
                }`}
              />
              {(formData.email ? isEmail(formData.email) : !!userEmail) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <Select
              options={countryOptions}
              value={
                countryOptions.find(
                  (option) => option.value === formData.country
                ) || null
              }
              onChange={(opt) =>
                setFormData({ ...formData, country: opt?.value || "" })
              }
              placeholder="Start typing your country..."
              isSearchable
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "0.5rem",
                  padding: "2px",
                  borderColor: "#d1d5db",
                }),
              }}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="e.g., Refund for damaged tiles"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explain your issue in detail"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Send Request"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default CustomerSupport;
