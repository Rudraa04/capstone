import React from "react";
import { useNavigate } from "react-router-dom";
import architectImg from "../../images/Architect.png"; // You can replace with an architect-specific image

export default function Architects() {
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
        <h1 className="text-5xl font-extrabold mb-3">For Architects</h1>
        <p className="text-lg font-light tracking-wide">
          Partnering with design thinkers to bring bold ideas to life.
        </p>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-black">
            Design Meets Performance
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            At Patel Ceramics, we understand the creative vision that architects
            bring to every project. That’s why we offer an extensive range of
            tiles and sanitary products that combine aesthetics with technical
            precision. From concept to completion, we’re here to support your
            designs with high-quality, customizable materials.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-md space-y-2">
            <li>Broad selection of textures, finishes, and sizes</li>
            <li>Durability and quality assurance</li>
            <li>Custom tile solutions and prototyping</li>
            <li>Design consultations and samples</li>
          </ul>
        </div>

        {/* Image Section */}
        <div>
          <img
            src={architectImg}
            alt="Architect Collaboration"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">Work With Our Design Team</h2>
        <p className="text-md mb-4">
          Let’s bring your next architectural vision to life together.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-900 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
