import React from 'react';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="bg-primary min-h-screen text-dark">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-1/5 p-4 space-y-6">
          <div>
            <h2 className="font-semibold mb-2">Shop by Category</h2>
            <ul className="space-y-2">
              <li>Tiles</li>
              <li>Marble</li>
              <li>Sanitary Products</li>
              <li>Granite</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Size</h2>
            <ul className="space-y-2">
              <li>12" x 12"</li>
              <li>16" x 16"</li>
              <li>24" x 24"</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Color</h2>
            <div className="flex gap-2">
              <span className="w-6 h-6 bg-white border rounded-full"></span>
              <span className="w-6 h-6 bg-gray-200 border rounded-full"></span>
              <span className="w-6 h-6 bg-[#c2703d] border rounded-full"></span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="bg-[#e7d8c4] p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">Upgrade Your Home with Stylish Tiles</h2>
            <button className="bg-accent text-white px-4 py-2 rounded">Shop Now</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#ede1d2] p-4 rounded">Kitchen Tiles</div>
            <div className="bg-[#d3cdc5] p-4 rounded">Bathroom Tiles</div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Trending Now</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* Add ProductCard component here later */}
            <div className="bg-white p-4 rounded shadow">
              <div className="h-24 bg-[#e6dac4] mb-2"></div>
              <p>Beige "Pent-Pattern"</p>
              <p>$4.99</p>
            </div>
            {/* Repeat or map data */}
          </div>
        </main>
      </div>
    </div>
  );
}
