import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import "../carousel.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import slide3Image from "../images/slide3.png";
import slideImage from "../images/slide.png";
import slide2Image from "../images/slide2.png";
import exteriorImg from "../images/exterior.png";
import interiorImage from "../images/interior.png";
import sanitaryImage from "../images/sanitary.png";
import slabImage from "../images/slab.png";
import ceramicImage from "../images/ceramic.png";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const dropdownRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProductDropdown(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  return (
    <div className="bg-white text-gray-900 font-sans" data-aos="fade-up">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
        <div className="w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-black">
            PATEL CERAMICS
          </Link>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm space-x-2 w-[500px] max-w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-lg px-2"
              />
              <button
                onClick={() => console.log("Search query:", query)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav
            ref={dropdownRef}
            className="flex items-center space-x-10 text-lg font-semibold tracking-wide text-black"
          >
            <Link to="/" className="hover:text-blue-600 uppercase">
              Home
            </Link>

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProductDropdown((prev) => !prev)}
                className="hover:text-blue-600 uppercase"
              >
                Products ▾
              </button>
              {showProductDropdown && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <div
                    onClick={() =>
                      setActiveSubmenu((prev) =>
                        prev === "slabs" ? null : "slabs"
                      )
                    }
                    className="px-4 py-2 text-base hover:bg-gray-100 cursor-pointer"
                  >
                    Slabs ◂
                  </div>
                  {activeSubmenu === "slabs" && (
                    <div className="absolute top-0 right-full mt-0 mr-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 text-base">
                      <Link to="/slabs?type=marble" className="block px-4 py-2 hover:bg-gray-100">Marble</Link>
                      <Link to="/slabs?type=granite" className="block px-4 py-2 hover:bg-gray-100">Granite</Link>
                    </div>
                  )}

                  <div
                    onClick={() =>
                      setActiveSubmenu((prev) =>
                        prev === "ceramics" ? null : "ceramics"
                      )
                    }
                    className="px-4 py-2 text-base hover:bg-gray-100 cursor-pointer"
                  >
                    Ceramics ◂
                  </div>
                  {activeSubmenu === "ceramics" && (
                    <div className="absolute top-12 right-full mt-0 mr-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 text-base">
                      <Link to="/ceramics?type=tiles" className="block px-4 py-2 hover:bg-gray-100">Tiles</Link>
                      <Link to="/ceramics?type=sinks" className="block px-4 py-2 hover:bg-gray-100">Sinks</Link>
                      <Link to="/ceramics?type=bathtubs" className="block px-4 py-2 hover:bg-gray-100">Bathtubs</Link>
                      <Link to="/ceramics?type=toilets" className="block px-4 py-2 hover:bg-gray-100">Toilets</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conditionally Rendered Auth Links */}
            {!user ? (
              <>
                <Link to="/login" className="hover:text-blue-600 uppercase">
                  Login/SignUp
                </Link>

              </>
            ) : (
              <>
                <Link to="/cart" className="hover:text-blue-600 uppercase flex items-center gap-1">
                  <FaShoppingCart /> Cart
                </Link>
                <Link to="/profile" className="hover:text-blue-600 uppercase">
                  Profile
                </Link>
                <button onClick={handleLogout} className="hover:text-blue-600 uppercase">
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>


      {/* Hero Slider */}
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
        className="rounded-b- xl"
      >
        {[slide3Image, slideImage, slide2Image].map((image, i) => (
          <div
            key={i}
            className="relative w-full h-[600px] bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

            {/* Text container aligned like header */}
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-10">
              <div className="w-full max-w-7xl mx-auto text-white text-center">
                <h2 className="text-5xl md:text-6xl font-extrabold drop-shadow-xl mb-4">
                  {i === 0
                    ? "Transform Your Interiors"
                    : i === 1
                    ? "Crafting Spaces with Elegance"
                    : "Elegance in Every Tile"}
                </h2>
                <p className="text-lg md:text-xl mb-6 drop-shadow max-w-2xl mx-auto">
                  {i === 0
                    ? "High-gloss designer tiles for modern spaces."
                    : i === 1
                    ? "Experience premium ceramic solutions by Patel Ceramics."
                    : "Choose from a premium range of marble, floor & wall tiles."}
                </p>
                <button className="bg-white text-black px-8 py-4 rounded shadow hover:bg-gray-100 text-base md:text-lg font-semibold">
                  {i === 0
                    ? "Shop Now"
                    : i === 1
                    ? "Explore Collection"
                    : "Browse Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Category Highlights */}
      <section className="px-10 py-10" data-aos="fade-up">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Interior", bg: interiorImage },
            { name: "Exterior", bg: exteriorImg },
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

      {/* Exclusive Collection */}
      <section className="bg-gray-50 py-20 px-4 md:px-10" data-aos="fade-up">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 max-w-7xl mx-auto">
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

          <div className="flex flex-col sm:flex-row flex-wrap gap-6 lg:w-2/3">
            {/* Slabs Card */}
            <Link to="/slabs" className="flex-1 min-w-[240px]">
              <div className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition h-full overflow-hidden flex flex-col rounded-lg">
                <div className="h-40 overflow-hidden">
                  <img
                    src={slabImage}
                    alt="Slabs"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
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
              </div>
            </Link>

            {/* Ceramics Card */}
            <Link to="/ceramics" className="flex-1 min-w-[240px]">
              <div className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition h-full overflow-hidden flex flex-col rounded-lg">
                <div className="h-40 overflow-hidden">
                  <img
                    src={ceramicImage}
                    alt="Ceramics"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Ceramics
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Designer ceramic tiles ideal for kitchens, bathrooms, and
                      living spaces.
                    </p>
                  </div>
                  <span className="text-blue-600 font-medium hover:underline">
                    Browse Ceramics →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="px-2 md:px-4 lg:px-6 py-12 bg-white text-center relative"
        data-aos="fade-up"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          What Sets Us Apart
        </h2>
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
              <h3 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/images/pattern-light.png')] bg-center bg-cover"></div>
      </section>

      {/* Featured Products */}
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
      <footer className="bg-gray-900 text-white px-10 py-12 mt-16 text-sm">
        {/* Top Section - 6 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {/* Column 1: Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Patel Ceramics</h3>
            <p className="text-gray-300">
              Crafting beauty in every tile. Serving excellence across India and
              globally.
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Wall Tiles</li>
              <li>Floor Tiles</li>
              <li>Sanitaryware</li>
              <li>Granite & Marble</li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>About Us</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>

          {/* Column 4: Who We Serve */}
          <div>
            <h4 className="font-semibold mb-4">Who We Serve</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Homeowners</li>
              <li>Architects</li>
              <li>Interior Designers</li>
              <li>Builders & Contractors</li>
              <li>Commercial Spaces</li>
            </ul>
          </div>

          {/* ✅ Column 5: What We Do */}
          <div>
            <h4 className="font-semibold mb-4">What We Do</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Tile Manufacturing</li>
              <li>Custom Design</li>
              <li>Bulk Orders</li>
              <li>Quality Assurance</li>
              <li>Nationwide Delivery</li>
            </ul>
          </div>

          {/* Column 6: Follow Us */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4 text-white text-lg">
              <span role="img" aria-label="web">
                🌐
              </span>
              <span role="img" aria-label="facebook">
                📘
              </span>
              <span role="img" aria-label="instagram">
                📸
              </span>
              <span role="img" aria-label="youtube">
                ▶
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t border-gray-700 mb-6" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 gap-4 text-sm">
          <p>© 2025 Patel Ceramics. All rights reserved.</p>

          <div className="flex gap-4">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Use
            </a>
            <a href="#" className="hover:text-white">
              Sitemap
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
