import React, { useState } from 'react';
import Header from '../components/Header';

export default function Home() {
  const [showCategory, setShowCategory] = useState(true);
  const [showSize, setShowSize] = useState(true);
  const [showColor, setShowColor] = useState(true);

  return (
    <div className="bg-primary min-h-screen text-dark">
      <Header />

      <div className="flex">
        {/* Sidebar - Hover Expandable */}
        <aside className="group relative transition-all duration-300 w-[20px] hover:w-64 overflow-hidden bg-primary p-4 space-y-6 border-r">

          {/* Vertical "Filters →" Label (Right-Aligned, Low to Top) */}
          <div className="absolute bottom-10 -right-[36px] rotate-90 origin-bottom-left text-xs font-semibold group-hover:hidden">
            Filters 
          </div>

          {/* Sidebar Title */}
          <h2 className="font-bold text-lg hidden group-hover:block mb-2">Filters</h2>

          {/* Category */}
          <div>
            <div
              onClick={() => setShowCategory(!showCategory)}
              className="hidden group-hover:flex font-semibold mb-2 cursor-pointer justify-between items-center"
            >
              <span>Shop by Category</span>
              <span>{showCategory ? '−' : '+'}</span>
            </div>
            {showCategory && (
              <ul className="space-y-2 pl-2 hidden group-hover:block">
                <li>Tiles</li>
                <li>Marble</li>
                <li>Sanitary Products</li>
                <li>Granite</li>
              </ul>
            )}
          </div>

          {/* Size */}
          <div>
            <div
              onClick={() => setShowSize(!showSize)}
              className="hidden group-hover:flex font-semibold mb-2 cursor-pointer justify-between items-center"
            >
              <span>Size</span>
              <span>{showSize ? '−' : '+'}</span>
            </div>
            {showSize && (
              <ul className="space-y-2 pl-2 hidden group-hover:block">
                <li>12&quot; x 12&quot;</li>
                <li>16&quot; x 16&quot;</li>
                <li>24&quot; x 24&quot;</li>
              </ul>
            )}
          </div>

          {/* Color */}
          <div>
            <div
              onClick={() => setShowColor(!showColor)}
              className="hidden group-hover:flex font-semibold mb-2 cursor-pointer justify-between items-center"
            >
              <span>Color</span>
              <span>{showColor ? '−' : '+'}</span>
            </div>
            {showColor && (
              <div className="flex gap-2 pl-1 hidden group-hover:flex">
                <span className="w-6 h-6 bg-white border rounded-full"></span>
                <span className="w-6 h-6 bg-gray-200 border rounded-full"></span>
                <span className="w-6 h-6 bg-[#c2703d] border rounded-full"></span>
              </div>
            )}
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
            <div className="bg-white p-4 rounded shadow">
              <div className="h-24 bg-[#e6dac4] mb-2"></div>
              <p>Beige "Pent-Pattern"</p>
              <p>$4.99</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
