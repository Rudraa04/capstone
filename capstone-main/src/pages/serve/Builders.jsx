import React from "react";
import { useNavigate } from "react-router-dom";
import buildersImg from "../../images/Builders.png"; // Replace with a builder-specific image if available

export default function Builders() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>
      {/* Header Banner */}
      <div className="bg-blue-700 py-5 px-6 text-center text-white shadow">
        <h1 className="text-5xl font-extrabold mb-3">
          For Builders & Contractors
        </h1>
        <p className="text-lg font-light tracking-wide">
          Large-scale tile solutions delivered with precision and trust.
        </p>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">
            Reliable Partner for Large Projects
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We support builders and contractors with high-volume supply of
            ceramic tiles, marble, granite, and sanitaryware. Our products meet
            both technical standards and visual appeal, helping you complete
            your projects on time and on budget — without compromise.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-md space-y-2">
            <li>Bulk ordering and logistics support</li>
            <li>Strict quality control and consistency</li>
            <li>Fast turnaround on large shipments</li>
            <li>Dedicated support for contract bids</li>
          </ul>
        </div>

        {/* Image */}
        <div>
          <img
            src={buildersImg}
            alt="Construction Site Tiles"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">Let’s Build Something Great</h2>
        <p className="text-md mb-4">
          Partner with Patel Ceramics for dependable tile supply on your next
          construction project.
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
