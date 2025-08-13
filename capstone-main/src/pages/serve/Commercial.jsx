import React from "react";
import { useNavigate } from "react-router-dom";
import commercialImg from "../../images/Commercial.png"; // ✅ Replace with your actual image name and path

export default function Commercial() {
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
      <div className="bg-blue-700 py-5 px-6 text-center text-white shadow">
        <h1 className="text-5xl font-extrabold mb-3">For Commercial Spaces</h1>
        <p className="text-lg font-light tracking-wide">
          Stylish. Strong. Suited for every business environment.
        </p>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">
            Make Every First Impression Count
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Whether you're designing showrooms, offices, hospitality spaces, or
            commercial outlets, our tiles elevate the experience. Built to
            handle foot traffic while maintaining timeless style and easy
            maintenance — Patel Ceramics is trusted by businesses across India.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-md space-y-2">
            <li>High-durability commercial tile range</li>
            <li>Anti-slip & low-maintenance surfaces</li>
            <li>Elegant styles for professional spaces</li>
            <li>Bulk supply and custom consultation</li>
          </ul>
        </div>

        {/* Image */}
        <div>
          <img
            src={commercialImg}
            alt="Commercial Tile Space"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">
          Ready to Transform Your Commercial Space?
        </h2>
        <p className="text-md mb-4">
          Let us help you choose the perfect tile that balances aesthetics and
          functionality.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
