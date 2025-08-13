import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-800">
      {/* Header with Back Button */}
      <div className="relative bg-blue-700 text-white py-16 px-6 shadow">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white text-blue-900 px-4 py-2 rounded shadow hover:bg-gray-100 transition"
        >
          ← Back
        </button>

        <div className="text-center">
          <h1 className="text-5xl font-extrabold mb-3">Terms of Use</h1>
          <p className="text-lg font-light">
            Know your rights and responsibilities while using our services.
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-gray-700 text-md leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the Patel Ceramics website, you agree to
            abide by the terms outlined in this document. If you do not accept
            these terms, please refrain from using our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            2. Use of Content
          </h2>
          <p>
            All content including text, images, graphics, and product data is
            the intellectual property of Patel Ceramics and may not be copied or
            redistributed without permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            3. User Responsibilities
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Provide accurate information when placing orders or inquiries
            </li>
            <li>Do not misuse or damage our website and its features</li>
            <li>
              Refrain from posting or transmitting offensive or unlawful content
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            4. Product Information
          </h2>
          <p>
            While we aim to ensure accuracy, product descriptions, pricing, and
            availability may change without notice. Images may slightly vary
            from actual products.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            5. Limitation of Liability
          </h2>
          <p>
            Patel Ceramics is not liable for any direct or indirect damages
            resulting from the use or inability to use this website or our
            products, beyond applicable consumer protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            6. Changes to Terms
          </h2>
          <p>
            We may update these terms at any time. Continued use of the website
            after updates means you accept the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-black">
            7. Contact Information
          </h2>
          <p>
            For any questions regarding these terms, please contact us at:{" "}
            <strong>support@patelceramics.com</strong>
          </p>
        </section>

        <p className="text-sm text-gray-500">Effective Date: July 2025</p>
      </div>
    </div>
  );
}
