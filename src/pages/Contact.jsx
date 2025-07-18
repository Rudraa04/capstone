import React from "react";
import { useNavigate } from "react-router-dom";
import contactImage from "../images/Contact.png"; // Optional image — replace if you have a better one

export default function Contact() {
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
        <h1 className="text-5xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-lg font-light tracking-wide">
          Let’s start something beautiful together.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Contact Details */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-black">Get in Touch</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Reach out for product inquiries, design consultations, or custom
            orders. Our team will get back to you within 24 hours.
          </p>

          <ul className="text-md text-gray-700 space-y-4">
            <li>
              <strong>Email:</strong> support@patelceramics.com
            </li>
            <li>
              <strong>Phone:</strong> +91 98765 43210
            </li>
            <li>
              <strong>Location:</strong> Mahemdabad, Gujarat, India
            </li>
          </ul>
        </div>

        {/* Image (Optional) */}
        <div>
          <img
            src={contactImage}
            alt="Contact Patel Ceramics"
            className="rounded-lg shadow-lg w-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-blue-700 text-white text-center py-12 px-6 mt-16">
        <h2 className="text-3xl font-bold mb-2">Looking for a Custom Quote?</h2>
        <p className="text-lg mb-4">
          We’d love to learn more about your needs and how we can help.
        </p>
        <a
          href="mailto:support@patelceramics.com"
          className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-md shadow hover:bg-gray-100 transition"
        >
          Email Us Now
        </a>
      </div>
    </div>
  );
}
