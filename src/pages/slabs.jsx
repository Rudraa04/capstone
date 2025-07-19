import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import slabBanner from "../images/slabs-banner.png";

export default function Slabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("type") || "marble";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [graniteProducts, setGraniteProducts] = useState([]);
  const [marbleProducts, setMarbleProducts] = useState([]);
  const [filters, setFilters] = useState({ // filter is an object with different values given below
    category: [],
    size: [],
    color: [],
    origin: [],
  });
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [cartCount, setCartCount] = useState(0);
// Filter options for marble and granite
  const filterOptions = {
    marble: {
      size: ["75 x 38", "72 x 36", "80 x 38", "75 x 36"],
      color: ["Milky White", "Green", "Gold", "Light Pink", "Beige"],
      origin: ["West India", "South India", "North India"],
    },
    granite: {
      size: [
        "102x38",
        "104x38",
        "104x40",
        "108x40",
        "108x42",
        "110x40",
        "110x42",
        "110x43",
        "110x44",
      ],
      color: ["Black", "Red", "Grey", "White"],
      origin: ["South India", "North India", "West India"],
    },
  };
  //mapping for granite we have done mapping beacause our data in the database is not consistent and we have to map it to a standard format
  // so that we can filter it easily
  const mapGraniteColor = (color) => { //This function takes in a color string and returns a standardized color label like "Black" or "Red".
    if (!color) return ""; // If no color is provided, return an empty string
    const c = color.toLowerCase(); //Converts the input color to lowercase for case-insensitive matching.
    if (c.includes("black")) return "Black"; // If the color includes "black", return "Black"
    if (c.includes("red")) return "Red"; // If the color includes "red", return "Red"
    if (c.includes("grey") || c.includes("gray")) return "Grey"; // If the color includes "grey" or "gray", return "Grey"
    if (c.includes("white")) return "White"; // If the color includes "white", return "White"
    return ""; // if no match is found, return an empty string
  }; 

  const mapGraniteOrigin = (origin) => { // This function takes in an origin string and returns a standardized origin label like "South India" or "North India".
    if (!origin) return ""; // If no origin is provided, return an empty string
    const o = origin.toLowerCase(); // Converts the input origin to lowercase for case-insensitive matching.
    if (o.includes("south")) return "South India"; // If the origin includes "south", return "South India"
    if (o.includes("north")) return "North India"; // If the origin includes "north", return "North India"
    if (o.includes("west")) return "West India"; // If the origin includes "west", return "West India"
    return ""; // if no match is found, return an empty string
  };
  const mapGraniteSize = (size) => { // This function takes in a size string and returns a standardized size label like "104x38" or "108x40".
    if (!size) return ""; // If no size is provided, return an empty string
    const s = size.toLowerCase().replace(/\s/g, ""); // Converts the input size to lowercase and removes any spaces for consistent matching.
    if (s.includes("104x38")) return "104x38"; // If the size includes "104x38", return "104x38"
    if (s.includes("108x40")) return "108x40"; //same
    if (s.includes("108x42")) return "108x42";// same
    if (s.includes("110x42")) return "110x42"; //same
    if (s.includes("110x44")) return "110x44"; //same
    return ""; // if no match is found, return an empty string
  };

  //mapping for marble
  const mapMarbleSize = (size) => {
    if (!size) return ""; // If no size is provided, return an empty string
    const s = size.toLowerCase().replace(/\s/g, ""); // Converts the input size to lowercase and removes any spaces for consistent matching.
    if (s.includes("75x38")) return "75 x 38"; // If the size includes "75x38", return "75 x 38"
    if (s.includes("72x36")) return "72 x 36"; // If the size includes "72x36", return "72 x 36"
    if (s.includes("80x38")) return "80 x 38"; // If the size includes "80x38", return "80 x 38"
    if (s.includes("75x36")) return "75 x 36"; // If the size includes "75x36", return "75 x 36"
    return ""; // if no match is found, return an empty string
  };

  const mapMarbleColor = (color) => {
    if (!color) return ""; // If no color is provided, return an empty string
    const c = color.toLowerCase();// Converts the input color to lowercase for case-insensitive matching.
    if (c.includes("milky")) return "Milky White"; // If the color includes "milky", return "Milky White"
    if (c.includes("green")) return "Green";// If the color includes "green", return "Green"
    if (c.includes("gold")) return "Gold"; // If the color includes "gold", return "Gold"
    if (c.includes("pink")) return "Light Pink"; // If the color includes "pink", return "Light Pink"
    if (c.includes("beige")) return "Beige"; // If the color includes "beige", return "Beige"
    return ""; // if no match is found, return an empty string  
  };

  const mapMarbleOrigin = (origin) => {
    if (!origin) return ""; // If no origin is provided, return an empty string
    const o = origin.toLowerCase(); // Converts the input origin to lowercase for case-insensitive matching.
    if (o.includes("west")) return "West India"; // If the origin includes "west", return "West India"
    if (o.includes("south")) return "South India"; // If the origin includes "south", return "South India"
    if (o.includes("north")) return "North India"; // If the origin includes "north", return "North India"
    return ""; // if no match is found, return an empty string
  };

  useEffect(() => {
    const updateCartCount = () => { // This function updates the cart count based on localStorage
      const storedCart = JSON.parse(localStorage.getItem("cart")) || []; // Get the cart from localStorage and parses it from json to array 
      setCartCount(storedCart.length); // Updates the cartCount state by counting the number of products in the cart array
    };

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount); // This adds an event listener that listens for the "cartUpdated" event and calls updateCartCount when the event is triggered
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount); // This cleans up the event listener when the component unmounts
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
    const fetchMarbleProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/marble"
        );
        const data = await response.json();
        setMarbleProducts(data);
      } catch (error) {
        console.error("Error fetching marble products:", error);
      }
    };
    fetchMarbleProducts();
  }, []);

  useEffect(() => {
    const fetchGraniteProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/granite"
        );
        const data = await response.json();
        setGraniteProducts(data);
      } catch (error) {
        console.error("Error fetching granite products:", error);
      }
    };
    fetchGraniteProducts();
  }, []);

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
  //filter granite products based on selected filters
  const filteredGranite = graniteProducts.filter((product) => { //Loop through all graniteProducts, and for each product, apply filter conditions to decide if it should be shown.
    const sizeValue = mapGraniteSize(product.Size || ""); //  gets cleaned size using mapGranitesize(mapping) if Size is missing, it uses an empty string ("") to avoid errors.
    const colorValue = mapGraniteColor(product.Color || "");// same as size
    const originValue = mapGraniteOrigin(product.Origin || ""); // same as size

    const sizeMatch =
      !filters.size || //No size filter selected 
      filters.size.length === 0 || //filter size is empty
      filters.size.includes(sizeValue); //the product’s size (sizeValue) is in the selected sizes
    const colorMatch =
      !filters.color || //No color filter selected
      filters.color.length === 0 || //filter color is empty
      filters.color.includes(colorValue); //the product’s color (colorValue) is in the selected colors
    const originMatch =
      !filters.origin ||//No origin filter selected
      filters.origin.length === 0 || //filter origin is empty
      filters.origin.includes(originValue); //the product’s origin (originValue) is in the selected origins

    return sizeMatch && colorMatch && originMatch; //Returns true if the product matches all selected filters. it is responsible for showing one product if it matches two filters at a time
  });
  //filter marble products based on selected filters
  const filteredMarble = marbleProducts.filter((product) => { //Loop through all marbleProducts, and for each product, apply filter conditions to decide if it should be shown.
    const sizeValue = mapMarbleSize(product.Size || ""); // gets cleaned size using mapMarbleSize(mapping) if Size is missing, it uses an empty string ("") to avoid errors.
    const colorValue = mapMarbleColor(product.Color || ""); // same as size
    const originValue = mapMarbleOrigin(product.Origin || ""); // same as size

    const sizeMatch =
      !filters.size || //No size filter selected
      filters.size.length === 0 || //filter size is empty
      filters.size.includes(sizeValue);// the product’s size (sizeValue) is in the selected sizes
    const colorMatch =
      !filters.color || //No color filter selected
      filters.color.length === 0 || //filter color is empty
      filters.color.includes(colorValue);// the product’s color (colorValue) is in the selected colors
    const originMatch =
      !filters.origin || //No origin filter selected
      filters.origin.length === 0 || //filter origin is empty
      filters.origin.includes(originValue);// the product’s origin (originValue) is in the selected origins

    return sizeMatch && colorMatch && originMatch; // Returns true if the product matches all selected filters. it is responsible for showing one product if it matches two filters at a time
  });

  return (
    <div className="bg-white text-gray-900">
      {/* === HEADER === */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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

      {/* Hero Section */}
      <section
        className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center shadow-inner"
        style={{ backgroundImage: `url(${slabBanner})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
            Premium Slabs Collection
          </h1>
          <p className="text-lg md:text-xl mt-4 font-light">
            Elegant Marbles & Durable Granites for Every Space
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Explore by Type</h2>
          <p className="text-gray-600 text-lg mt-2">
            Select a slab type and filter by attributes
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter Panel */}
          <aside className="w-full lg:w-[260px] space-y-8">
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Filters</h3>

              <div className="space-y-4">
                {/* Size Filter */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Size</h4>
                  {(filterOptions[activeTab]?.size || []).map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.size.includes(item)}
                        onChange={() => toggleFilter("size", item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">Color</h4>
                  {(filterOptions[activeTab]?.color || []).map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.color.includes(item)}
                        onChange={() => toggleFilter("color", item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>
                <div>
                  <h4 className="text-gray-800 font-semibold mb-2">
                    Place of Origin
                  </h4>
                  {(filterOptions[activeTab]?.origin || []).map((item) => (
                    <label key={item} className="block text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.origin.includes(item)}
                        onChange={() => toggleFilter("origin", item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex gap-4 flex-wrap mb-8 justify-center md:justify-start">
              {["marble", "granite"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    activeTab === type
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Slabs
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activeTab === "granite" &&
                filteredGranite.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={product.Image}
                        alt={product.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {product.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.Description}
                      </p>
                      <Link
                        to={`/product/granite/${product._id}`}
                        state={{ fromTab: "granite" }}
                      >
                        <button
                          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                          onClick={() =>
                            navigate(
                              `/product/${product.category}/${product._id}`,
                              {
                                state: { fromTab: activeTab },
                              }
                            )
                          }
                        >
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}

              {activeTab === "marble" &&
                filteredMarble.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={product.Image}
                        alt={product.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {product.Name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.Description}
                      </p>
                      <Link
                        to={`/product/marble/${product._id}`}
                        state={{ fromTab: "marble" }}
                      >
                        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
