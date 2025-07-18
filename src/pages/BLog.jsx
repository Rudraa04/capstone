import React from "react";
import { useNavigate } from "react-router-dom";

export default function BLog() {
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
        <h1 className="text-5xl font-extrabold mb-3">Our Blog</h1>
        <p className="text-lg font-light tracking-wide">
          Tile trends, expert tips, and style inspiration — all in one place.
        </p>
      </div>

      {/* Blog Intro */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-700 text-lg leading-relaxed">
          Welcome to the Patel Ceramics blog! Here we share design inspiration,
          product trends, maintenance tips, and everything you need to know to
          transform your home or commercial space with style.
        </p>
      </div>

      {/* Blog Post Grid (Placeholder Cards) */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition p-6"
          >
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 text-sm">
              Future blog articles will appear here. Stay tuned for updates on
              tile trends, best practices, and expert advice!
            </p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-10">
        <h2 className="text-2xl font-bold mb-2">
          Want to contribute or suggest a topic?
        </h2>
        <p className="text-md mb-4">We’d love to hear your ideas.</p>
        <a
          href="mailto:support@patelceramics.com"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
