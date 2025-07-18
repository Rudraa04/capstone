import React from "react";
import { useNavigate } from "react-router-dom";
import deliveryImg from "../../images/NationwideDelivery.png"; // Replace with your actual image path

export default function NationwideDelivery() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>
      {/* Hero Section */}
      <div className="bg-blue-700 text-white text-center py-5 px-6 shadow-md">
        <h1 className="text-5xl font-extrabold mb-3">Nationwide Delivery</h1>
        <p className="text-lg font-light">
          Reliable. Fast. Wherever you are in India.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">
            Reaching Every Corner of India
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Whether you’re in a metro city or a remote location, Patel Ceramics
            guarantees secure and timely delivery of tiles and sanitaryware
            through our trusted nationwide logistics network. Your materials
            will arrive on time, every time.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Pan-India coverage with partner logistics</li>
            <li>Real-time tracking & order updates</li>
            <li>Sturdy packaging for damage-free transit</li>
            <li>Support for bulk and small shipments</li>
          </ul>
        </div>

        {/* Image Content */}
        <div>
          <img
            src={deliveryImg}
            alt="Truck delivering ceramic tiles across India"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">
          Need Materials Delivered to Your Site?
        </h2>
        <p className="text-md mb-4">
          Get hassle-free delivery service no matter where you build — reach out
          to us today.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact for Delivery
        </a>
      </div>
    </div>
  );
}
