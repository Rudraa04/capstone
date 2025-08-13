import React from "react";
import { useNavigate } from "react-router-dom";
import designerImg from "../../images/Designer.png"; // ✅ Replace with actual file path and name

export default function Designers() {
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
      <div className="bg-blue-700 py-5 px-6 text-center text-white shadow">
        <h1 className="text-5xl font-extrabold mb-3">For Interior Designers</h1>
        <p className="text-lg font-light tracking-wide">
          Designs that inspire. Support that empowers.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">
            Craft With Confidence
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We collaborate with interior designers to provide thoughtfully
            curated tile collections that elevate creative freedom. From
            timeless tones to contemporary textures, our versatile styles bring
            any concept to life — residential or commercial.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-md space-y-2">
            <li>Exclusive trend-driven collections</li>
            <li>Mix-and-match textures & finishes</li>
            <li>Flexible sizing for every layout</li>
            <li>Dedicated design consultation support</li>
          </ul>
        </div>

        {/* Image */}
        <div>
          <img
            src={designerImg}
            alt="Interior Designer Collaboration"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">
          Let’s Design Something Extraordinary
        </h2>
        <p className="text-md mb-4">
          Connect with us and discover materials that match your creativity and
          vision.
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
