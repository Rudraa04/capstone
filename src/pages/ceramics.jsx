import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import axios from "axios";

import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import slabBanner from "../images/slabs-banner.png";

import bathtub1 from "../images/bathtub1.png";
import bathtub2 from "../images/bathtub2.png";
import bathtub3 from "../images/bathtub3.png";
import bathtub4 from "../images/bathtub4.png";
import bathtub5 from "../images/bathtub5.png";
import bathtub6 from "../images/bathtub6.png";
import bathtub7 from "../images/bathtub7.png";
import bathtub8 from "../images/bathtub8.png";

export default function Ceramics() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("tiles");
  const [tiles, setTiles] = useState([]);
  const [sinks, setSinks] = useState([]);
  const [toilets, setToilets] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    subcategory: [],
    size: [],
    color: [],
    finish: [],
    manufacturer: [],
    type: [],
    flush: [],
  });
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  // for filter for tiles
  const mapSize = (size) => {
    if (!size) return "";
    const formatted = size.toLowerCase().replace(/\s/g, "");
    if (formatted.includes("12x18")) return "12x18";
    if (formatted.includes("48x24")) return "48x24";
    if (formatted.includes("32x32")) return "32x32";
    return "";
  };

  const mapFinish = (desc) => {
    if (!desc) return "";
    const text = desc.toLowerCase();
    if (text.includes("endless")) return "Endless Glossy";
    if (text.includes("carving")) return "Carving";
    if (text.includes("glossy")) return "Glossy";
    if (text.includes("digital")) return "Digital";
    return "";
  };

  const mapColor = (color) => {
    if (!color) return "";
    const c = color.toLowerCase();
    if (c.includes("silver")) return "Silver";
    if (c.includes("grey")) return "Grey";
    if (c.includes("onyx")) return "Onyx";
    if (c.includes("white")) return "White";
    if (c.includes("golden")) return "Golden";
    if (c.includes("pink")) return "Pink";
    if (c.includes("multi")) return "Multi";
    return "";
  };
  const mapTileSubCategory = (subcategory) => {
    if (!subcategory) return "";
    const s = subcategory.toLowerCase();
    if (s.includes("interior")) return "Interior Floor Tiles";
    if (s.includes("exterior floor")) return "Exterior Floor Tiles";
    if (s.includes("exterior wall")) return "Exterior Wall Tiles";
    if (s.includes("bathroom")) return "Bathroom Wall Tiles";
    if (s.includes("kitchen")) return "Kitchen Wall Tiles";
    return "";
  };

  // mapping for sink
  const mapSinkType = (subcategory) => {
    if (!subcategory) return "";
    const value = subcategory.toLowerCase();
    if (value.includes("art")) return "Art Table Top";
    if (value.includes("wall")) return "Wall Hung";
    if (value.includes("table")) return "Table Top";
    return "";
  };

  const mapSinkColor = (color) => {
    if (!color) return "";
    const c = color.toLowerCase();
    if (c.includes("beige")) return "Matt Beige";
    if (c.includes("white")) return "White";
    return "";
  };

  const mapSinkManufacturer = (manufacturer) => {
    if (!manufacturer) return "";
    const m = manufacturer.toLowerCase();
    if (m.includes("soncera")) return "Soncera";
    return "";
  };
  //mapping toilets
  const mapToiletType = (subcategory) => {
    if (!subcategory) return "";
    const value = subcategory.toLowerCase();
    if (value.includes("one")) return "One Piece";
    if (value.includes("wall")) return "Wall Hung";
    return "";
  };

  const mapToiletFlush = (flushType) => {
    if (!flushType) return "";
    const value = flushType.toLowerCase();
    if (value.includes("jet")) return "With/Without Jet";
    if (value.includes("washdown")) return "Washdown Flushing";
    return "";
  };

  const mapToiletColor = (color) => {
    if (!color) return "";
    const c = color.toLowerCase();
    if (c.includes("white")) return "White";
    if (c.includes("black")) return "Matt Black";
    return "";
  };

  const mapToiletManufacturer = (manufacturer) => {
    if (!manufacturer) return "";
    const m = manufacturer.toLowerCase();
    if (m.includes("soncera")) return "Soncera";
    return "";
  };
  const bathtubImages = [
    bathtub1,
    bathtub2,
    bathtub3,
    bathtub4,
    bathtub5,
    bathtub6,
    bathtub7,
    bathtub8,
  ];

  const bathtubData = [
    {
      name: "Elegant White Tub",
      desc: "Classic white standalone bathtub with chrome fixtures.",
    },
    {
      name: "Blue Panel Tub",
      desc: "Vintage style blue bathtub with elegant feet.",
    },
    {
      name: "Maroon Glossy Tub",
      desc: "Luxurious maroon tub with golden tap for a bold look.",
    },
    {
      name: "Black Gloss Finish Tub",
      desc: "High-gloss black bathtub for contemporary interiors.",
    },
    {
      name: "Vintage White Tub",
      desc: "Retro white tub with decorative claw feet.",
    },
    {
      name: "Built-in White Tub",
      desc: "Minimalistic rectangular tub built into bathroom nook.",
    },
    {
      name: "Hydrotherapy Spa Tub",
      desc: "Modern tub with built-in water jets and chrome controls.",
    },
    {
      name: "Matte Black Freestanding Tub",
      desc: "Sleek matte black tub with modern black fixtures.",
    },
  ];

  const otherCategories = [
    {
      type: "tiles",
      label: "Tile Product",
      desc: "Premium ceramic tile for modern floors and walls.",
    },
    {
      type: "bathtub",
      label: "Bathtub",
      desc: "Elegant bathtub design. Smooth, stylish, and relaxing.",
    },
    {
      type: "toilets",
      label: "Toilet Fixture",
      desc: "Compact and efficient ceramic toilet for every home.",
    },
  ];

  const filterOptions = {
    tiles: {
      size: ["12x18", "48x24", "32x32"],
      finish: ["Glossy", "Endless Glossy", "Carving", "Digital"],
      color: ["Silver", "Grey", "Onyx", "White", "Golden", "Pink", "Multi"],
      subcategory: [
        "Interior Floor Tiles",
        "Exterior Floor Tiles",
        "Exterior Wall Tiles",
        "Bathroom Wall Tiles",
        "Kitchen Wall Tiles",
      ],
    },
    sinks: {
      type: ["Table Top", "Art Table Top", "Wall Hung"],
      color: ["Matt Beige", "White"],
      manufacturer: ["Soncera"],
    },

    bathtub: {
      material: ["Acrylic", "Ceramic", "Stone Resin"],
      size: ["5ft", "5.5ft", "6ft"],
      color: ["White", "Black", "Maroon"],
    },
    toilets: {
      type: ["One Piece", "Wall Hung"],
      flush: ["With/Without Jet", "Washdown Flushing"],
      color: ["White", "Matt Black"],
      manufacturer: ["Soncera"],
    },
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type") || "tiles";
    setActiveTab(type.toLowerCase());
  }, [location.search]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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

  useEffect(() => {
    if (activeTab === "tiles") {
      fetchTiles();
    }
  }, [activeTab]);

  const fetchTiles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products/tiles"
      );
      console.log("Fetched Tiles:", response.data);
      setTiles(response.data);
    } catch (error) {
      console.error("Failed to fetch tiles:", error);
    }
  };
  useEffect(() => {
    const fetchSinks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products/sinks"
        );
        setSinks(response.data);
      } catch (error) {
        console.error("Failed to fetch sinks:", error);
      }
    };

    if (activeTab === "sinks") {
      fetchSinks();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchToilets = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products/toilets"
        );
        setToilets(response.data);
      } catch (error) {
        console.error("Failed to fetch toilets:", error);
      }
    };

    if (activeTab === "toilets") {
      fetchToilets();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };
  //tiles filter
  const filteredTiles = tiles.filter((tile) => {
    const sizeValue = mapSize(tile.Size || "");
    const finishValue = mapFinish(tile.Description || "");
    const colorValue = mapColor(tile.Color || "");
    const subCategoryValue = mapTileSubCategory(tile.SubCategory || "");

    const sizeMatch =
      !filters.size ||
      filters.size.length === 0 ||
      filters.size.includes(sizeValue);
    const finishMatch =
      !filters.finish ||
      filters.finish.length === 0 ||
      filters.finish.includes(finishValue);
    const colorMatch =
      !filters.color ||
      filters.color.length === 0 ||
      filters.color.includes(colorValue);
    const subCategoryMatch =
      !filters.subcategory ||
      filters.subcategory.length === 0 ||
      filters.subcategory.includes(subCategoryValue);

    return sizeMatch && finishMatch && colorMatch && subCategoryMatch;
  });
  //sinks filter
  const filteredSinks = sinks.filter((sink) => {
    const typeValue = mapSinkType(sink["Sub Category"] || "");
    const colorValue = mapSinkColor(sink.Color || "");
    const manufacturerValue = mapSinkManufacturer(sink.Manufacturer || "");

    const typeMatch =
      !filters.type ||
      filters.type.length === 0 ||
      filters.type.includes(typeValue);
    const colorMatch =
      !filters.color ||
      filters.color.length === 0 ||
      filters.color.includes(colorValue);
    const manufacturerMatch =
      !filters.manufacturer ||
      filters.manufacturer.length === 0 ||
      filters.manufacturer.includes(manufacturerValue);

    return typeMatch && colorMatch && manufacturerMatch;
  });
  //toilets filter
  const filteredToilets = toilets.filter((toilet) => {
    const typeValue = mapToiletType(toilet["Sub Category"] || "");
    const flushValue = mapToiletFlush(toilet["Flush Type"] || "");
    const colorValue = mapToiletColor(toilet.Color || "");
    const manufacturerValue = mapToiletManufacturer(toilet.Manufacturer || "");

    const typeMatch =
      !filters.type ||
      filters.type.length === 0 ||
      filters.type.includes(typeValue);
    const flushMatch =
      !filters.flush ||
      filters.flush.length === 0 ||
      filters.flush.includes(flushValue);
    const colorMatch =
      !filters.color ||
      filters.color.length === 0 ||
      filters.color.includes(colorValue);
    const manufacturerMatch =
      !filters.manufacturer ||
      filters.manufacturer.length === 0 ||
      filters.manufacturer.includes(manufacturerValue);

    return typeMatch && flushMatch && colorMatch && manufacturerMatch;
  });

  return (
    <div className="bg-white text-gray-900">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
  onClick={() => navigate("/")}
  className="text-blue-700 hover:text-blue-900"
>
  <FaArrowLeft size={18} />
</button>

            <Link
              to="/"
              className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wide"
            >
              PATEL CERAMICS
            </Link>
          </div>

          <div className="hidden md:flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full max-w-md hover:border-gray-600 transition-colors duration-200">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base px-2 text-gray-700 font-medium"
            />
            <button
              onClick={() => console.log("Search query:", query)}
              className="text-blue-600 hover:text-blue-800 p-1"
            >
              <FaSearch size={18} />
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[16px] font-medium text-gray-700">
            <Link to="/" className={`uppercase ${underlineHover}`}>
              Home
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProductDropdown(!showProductDropdown)}
                className={`uppercase ${underlineHover}`}
              >
                Products
              </button>
              {showProductDropdown && (
                <div className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-4 gap-10 w-[1200px] max-w-screen-xl z-50 text-base font-sans transform translate-x-[100px]">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      CATEGORY
                    </h3>
                    {[
                      { name: "Marble", to: "/slabs?type=marble" },
                      { name: "Granite", to: "/slabs?type=granite" },
                      { name: "Tiles", to: "/ceramics?type=tiles" },
                      { name: "Sinks", to: "/ceramics?type=sinks" },
                      { name: "Bathtubs", to: "/ceramics?type=bathtub" },
                      { name: "Toilets", to: "/ceramics?type=toilets" },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="block text-gray-700 hover:text-blue-600 mb-3 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      WALL TILES
                    </h3>
                    {[
                      "Bathroom Wall Tiles",
                      "Kitchen Wall Tiles",
                      "Outdoor Wall Tiles",
                      "Living Room Wall Tiles",
                      "Bedroom Wall Tiles",
                      "Wall Tiles for Commercial Spaces",
                    ].map((item) => (
                      <span key={item} className="block text-gray-700 mb-3">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      FLOOR TILES
                    </h3>
                    {[
                      "Living Room Floor Tiles",
                      "Outdoor Floor Tiles",
                      "Bedroom Floor Tiles",
                      "Kitchen Floor Tiles",
                      "Bathroom Floor tiles",
                      "Floor Tiles for Commercial Spaces",
                    ].map((item) => (
                      <span key={item} className="block text-gray-700 mb-3">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg tracking-wide border-b border-gray-300 pb-2">
                      TILE FINDER
                    </h3>
                    <select className="w-full mb-4 p-3 border border-gray-300 rounded text-gray-700 hover:border-blue-500 transition-colors">
                      <option>Select Size</option>
                      <option>12x12</option>
                      <option>16x16</option>
                      <option>24x24</option>
                    </select>
                    <select className="w-full mb-4 p-3 border border-gray-300 rounded text-gray-700 hover:border-blue-500 transition-colors">
                      <option>Select Finish</option>
                      <option>Glossy</option>
                      <option>Matte</option>
                      <option>Textured</option>
                    </select>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                      Search
                    </button>
                  </div>
                </div>
              )}
            </div>
            {user ? (
              <>
                <Link
                  to="/cart"
                  className={`uppercase ${underlineHover} flex items-center gap-1`}
                >
                  <FaShoppingCart /> Cart
                </Link>
                <Link
                  to="/profile"
                  state={
                    localStorage.getItem("fromAdmin") === "true"
                      ? { fromAdmin: true }
                      : {}
                  }
                  className={`uppercase ${underlineHover} flex items-center gap-1`}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className={`uppercase text-red-500 hover:text-red-600 ${underlineHover}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={`uppercase ${underlineHover}`}>
                Login/Signup
              </Link>
            )}
          </nav>

          <button
            className="md:hidden text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-4">
            <div className="flex items-center border rounded-full px-4 py-2 bg-gray-100 shadow-sm my-4">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base px-2"
              />
              <button
                onClick={() => console.log("Search query:", query)}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <FaSearch size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-4 text-[16px] font-medium text-gray-700">
              <Link to="/" className="uppercase">
                Home
              </Link>
              <Link to="/slabs" className="uppercase">
                Slabs
              </Link>
              <Link to="/ceramics" className="uppercase">
                Ceramics
              </Link>
              {user ? (
                <>
                  <Link to="/cart" className="uppercase">
                    Cart
                  </Link>
                  <Link
                    to="/profile"
                    state={
                      localStorage.getItem("fromAdmin") === "true"
                        ? { fromAdmin: true }
                        : {}
                    }
                    className={`uppercase ${underlineHover} flex items-center gap-1`}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="uppercase text-left text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="uppercase">
                  Login/Signup
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${slabBanner})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Finest Ceramic Fixtures</h1>
          <p className="text-lg">
            Stylish Tiles, Sinks, and Sanitaryware for Elegant Interiors
          </p>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Explore Ceramic Products</h2>
          <p className="text-gray-600">
            Choose a category and filter your options
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* FILTER SIDEBAR */}
          <aside className="w-full lg:w-[220px] space-y-8">
            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Filter Products
              </h3>

              {Object.entries(filterOptions[activeTab] || {}).map(
                ([filterKey, values]) => (
                  <div key={filterKey} className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2 capitalize">
                      {filterKey}
                    </h4>
                    {values.map((option) => (
                      <label
                        key={option}
                        className="block text-sm text-gray-800 mb-1"
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters[filterKey]?.includes(option)}
                          onChange={() => toggleFilter(filterKey, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )
              )}
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-4 mb-8">
              {["tiles", "bathtub", "sinks", "toilets"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold border ${
                    activeTab === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activeTab === "sinks" &&
                filteredSinks.map((sink, i) => (
                  <div
                    key={sink._id || i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={sink.Image}
                        alt={sink.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {sink.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {sink.Description}
                      </p>
                      <Link
                        to={`/product/sinks/${sink._id}`}
                        state={{ fromTab: "sinks" }}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium inline-block text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}

              {activeTab === "tiles" &&
                filteredTiles.map((tile, i) => (
                  <div
                    key={tile._id || i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={tile.Image}
                        alt={tile.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {tile.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tile.Description}
                      </p>
                      <Link
                        to={`/product/tiles/${tile._id}`}
                        state={{ fromTab: "tiles" }}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium inline-block text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}

              {activeTab === "bathtub" &&
                bathtubImages.map((img, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={img}
                        alt={bathtubData[i].name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {bathtubData[i].name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {bathtubData[i].desc}
                      </p>
                      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

              {activeTab === "toilets" &&
                filteredToilets.map((toilet, i) => (
                  <div
                    key={toilet._id || i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={toilet.Image}
                        alt={toilet.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {toilet.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {toilet.Description}
                      </p>
                      <Link
                        to={`/product/toilets/${toilet._id}`}
                        state={{ fromTab: "toilets" }}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium inline-block text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white px-4 sm:px-10 py-12 mt-16 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Patel Ceramics</h3>
            <p className="text-gray-300">
              Crafting beauty in every tile. Serving excellence across India and
              globally.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Wall Tiles</li>
              <li>Floor Tiles</li>
              <li>Sanitaryware</li>
              <li>Granite & Marble</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>About Us</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>
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
          <div>
            <h4 className="font-semibold mb-4">What We </h4>
            <ul className="space-y-2 text-gray-300">
              <li>Tile Manufacturing</li>
              <li>Custom Design</li>
              <li>Bulk Orders</li>
              <li>Quality Assurance</li>
              <li>Nationwide Delivery</li>
            </ul>
          </div>
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
        <hr className="border-t border-gray-700 mb-6" />
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
