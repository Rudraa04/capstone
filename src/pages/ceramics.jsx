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

export default function Ceramics() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("type") || "tiles";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [tiles, setTiles] = useState([]);
  const [bathtubs, setBathtubs] = useState([]);
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
    priceRange: [],
  });
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [cartCount, setCartCount] = useState(0);

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
      color: ["White", "White + Dark Pink", "Light Blue"],
      priceRange: ["Below ₹15,000", "₹15,000–₹30,000", "Above ₹30,000"],
    },

    toilets: {
      color: ["White", "Matt Black"],
      manufacturer: ["Soncera"],
    },
  };

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(storedCart.length); // Just count distinct products
    };

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const endpoints = ["tiles", "sinks", "granite", "marble", "toilets"];
        const allFetched = await Promise.all(
          endpoints.map((type) =>
            fetch(`http://localhost:5000/api/products/${type}`).then((res) =>
              res.json()
            )
          )
        );
        const combined = endpoints.flatMap((type, index) =>
          allFetched[index].map((item) => ({
            ...item,
            category: type,
          }))
        );
        setAllProducts(combined);
      } catch (err) {
        console.error("Failed to fetch products for search:", err);
      }
    };

    fetchAllProducts();
  }, []);

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
    setActiveTab(queryParams.get("type") || "tiles");
  }, [location.search]);

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
    const fetchBathtubs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products/bathtubs"
        );
        setBathtubs(response.data);
      } catch (error) {
        console.error("Failed to fetch bathtubs:", error);
      }
    };

    if (activeTab === "bathtub") {
      fetchBathtubs();
    }
  }, [activeTab]);
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
    const typeValue = mapSinkType(sink["SubCategory"] || "");
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
    const colorValue = mapToiletColor(toilet.Color || "");
    const manufacturerValue = mapToiletManufacturer(toilet.Manufacturer || "");

    const colorMatch =
      !filters.color ||
      filters.color.length === 0 ||
      filters.color.includes(colorValue);
    const manufacturerMatch =
      !filters.manufacturer ||
      filters.manufacturer.length === 0 ||
      filters.manufacturer.includes(manufacturerValue);

    return colorMatch && manufacturerMatch;
  });
  const filteredBathtubs = bathtubs.filter((tub) => {
    const colorMatch =
      !filters?.color?.length || filters.color.includes(tub.Color);

    const price = parseFloat(tub.Price || 0);
    const priceRange = Array.isArray(filters?.priceRange)
      ? filters.priceRange
      : [];
    const priceMatch =
      priceRange.length === 0 ||
      (priceRange.includes("Below ₹15,000") && price < 15000) ||
      (priceRange.includes("₹15,000–₹30,000") &&
        price >= 15000 &&
        price <= 30000) ||
      (priceRange.includes("Above ₹30,000") && price > 30000);

    return colorMatch && priceMatch;
  });

  const handleSearch = (input) => {
    const rawQuery = input || query;
    const trimmedQuery = rawQuery
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/gi, "");
    const routeMap = [
      // Specific phrases FIRST
      {
        keywords: ["exterior wall tiles", "exterior wall"],
        route: "/exterior?sub=Exterior%20Wall%20Tiles",
      },
      {
        keywords: ["exterior floor tiles", "exterior floor"],
        route: "/exterior?sub=Exterior%20Floor%20Tiles",
      },
      {
        keywords: ["interior floor tiles", "interior floor"],
        route: "/interior?sub=Interior%20Floor%20Tiles",
      },
      {
        keywords: ["bathroom tiles", "bathroom wall", "bathroom wall tiles"],
        route: "/interior?sub=Bathroom%20Wall%20Tiles",
      },
      {
        keywords: ["kitchen wall tiles", "kitchen tiles", "kitchen"],
        route: "/interior?sub=Kitchen%20Wall%20Tiles",
      },

      // General categories
      { keywords: ["interior", "interior tiles"], route: "/interior" },
      { keywords: ["exterior", "exterior tiles"], route: "/exterior" },
      {
        keywords: ["sanitary", "sanitaryware", "toilet", "sink", "bathtub"],
        route: "/sanitary",
      },
      { keywords: ["slab", "slabs", "granite", "marble"], route: "/slabs" },
      { keywords: ["ceramic", "ceramics"], route: "/ceramics?type=tiles" },
      { keywords: ["tile", "tiles"], route: "/ceramics?type=tiles" },

      // Suggestions
      {
        keywords: ["bathroom", "washroom"],
        suggest: ["tiles", "bathtubs", "sinks", "toilets"],
      },
    ];

    for (const entry of routeMap) {
      if (entry.route && entry.keywords.some((k) => trimmedQuery.includes(k))) {
        navigate(entry.route);
        return;
      }

      if (
        entry.suggest &&
        entry.keywords.some((k) => trimmedQuery.includes(k))
      ) {
        alert(`You might be looking for: ${entry.suggest.join(", ")}`);
        return;
      }
    }

    alert("No matching category found.");
    setSuggestions([]);
  };

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

          <div className="hidden md:block relative w-full max-w-md">
            <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);

                  if (value.length > 1) {
                    const filtered = allProducts.filter((product) =>
                      product.Name?.toLowerCase().includes(value.toLowerCase())
                    );
                    setSuggestions(filtered);
                  } else {
                    setSuggestions([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1 bg-transparent outline-none text-base text-gray-700 font-medium"
              />

              <button
                onClick={() => handleSearch()}
                className="ml-2 text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                <FaSearch size={18} />
              </button>
            </div>

            {/* 🔍 Search Suggestions with Image */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 top-full mt-2 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg z-50">
                {suggestions.map((product, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate(
                        `/product/${product.category.toLowerCase()}/${
                          product._id
                        }`
                      );
                      setSuggestions([]);
                      setQuery("");
                    }}
                  >
                    <img
                      src={product.Image || "https://via.placeholder.com/40x40"}
                      alt={product.Name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                    <div>
                      <p className="text-sm font-semibold">{product.Name}</p>
                      <p className="text-xs text-gray-500">
                        {product.category}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
                <div className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-2 gap-8 w-[600px] z-50 text-base font-sans translate-x-[100px]">
                  {" "}
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
                      WALL / FLOOR TILES
                    </h3>
                    {[
                      {
                        name: "Exterior Floor Tiles",
                        to: "/exterior?sub=Exterior Floor Tiles",
                      },
                      {
                        name: "Exterior Wall Tiles",
                        to: "/exterior?sub=Exterior Wall Tiles",
                      },
                      {
                        name: "Kitchen Wall Tiles",
                        to: "/interior?sub=Kitchen Wall Tiles",
                      },
                      {
                        name: "Bathroom Wall Tiles",
                        to: "/interior?sub=Bathroom Wall Tiles",
                      },
                      {
                        name: "Interior Floor Tiles",
                        to: "/interior?sub=Interior Floor Tiles",
                      },
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
                </div>
              )}
            </div>
            {user ? (
              <>
                <Link
                  to="/cart"
                  className={`uppercase ${underlineHover} flex items-center gap-1`}
                >
                  <FaShoppingCart />
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-1 font-bold text-blue-600">
                      ({cartCount})
                    </span>
                  )}
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
            <div className="block md:hidden relative w-full max-w-md mb-4">
              <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 shadow-sm w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuery(value);

                    if (value.length > 1) {
                      const filtered = allProducts.filter((product) =>
                        product.Name?.toLowerCase().includes(
                          value.toLowerCase()
                        )
                      );
                      setSuggestions(filtered);
                    } else {
                      setSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="flex-1 bg-transparent outline-none text-base text-gray-700 font-medium"
                />

                <button
                  onClick={() => handleSearch()}
                  className="ml-2 text-blue-600 hover:text-blue-800 flex items-center justify-center"
                >
                  <FaSearch size={18} />
                </button>
              </div>

              {/* 🔍 Search Suggestions with Image */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-2 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg z-50">
                  {suggestions.map((product, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate(
                          `/product/${product.category.toLowerCase()}/${
                            product._id
                          }`
                        );
                        setSuggestions([]);
                        setQuery("");
                      }}
                    >
                      <img
                        src={
                          product.Image || "https://via.placeholder.com/40x40"
                        }
                        alt={product.Name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                      <div>
                        <p className="text-sm font-semibold">{product.Name}</p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
                filteredBathtubs.map((tub, i) => (
                  <div
                    key={tub._id || i}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={tub.Image}
                        alt={tub.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {tub.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tub.Description}
                      </p>
                      <Link
                        to={`/product/bathtubs/${tub._id}`}
                        state={{ fromTab: "bathtub" }}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium inline-block text-center"
                      >
                        View Details
                      </Link>
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
            <li>
              <a href="/interior">Interior</a>
            </li>
            <li>
              <a href="/exterior">Exterior</a>
            </li>
            <li>
              <a href="/sanitary">Sanitaryware</a>
            </li>
            <li>
              <a href="/slabs">Granite & Marble</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/projects">Projects</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Who We Serve */}
        <div>
          <h4 className="font-semibold mb-4">Who We Serve</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/serve/homeowners">Homeowners</a>
            </li>
            <li>
              <a href="/serve/architects">Architects</a>
            </li>
            <li>
              <a href="/serve/designers">Interior Designers</a>
            </li>
            <li>
              <a href="/serve/builders">Builders & Contractors</a>
            </li>
            <li>
              <a href="/serve/commercial">Commercial Spaces</a>
            </li>
          </ul>
        </div>

        {/* Column 5: What We Do */}
        <div>
          <h4 className="font-semibold mb-4">What We Do</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/services/custom-design">Custom Design</a>
            </li>
            <li>
              <a href="/services/bulk-orders">Bulk Orders</a>
            </li>
            <li>
              <a href="/services/quality">Quality Assurance</a>
            </li>
            <li>
              <a href="/services/delivery">Nationwide Delivery</a>
            </li>
          </ul>
        </div>

        {/* Column 6: Follow Us */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-white text-lg">
            <a
              href="https://www.patelceramics.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              🌐
            </a>
            <a
              href="https://facebook.com/patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              📘
            </a>
            <a
              href="https://instagram.com/patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              📸
            </a>
            <a
              href="https://youtube.com/@patelceramics"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-700 mb-6" />

      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 gap-4 text-sm">
        <p>© {new Date().getFullYear()} Patel Ceramics. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms of Use
          </a>
          <a href="/sitemap" className="hover:text-white">
            Sitemap
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
}
