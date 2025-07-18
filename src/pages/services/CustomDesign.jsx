import React from "react";
import { useNavigate } from "react-router-dom";
import customDesignImg from "../../images/Customdesign.png"; // Replace with actual image path

export default function CustomDesign() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>
      {/* Hero Banner */}
      <div className="bg-blue-700 text-white text-center py-5 px-6 shadow-md">
        <h1 className="text-5xl font-extrabold mb-3">Custom Design</h1>
        <p className="text-lg font-light">Your vision. Our craftsmanship.</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text Section */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">
            Tailored Tiles for Unique Spaces
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            At Patel Ceramics, we believe in individuality. Our custom design
            service empowers clients to create bespoke tile patterns, finishes,
            and colors that reflect their personal or brand identity. From
            luxury homes to signature commercial spaces — we turn ideas into
            stunning surfaces.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Custom patterns, textures & colors</li>
            <li>Client collaboration with design experts</li>
            <li>Low minimums for unique small-batch orders</li>
            <li>Support for architects and brand concepts</li>
          </ul>
        </div>

        {/* Image Section */}
        <div>
          <img
            src={customDesignImg}
            alt="Custom tile design"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">
          Design Something Truly Yours
        </h2>
        <p className="text-md mb-4">
          Share your vision with our team and bring your custom tile dreams to
          life.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Start Your Design
        </a>
      </div>
    </div>
  );
}
