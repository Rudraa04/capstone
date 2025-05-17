import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';

export default function Home() {
  const [showCeramics, setShowCeramics] = useState(false);
  const [showSlabs, setShowSlabs] = useState(false);
  const ceramicsRef = useRef(null);
  const slabsRef = useRef(null);
  const [ceramicHeight, setCeramicHeight] = useState(0);
  const [slabHeight, setSlabHeight] = useState(0);

  useEffect(() => {
    if (ceramicsRef.current) {
      setCeramicHeight(showCeramics ? ceramicsRef.current.scrollHeight : 0);
    }
    if (slabsRef.current) {
      setSlabHeight(showSlabs ? slabsRef.current.scrollHeight : 0);
    }
  }, [showCeramics, showSlabs]);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <Header />

      {/* Hero Section */}
      <div className="relative w-full h-[400px] overflow-hidden mb-10">
        <img
          src="../src/images/hero.png"
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
        {/* Left Panel */}
        <aside className="w-1/4 space-y-6">
          {/* SLABS Box */}
          <div>
            <div
              onClick={() => setShowSlabs(!showSlabs)}
              className="bg-gray-100 p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 flex items-center justify-between"
            >
              <h3 className="text-xl font-bold">SLABS</h3>
              <span className="text-red-600 text-xl font-bold">{showSlabs ? '˄' : '>'}</span>
            </div>

            <div
              ref={slabsRef}
              style={{
                maxHeight: `${slabHeight}px`,
                transition: 'max-height 0.4s ease-in-out',
                overflow: 'hidden',
              }}
              className="mt-2"
            >
              <div className="mt-4 space-y-4">
                {['MARBLE', 'GRANITE'].map((item) => (
                  <div
                    key={item}
                    className="bg-gray-200 p-5 rounded-lg shadow flex items-center justify-between hover:bg-gray-300 cursor-pointer transition"
                  >
                    <h4 className="text-lg font-semibold">{item}</h4>
                    <span className="text-red-600 text-xl font-bold">{'>'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CERAMICS Box */}
          <div>
            <div
              onClick={() => setShowCeramics(!showCeramics)}
              className="bg-gray-100 p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 flex items-center justify-between"
            >
              <h3 className="text-xl font-bold">CERAMICS</h3>
              <span className="text-red-600 text-xl font-bold">{showCeramics ? '˄' : '>'}</span>
            </div>

            <div
              ref={ceramicsRef}
              style={{
                maxHeight: `${ceramicHeight}px`,
                transition: 'max-height 0.4s ease-in-out',
                overflow: 'hidden',
              }}
              className="mt-2"
            >
              <div className="mt-4 space-y-4">
                {['TILES', 'BATHTUBS', 'SINKS', 'TOILETS'].map((item) => (
                  <div
                    key={item}
                    className="bg-gray-200 p-5 rounded-lg shadow flex items-center justify-between hover:bg-gray-300 cursor-pointer transition"
                  >
                    <h4 className="text-lg font-semibold">{item}</h4>
                    <span className="text-red-600 text-xl font-bold">{'>'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Trending Now */}
        <main className="flex-1">
          <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 border">
                <div className="h-40 bg-gray-300 rounded mb-4" />
                <h3 className="text-lg font-semibold">Tile Product {i + 1}</h3>
                <p className="text-gray-500 mb-2">$4.99</p>
                <button className="bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
