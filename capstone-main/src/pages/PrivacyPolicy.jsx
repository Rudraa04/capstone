import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-800">
      {/* Header Section – Now Topmost */}
      <div className="bg-blue-700 text-white text-center py-5 px-6 shadow">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white text-blue-900 px-4 py-2 rounded shadow hover:bg-gray-100 transition"
        >
          ← Back
        </button>
        <h1 className="text-5xl font-extrabold mb-3">Privacy Policy</h1>
        <p className="text-lg font-light">
          Transparency and trust are the foundation of our service.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-gray-700 text-md leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            1. Introduction
          </h2>
          <p>
            Patel Ceramics values your privacy and is committed to protecting
            your personal data. This policy outlines how we collect, use, and
            safeguard your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            2. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Contact information (name, email, phone number)</li>
            <li>Address details for delivery purposes</li>
            <li>Browsing and interaction data on our website</li>
            <li>Order and transaction history</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            3. How We Use Your Information
          </h2>
          <p>We use your data to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Process orders and deliver products</li>
            <li>Provide customer support</li>
            <li>Improve our website and services</li>
            <li>Send promotions or updates (only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            4. Data Protection
          </h2>
          <p>
            We implement technical and organizational security measures to
            protect your data against unauthorized access, loss, or misuse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            5. Third-Party Services
          </h2>
          <p>
            We do not sell your personal data. However, we may share limited
            information with trusted third-party services such as payment
            processors or shipping providers, strictly for order fulfillment
            purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data
            at any time. Please contact us at{" "}
            <strong>support@patelceramics.com</strong> for assistance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            7. Updates to This Policy
          </h2>
          <p>
            We may update this Privacy Policy periodically. Any changes will be
            posted here with an updated effective date.
          </p>
        </section>

        <p className="text-sm text-gray-500">Effective Date: July 2025</p>
      </div>
    </div>
  );
}
