import React from "react";
import { Link } from "react-router-dom";

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
            <li>
              <a href="/interior">Interior</a>
            </li>
            <li>
              <a href="/exterior">Exterior</a>
            </li>
            <li>
              <a href="/sanitary">Sanitaryware</a>
            </li>
            <li>
              <a href="/slabs">Granite & Marble</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/projects">Projects</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Who We Serve */}
        <div>
          <h4 className="font-semibold mb-4">Who We Serve</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/serve/homeowners">Homeowners</a>
            </li>
            <li>
              <a href="/serve/architects">Architects</a>
            </li>
            <li>
              <a href="/serve/designers">Interior Designers</a>
            </li>
            <li>
              <a href="/serve/builders">Builders & Contractors</a>
            </li>
            <li>
              <a href="/serve/commercial">Commercial Spaces</a>
            </li>
          </ul>
        </div>

        {/* Column 5: What We Do */}
        <div>
          <h4 className="font-semibold mb-4">What We Do</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/services/custom-design">Custom Design</a>
            </li>
            <li>
              <a href="/services/bulk-orders">Bulk Orders</a>
            </li>
            <li>
              <a href="/services/quality">Quality Assurance</a>
            </li>
            <li>
              <a href="/services/delivery">Nationwide Delivery</a>
            </li>
          </ul>
        </div>

        {/* Column 6: Follow Us */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-white text-lg">
            <a
              href="https://www.patelceramics.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              🌐
            </a>
            <a
              href="https://facebook.com/patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              📘
            </a>
            <a
              href="https://instagram.com/patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              📸
            </a>
            <a
              href="https://youtube.com/@patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-700 mb-6" />

      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 gap-4 text-sm">
        <p>© {new Date().getFullYear()} Patel Ceramics. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms of Use
          </a>
          <a href="/sitemap" className="hover:text-white">
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
