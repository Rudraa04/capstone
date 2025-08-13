import React from "react";
import { useNavigate } from "react-router-dom";
import bulkOrdersImg from "../../images/Bulkorder.png"; // Update with your actual image file

export default function BulkOrders() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>
      {/* Header */}
      <div className="bg-blue-700 text-white text-center py-5 px-6 shadow">
        <h1 className="text-5xl font-extrabold mb-3">Bulk Orders</h1>
        <p className="text-lg font-light">
          Streamlined supply. Reliable partnerships.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">
            Scale With Confidence
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Patel Ceramics offers seamless support for bulk purchases with
            flexible logistics, consistent quality, and tailored pricing. Our
            trusted supply chain helps businesses like yours stay on time and
            within budget.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Wholesale pricing for large quantities</li>
            <li>Nationwide delivery network</li>
            <li>Dedicated support for repeat clients</li>
            <li>Custom packaging & labeling options</li>
          </ul>
        </div>

        {/* Image */}
        <div>
          <img
            src={bulkOrdersImg}
            alt="Bulk tile supply pallets"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">Partner With Patel Ceramics</h2>
        <p className="text-md mb-4">
          Need a steady supply for your upcoming project or retail business?
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact Sales Team
        </a>
      </div>
    </div>
  );
}
