import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

import bedroomwall1 from "../images/bedroomwall1.jpg";
import bedroomwall2 from "../images/bedroomwall2.jpg";
import bedroomwall3 from "../images/bedroomwall3.jpg";
import bedroomwall4 from "../images/bedroomwall4.jpg";

const bedroomWallTiles = [
  { img: bedroomwall1, name: "Classic Beige Tile", desc: "Warm tones perfect for cozy bedrooms." },
  { img: bedroomwall2, name: "Modern Mix Tile", desc: "Stylish blend of textures for a modern look." },
  { img: bedroomwall3, name: "Wood Matte Tile", desc: "Earthy texture ideal for serene settings." },
  { img: bedroomwall4, name: "Striped Pattern Tile", desc: "Unique strip patterns for elegant walls." },
];

export default function BedroomWall() {
  return (
    <div className="bg-white text-gray-900">
      <Header />

      <section className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center shadow-inner" style={{ backgroundImage: `url(${bedroomwall1})` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-extrabold">Bedroom Wall Tiles</h1>
          <p className="text-lg mt-4">Elegant tiles that add warmth and personality to your space</p>
        </div>
      </section>

      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Explore Bedroom Tiles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {bedroomWallTiles.map((tile, i) => (
            <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group">
              <img src={tile.img} alt={tile.name} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{tile.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tile.desc}</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
