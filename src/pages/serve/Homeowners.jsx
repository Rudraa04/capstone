import React from "react";
import { useNavigate } from "react-router-dom";
import homeownersImg from "../../images/Homeowner.png"; // Make sure to replace with your actual image path

export default function Homeowners() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>
      {/* Header Section */}
      <div className="bg-blue-700 py-5 px-6 text-center text-white shadow-md">
        <h1 className="text-5xl font-extrabold mb-3">For Homeowners</h1>
        <p className="text-lg font-light tracking-wide">
          Affordable elegance. Everyday comfort.
        </p>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">
            Your Home, Your Style
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Whether you're remodeling a cozy bathroom or designing your dream
            kitchen, Patel Ceramics offers homeowners a wide range of modern,
            durable, and stylish tile and sanitaryware solutions that turn
            houses into beautiful homes.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-md space-y-2">
            <li>Trendy yet timeless tile collections</li>
            <li>Durable materials for everyday use</li>
            <li>Budget-friendly options without compromise</li>
            <li>Guidance for DIY or professional installs</li>
          </ul>
        </div>

        {/* Image */}
        <div>
          <img
            src={homeownersImg}
            alt="Elegant living space for homeowners"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white text-center py-10 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">
          Let’s Build Your Dream Home Together
        </h2>
        <p className="text-md mb-4">
          Get personalized tile suggestions and material support tailored to
          your vision.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact Our Team
        </a>
      </div>
    </div>
  );
}
