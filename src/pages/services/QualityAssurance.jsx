import React from "react";
import { useNavigate } from "react-router-dom";
import qaImg from "../../images/QualityAssurance.png"; // Replace with your actual image file path

export default function QualityAssurance() {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 bg-white text-blue-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Back
      </button>
      {/* Hero Header */}
      <div className="bg-blue-700 text-white text-center py-5 px-6 shadow-md">
        <h1 className="text-5xl font-extrabold mb-3">Quality Assurance</h1>
        <p className="text-lg font-light">Where precision meets perfection.</p>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text Block */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-4">
            Every Tile, Thoroughly Tested
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            At Patel Ceramics, quality is not an afterthought — it’s built into
            our process. Each tile undergoes a comprehensive inspection for
            durability, surface finish, color consistency, and dimensional
            accuracy before it ever leaves our facility.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Impact & load-bearing strength tests</li>
            <li>Gloss & matte finish quality control</li>
            <li>Color tone & consistency verification</li>
            <li>Surface smoothness & dimensional checks</li>
          </ul>
        </div>

        {/* Image Block */}
        <div>
          <img
            src={qaImg}
            alt="Tile quality inspection at factory"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-2xl font-bold mb-2">
          Expect Nothing Less Than Excellence
        </h2>
        <p className="text-md mb-4">
          Talk to us to learn how we maintain high standards for every product.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact Our QA Team
        </a>
      </div>
    </div>
  );
}
