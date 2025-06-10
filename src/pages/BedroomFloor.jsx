import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

import bedroomfloor1 from "../images/bedroomfloor1.jpg";
import bedroomfloor2 from "../images/bedroomfloor2.jpg";
import bedroomfloor3 from "../images/bedroomfloor3.jpg";
import bedroomfloor4 from "../images/bedroomfloor4.jpg";
import bedroomfloor5 from "../images/bedroomfloor5.jpg";

const bedroomFloorTiles = [
  { img: bedroomfloor1, name: "White Glossy Tile", desc: "Bright and elegant for modern luxury bedrooms." },
  { img: bedroomfloor2, name: "Charcoal Stone Tile", desc: "Bold matte finish, adds strong contrast." },
  { img: bedroomfloor3, name: "Desert Cream Tile", desc: "Subtle marble veins, warm and calming." },
  { img: bedroomfloor4, name: "City View Tile", desc: "Minimal design for high-rise apartments." },
  { img: bedroomfloor5, name: "Textured Beige Tile", desc: "Natural texture perfect for comfort zones." },
];

export default function BedroomFloor() {
  return (
    <div className="bg-white text-gray-900">
      <Header />

      <section
        className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center shadow-inner"
        style={{ backgroundImage: `url(${bedroomfloor1})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-extrabold">Bedroom Floor Tiles</h1>
          <p className="text-lg mt-4">Perfect flooring to match the comfort of your space</p>
        </div>
      </section>

      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Explore Bedroom Floor Tiles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {bedroomFloorTiles.map((tile, i) => (
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
