import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-4 sm:px-10 py-12 mt-16 text-sm">
      {/* Top Section - 6 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
        {/* Column 1: Company Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">Patel Ceramics</h3>
          <p className="text-gray-300">
            Crafting beauty in every tile. Serving excellence across India and
            globally.
          </p>
        </div>

        {/* Column 2: Products */}
        <div>
          <h4 className="font-semibold mb-4">Products</h4>
          <ul className="space-y-2 text-gray-300">
            <li>Wall Tiles</li>
            <li>Floor Tiles</li>
            <li>Sanitaryware</li>
            <li>Granite & Marble</li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-300">
            <li>About Us</li>
            <li>Projects</li>
            <li>Contact</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Column 4: Who We Serve */}
        <div>
          <h4 className="font-semibold mb-4">Who We Serve</h4>
          <ul className="space-y-2 text-gray-300">
            <li>Homeowners</li>
            <li>Architects</li>
            <li>Interior Designers</li>
            <li>Builders & Contractors</li>
            <li>Commercial Spaces</li>
          </ul>
        </div>

        {/* Column 5: What We Do */}
        <div>
          <h4 className="font-semibold mb-4">What We Do</h4>
          <ul className="space-y-2 text-gray-300">
            <li>Tile Manufacturing</li>
            <li>Custom Design</li>
            <li>Bulk Orders</li>
            <li>Quality Assurance</li>
            <li>Nationwide Delivery</li>
          </ul>
        </div>

        {/* Column 6: Follow Us */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-white text-lg">
            <span role="img" aria-label="web">🌐</span>
            <span role="img" aria-label="facebook">📘</span>
            <span role="img" aria-label="instagram">📸</span>
            <span role="img" aria-label="youtube">▶</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-700 mb-6" />

      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 gap-4 text-sm">
        <p>© {new Date().getFullYear()} Patel Ceramics. All rights reserved.</p>

        <div className="flex gap-4">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Use</a>
          <a href="#" className="hover:text-white">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
