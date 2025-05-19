import React, { useEffect } from "react";
import Header from "../components/Header";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import slide3Image from "../images/slide3.png";
import slideImage from "../images/slide.png";
import slide2Image from "../images/slide2.png";
import { Link } from "react-router-dom";
import exteriorImg from "../images/exterior.png";
import interiorImage from "../images/interior.png";
import sanitaryImage from "../images/sanitary.png";

export default function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="bg-white text-gray-900 font-sans">
      <Header />

      {/* Hero Slider */}
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
        className="rounded-b-xl"
      >
        <div
          className="relative w-full h-[600px] bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${slide3Image})` }}
        >
          <div className="absolute top-1/2 left-10 transform -translate-y-1/2 text-white max-w-xl">
            <h2 className="text-4xl font-bold drop-shadow-xl mb-3">
              Transform Your Interiors
            </h2>
            <p className="text-lg mb-4 drop-shadow">
              High-gloss designer tiles for modern spaces.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded shadow hover:bg-gray-100">
              Shop Now
            </button>
          </div>
        </div>

        <div
          className="relative w-full h-[600px] bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${slideImage})` }}
        >
          <div className="absolute top-1/2 left-10 transform -translate-y-1/2 text-white max-w-xl">
            <h2 className="text-4xl font-bold drop-shadow-xl mb-3">
              Crafting Spaces with Elegance
            </h2>
            <p className="text-lg mb-4 drop-shadow">
              Experience premium ceramic solutions by Patel Ceramics.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded shadow hover:bg-gray-100">
              Explore Collection
            </button>
          </div>
        </div>

        <div
          className="relative w-full h-[600px] bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${slide2Image})` }}
        >
          <div className="absolute top-1/2 left-20 transform -translate-y-1/2 text-white max-w-xl">
            <h2 className="text-4xl font-bold drop-shadow-xl mb-3">
              Elegance in Every Tile
            </h2>
            <p className="text-lg mb-4 drop-shadow">
              Choose from a premium range of marble, floor & wall tiles.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded shadow hover:bg-gray-100">
              Browse Now
            </button>
          </div>
        </div>
      </Carousel>

      {/* Category Highlights */}
      <section className="px-10 py-10" data-aos="fade-up">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Interior", bg: interiorImage },
            { name: "Exterior", bg: exteriorImg }, // ✅ Using imported image
            { name: "Sanitaryware", bg: sanitaryImage },
          ].map((cat, i) => (
            <div
              key={i}
              className="relative w-full h-[300px] rounded-lg overflow-hidden group cursor-pointer shadow hover:shadow-lg transition"
            >
              <img
                src={cat.bg}
                alt={cat.name}
                className="w-full h-full object-cover brightness-140 transition duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-center p-4">
                <h3 className="text-white text-xl font-semibold">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-4 md:px-10" data-aos="fade-up">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 max-w-7xl mx-auto">
          {/* Text Introduction */}
          <div className="lg:w-1/3 flex-shrink-0">
            <p className="text-blue-600 text-sm uppercase tracking-wide font-semibold mb-2">
              Patel Brings You
            </p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Our Exclusive Collection
            </h2>
            <p className="text-gray-600 text-base md:text-lg mb-6">
              Premium ceramics and slabs that transform any space with style and
              durability.
            </p>
            <Link to="/products">
              <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
                Explore All
              </button>
            </Link>
          </div>

          {/*Product Cards */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-6 lg:w-2/3">
            {/* Slabs Card */}
            <Link to="/slabs" className="flex-1 min-w-[240px]">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl mb-4">
                    🪨
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Slabs
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Premium slabs for floors and walls, crafted for modern
                    interiors.
                  </p>
                </div>
                <span className="text-blue-600 font-medium hover:underline">
                  Discover Slabs →
                </span>
              </div>
            </Link>

            {/* Ceramics Card */}
            <Link to="/ceramics" className="flex-1 min-w-[240px]">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-2xl mb-4">
                    🧱
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Ceramics
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Designer ceramic tiles ideal for kitchens, bathrooms, and
                    living spaces.
                  </p>
                </div>
                <span className="text-pink-600 font-medium hover:underline">
                  Browse Ceramics →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
  className="px-2 md:px-4 lg:px-6 py-12 bg-white text-center relative"
  data-aos="fade-up"
>
  <h2 className="text-3xl md:text-4xl font-bold mb-4">What Sets Us Apart</h2>
  <p className="text-gray-600 mb-10 text-sm md:text-base max-w-xl mx-auto">
    For over two decades, Patel Ceramics has stood for design, durability,
    and distinction in ceramic innovation.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
    {[
      { title: "25+ Years Experience", icon: "⏳" },
      { title: "1000+ Designs", icon: "🎨" },
      { title: "Certified Quality", icon: "✅" },
      { title: "Global Reach", icon: "🌎" },
    ].map((item, i) => (
      <div
        key={i}
        className="bg-gray-100 px-6 py-8 border-l-4 border-blue-500 shadow-sm rounded-lg hover:shadow-md transition text-left"
      >
        <div className="text-3xl mb-4">{item.icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
      </div>
    ))}
  </div>



        {/* Optional background shape */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/images/pattern-light.png')] bg-center bg-cover"></div>
      </section>

      {/* Product Showcase Section */}
      <section className="px-10 py-16 bg-gray-50" data-aos="fade-up">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded overflow-hidden shadow hover:shadow-lg transition"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <img
                src={`https://source.unsplash.com/400x400/?tiles,ceramic&sig=${i}`}
                alt={`Tile ${i + 1}`}
                className="w-full h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-gray-900 text-white px-10 py-12 mt-16"
        data-aos="fade-up"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Patel Ceramics</h3>
            <p>
              Crafting beauty in every tile. Serving excellence across India and
              globally.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>Wall Tiles</li>
              <li>Floor Tiles</li>
              <li>Sanitaryware</li>
              <li>Granite & Marble</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <span>🌐</span>
              <span>📘</span>
              <span>📸</span>
              <span>▶️</span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm mt-10">
          &copy; 2025 Patel Ceramics. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
