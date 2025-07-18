import React from "react";
import { useNavigate } from "react-router-dom";
import tileProject from "../images/Tileproject.png";

export default function Projects() {
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
        <h1 className="text-5xl font-bold mb-3">Our Projects</h1>
        <h2 className="text-lg font-bold tracking-wide">
          Excellence delivered across India — one space at a time.
        </h2>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div>
          <img
            src={tileProject}
            alt="Completed Projects"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>

        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">
            Where We’ve Delivered
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We have proudly completed a wide range of projects — from elegant
            residential homes to robust commercial complexes and innovative
            industrial spaces. Each project showcases our dedication to
            craftsmanship, design, and customer satisfaction.
          </p>

          <ul className="list-disc list-inside text-gray-700 text-md">
            <li>Luxury Villas & Apartments</li>
            <li>Corporate Office Interiors</li>
            <li>Shopping Malls & Showrooms</li>
            <li>Hotels & Resorts</li>
            <li>Large-scale Industrial Facilities</li>
          </ul>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-3xl font-bold mb-2">Have a Project in Mind?</h2>
        <p className="text-lg mb-4">
          Let’s build something beautiful together. Reach out today.
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
