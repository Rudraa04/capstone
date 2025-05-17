import React from 'react';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="relative w-full h-[400px] overflow-hidden mb-10">
        <img
          src="../src/images/hero.png" // ✅ updated to your uploaded image
          alt="Ceramic Style"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute top-1/2 left-12 transform -translate-y-1/2 text-white">
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">Elevate Your Space with Premium Tiles</h1>
          <button className="bg-white text-gray-800 px-6 py-3 font-medium rounded shadow hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex w-full px-10 gap-8">
        {/* Sidebar */}
        <aside className="w-1/5 space-y-8 bg-white p-5 rounded-lg shadow border">
          <div>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Categories</h2>
            <ul className="space-y-2 text-gray-700">
              {['Tiles', 'Marble', 'Sanitary Products', 'Granite'].map((item) => (
                <li key={item} className="cursor-pointer hover:text-black transition">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Sizes</h2>
            <ul className="space-y-2 text-gray-700">
              {['12" x 12"', '16" x 16"', '24" x 24"'].map((size) => (
                <li key={size} className="cursor-pointer hover:text-black">
                  {size}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Color</h2>
            <div className="flex gap-3 mt-2">
              {['#ffffff', '#cccccc', '#333333'].map((color, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded-full border border-gray-500 cursor-pointer hover:ring-2 hover:ring-gray-700 transition"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-10">
          {/* Product Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Featured Product</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 border">
                <div className="h-40 bg-gray-300 rounded mb-4" />
                <h3 className="text-lg font-semibold">Beige "Pent-Pattern"</h3>
                <p className="text-gray-500 mb-2">$4.99</p>
                <button className="bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition">
                  View Details
                </button>
              </div>
            </div>
          </section>

          {/* Category Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 p-8 rounded-lg shadow text-center hover:bg-gray-200 transition cursor-pointer">
              <h3 className="text-xl font-semibold">Kitchen Tiles</h3>
            </div>
            <div className="bg-gray-200 p-8 rounded-lg shadow text-center hover:bg-gray-300 transition cursor-pointer">
              <h3 className="text-xl font-semibold">Bathroom Tiles</h3>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
