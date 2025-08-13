import React from "react";
import { useNavigate } from "react-router-dom";
import slide3 from "../images/slide3.png";

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      {/* Header Banner */}
      <div className="bg-blue-700 py-5 px-6 text-center text-white shadow">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          ← Back
        </button>
        <h1 className="text-5xl  font-extrabold mb-3">About Patel Ceramics</h1>
        <p className="text-lg font-light tracking-wide">
          Crafting beauty, delivering trust — since day one.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div>
          <img
            src={slide3}
            alt="About Patel Ceramics"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>

        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">Who We Are</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Patel Ceramics is one of India’s leading providers of ceramic tiles,
            granite, marble, and sanitaryware. With a deep commitment to quality
            and innovation, we help customers transform spaces into stunning
            works of art — whether for homes, offices, or large commercial
            projects.
          </p>

          <h3 className="text-2xl font-semibold mb-2 text-black">
            Our Mission
          </h3>
          <p className="text-gray-700 leading-relaxed text-md">
            To supply superior ceramic products that blend durability, design,
            and sustainability — while providing unmatched service to customers
            across India and worldwide.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-700 text-white text-center text-blackshadow py-12 px-6 mt-16 shadow">
        <h2 className="text-3xl font-bold mb-2">
          Let’s Build Something Beautiful
        </h2>
        <p className="text-lg mb-4">
          Get in touch to explore designs tailored to your space.
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
