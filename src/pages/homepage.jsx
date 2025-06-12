import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaBars,
  FaShoppingCart,
  FaTimes,
} from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

import Header from "../components/Header";
import Footer from "../components/Footer";

import slide3Image from "../images/slide3.png";
import slideImage from "../images/slide.png";
import slide2Image from "../images/slide2.png";
import exteriorImg from "../images/exterior.png";
import interiorImage from "../images/interior.png";
import sanitaryImage from "../images/sanitary.png";
import slabImage from "../images/slab.png";
import ceramicImage from "../images/ceramic.png";
import featured1 from "../images/featuredproduct1.png";
import featured2 from "../images/featuredproduct2.png";
import featured3 from "../images/featuredproduct3.png";
import featured4 from "../images/featuredproduct4.png";
import featured5 from "../images/featuredproduct5.png";
import featured6 from "../images/featuredproduct6.png";
import featured7 from "../images/featuredproduct7.png";
import featured8 from "../images/featuredproduct8.png";
import { path } from "framer-motion/client";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="bg-white text-gray-900 font-sans">
      <Header />

      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
        className="rounded-b-xl"
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 group"
            >
              <div className="p-3 rounded-full group-hover:bg-black/50 transition duration-200">
                <FaChevronLeft className="text-white text-xl" />
              </div>
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 group"
            >
              <div className="p-3 rounded-full group-hover:bg-black/50 transition duration-200">
                <FaChevronRight className="text-white text-xl" />
              </div>
            </button>
          )
        }
      >
        {[slide3Image, slideImage, slide2Image].map((image, i) => (
          <div
            key={i}
            className="relative w-full h-[300px] sm:h-[400px] md:h-[600px] bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-10">
              <div className="w-full max-w-7xl mx-auto text-white text-center">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold drop-shadow-xl mb-4">
                  {i === 0
                    ? "Transform Your Interiors"
                    : i === 1
                    ? "Crafting Spaces with Elegance"
                    : "Elegance in Every Tile"}
                </h2>
                <p className="text-sm sm:text-lg mb-6 drop-shadow max-w-2xl mx-auto">
                  {i === 0
                    ? "High-gloss designer tiles for modern spaces."
                    : i === 1
                    ? "Experience premium ceramic solutions by Patel Ceramics."
                    : "Choose from a premium range of marble, floor & wall tiles."}
                </p>
                <button className="bg-white text-black px-6 sm:px-8 py-2 sm:py-4 rounded shadow hover:bg-gray-100 text-sm sm:text-lg font-semibold">
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

      {/* Shop by Category */}
      <section className="px-4 sm:px-10 py-16 bg-white" data-aos="fade-up">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: "Interior", image: interiorImage, path: "/interior" },
            { name: "Exterior", image: exteriorImg, path: "/exterior" },
            { name: "Sanitaryware", image: sanitaryImage, path: "/sanitary" },
          ].map((item, i) => (
            <Link to={item.path} key={i}>
              <div
                className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1 h-60 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute bottom-4 w-full text-center z-10">
                  <h3 className="text-white text-xl font-semibold">
                    {item.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Exclusive Collection */}
      <section className="bg-gray-50 py-16 px-4 sm:px-10" data-aos="fade-up">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 max-w-7xl mx-auto">
          <div className="lg:w-1/3 flex-shrink-0">
            <p className="text-blue-600 text-sm uppercase tracking-wide font-semibold mb-2">
              Patel Brings You
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Our Exclusive Collection
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Premium ceramics and slabs that transform any space with style and
              durability.
            </p>
            <Link to="/products">
              <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition text-sm sm:text-base">
                Explore All
              </button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-6 lg:w-2/3">
            {/* Slabs */}
            <Link to="/slabs" className="flex-1 min-w-[180px] sm:min-w-[240px]">
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
                  <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                    Discover Slabs →
                  </span>
                </div>
              </div>
            </Link>

            {/* Ceramics */}
            <Link to="/ceramics" className="flex-1 min-w-[180px] sm:min-w-[240px]">
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
                  <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                    Browse Ceramics →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* === Moved Featured Products Above === */}
      <section className="px-4 sm:px-10 py-16 bg-white" data-aos="fade-up">
        <h2 className="text-4xl sm:text-4xl font-bold mb-8 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            featured1,
            featured2,
            featured3,
            featured4,
            featured5,
            featured6,
            featured7,
            featured8,
          ].map((img, i) => (
            <div
              key={i}
              className="rounded overflow-hidden shadow hover:shadow-lg transition"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <img
                src={img}
                alt={`Featured Product ${i + 1}`}
                className="w-full h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* === What Sets Us Apart (now below) === */}
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

      <Footer />
    </div>
  );
}
