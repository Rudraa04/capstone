import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sitemap() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-800">
      {/* Header Section with Back Button */}
      <div className="relative bg-blue-700 text-white py-16 px-6 shadow">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white text-blue-900 px-4 py-2 rounded shadow hover:bg-gray-100 transition"
        >
          ← Back
        </button>

        <div className="text-center">
          <h1 className="text-5xl font-extrabold mb-3">Sitemap</h1>
          <p className="text-lg font-light">
            Explore all pages across our website.
          </p>
        </div>
      </div>

      {/* Sitemap Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10 text-md text-gray-800">
        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-black">🧱 Products</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a href="/interior" className="text-blue-700 hover:underline">
                Interior Tiles
              </a>
            </li>
            <li>
              <a href="/exterior" className="text-blue-700 hover:underline">
                Exterior Tiles
              </a>
            </li>
            <li>
              <a href="/sanitary" className="text-blue-700 hover:underline">
                Sanitaryware
              </a>
            </li>
            <li>
              <a href="/slabs" className="text-blue-700 hover:underline">
                Granite & Marble
              </a>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-black">🏢 Company</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a href="/about" className="text-blue-700 hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="/projects" className="text-blue-700 hover:underline">
                Projects
              </a>
            </li>
            <li>
              <a href="/contact" className="text-blue-700 hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="/blog" className="text-blue-700 hover:underline">
                Blog
              </a>
            </li>
          </ul>
        </div>

        {/* Who We Serve */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-black">
            👥 Who We Serve
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a
                href="/serve/homeowners"
                className="text-blue-700 hover:underline"
              >
                Homeowners
              </a>
            </li>
            <li>
              <a
                href="/serve/architects"
                className="text-blue-700 hover:underline"
              >
                Architects
              </a>
            </li>
            <li>
              <a
                href="/serve/designers"
                className="text-blue-700 hover:underline"
              >
                Interior Designers
              </a>
            </li>
            <li>
              <a
                href="/serve/builders"
                className="text-blue-700 hover:underline"
              >
                Builders & Contractors
              </a>
            </li>
            <li>
              <a
                href="/serve/commercial"
                className="text-blue-700 hover:underline"
              >
                Commercial Spaces
              </a>
            </li>
          </ul>
        </div>

        {/* What We Do */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-black">🛠️ What We Do</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a
                href="/services/custom-design"
                className="text-blue-700 hover:underline"
              >
                Custom Design
              </a>
            </li>
            <li>
              <a
                href="/services/bulk-orders"
                className="text-blue-700 hover:underline"
              >
                Bulk Orders
              </a>
            </li>
            <li>
              <a
                href="/services/quality"
                className="text-blue-700 hover:underline"
              >
                Quality Assurance
              </a>
            </li>
            <li>
              <a
                href="/services/delivery"
                className="text-blue-700 hover:underline"
              >
                Nationwide Delivery
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-black">📜 Legal</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a
                href="/privacy-policy"
                className="text-blue-700 hover:underline"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-blue-700 hover:underline">
                Terms of Use
              </a>
            </li>
            <li>
              <a href="/sitemap" className="text-blue-700 hover:underline">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
