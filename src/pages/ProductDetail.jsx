import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  FaArrowLeft,
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaEye,
  FaMicrophone
} from "react-icons/fa";
import Footer from "../components/Footer";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "animate.css"; // For animation effects
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export default function ProductDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const index = type === "tiles" ? null : parseInt(id);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const productURL = window.location.href;
  const [showCalculator, setShowCalculator] = useState(false);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [cartCount, setCartCount] = useState(0);

  const [customSize, setCustomSize] = useState("12x12");
  const [quantity, setQuantity] = useState(1);
  const [pricePerTile, setPricePerTile] = useState(0);

  const [tileData, setTileData] = useState(null);
  const [sinkData, setSinkData] = useState(null);
  const [toiletData, setToiletData] = useState(null);

  const [marbleData, setMarbleData] = useState(null);

  const [graniteData, setGraniteData] = useState(null);

  const [bathtubData, setBathtubData] = useState(null);

  const location = useLocation();
  const fromTab = location.state?.fromTab;
  const recognizerRef = useRef(null);
  const [voiceStatus, setVoiceStatus] = useState("");


  const [stockError, setStockError] = useState("");

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
    if (type === "bathtubs") {
      axios
        .get(`http://localhost:5000/api/products/bathtubs/${id}`)
        .then((res) => {
          setBathtubData(res.data);
          setPricePerTile(res.data.Price || 0);
        })
        .catch((err) => console.error("Failed to fetch bathtub:", err));
    }
  }, [type, id]);

  useEffect(() => {
    if (type === "granite") {
      axios
        .get(`http://localhost:5000/api/products/granite/${id}`)
        .then((res) => {
          setGraniteData(res.data);
          setPricePerTile(res.data.Price || 0);
        })
        .catch((err) => console.error("Failed to fetch marble:", err));
    }
  }, [type, id]);

  useEffect(() => {
    if (type === "marble") {
      axios
        .get(`http://localhost:5000/api/products/marble/${id}`)
        .then((res) => {
          setMarbleData(res.data);
          setPricePerTile(res.data.Price || 0);
        })
        .catch((err) => console.error("Failed to fetch marble:", err));
    }
  }, [type, id]);

  useEffect(() => {
    if (type === "tiles") {
      axios
        .get(`http://localhost:5000/api/products/tiles/${id}`)
        .then((res) => {
          setTileData(res.data);
          setPricePerTile(res.data.Price || 0);
        })
        .catch((err) => console.error("Failed to fetch tile:", err));
    }
  }, [type, id]);

  useEffect(() => {
    if (type === "sinks") {
      axios
        .get(`http://localhost:5000/api/products/sinks/${id}`)
        .then((res) => {
          setSinkData(res.data);
          setPricePerTile(res.data.Price || 0);
        })
        .catch((err) => console.error("Failed to fetch sink:", err));
    }
  }, [type, id]);

  useEffect(() => {
    if (type === "toilets") {
      axios
        .get(`http://localhost:5000/api/products/toilets/${id}`)
        .then((res) => {
          setToiletData(res.data);
          setPricePerTile(res.data.Price || 0);
        })
        .catch((err) => console.error("Failed to fetch toilet:", err));
    }
  }, [type, id]);

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
    if (tileData && tileData.Price) {
      setPricePerTile(tileData.Price);
    }
  }, [tileData]);
  useEffect(() => {
  try {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_SPEECH_KEY,
      import.meta.env.VITE_AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizerRef.current = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  } catch (error) {
    console.error('Failed to initialize Speech SDK:', error);
    setVoiceStatus('Failed to initialize speech recognition. Please check your credentials.');
  }

  return () => {
    if (recognizerRef.current) {
      recognizerRef.current.close();
    }
  };
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
  const handleVoiceInput = () => {
  if (!recognizerRef.current) {
    setVoiceStatus('Speech recognizer not initialized. Please check your credentials.');
    return;
  }

  setVoiceStatus('Listening... Speak now.');
  recognizerRef.current.startContinuousRecognitionAsync();

  recognizerRef.current.recognized = (s, e) => {
    if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      let transcribedText = e.result.text;
      transcribedText = transcribedText
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/gi, ""); // remove punctuation

      setQuery(transcribedText);
      setVoiceStatus(`Transcription: ${transcribedText}`);
      handleSearch(transcribedText);
    }
  };

  recognizerRef.current.canceled = (s, e) => {
    setVoiceStatus(`Error: ${e.errorDetails}`);
    recognizerRef.current.stopContinuousRecognitionAsync();
  };

  recognizerRef.current.sessionStopped = (s, e) => {
    setVoiceStatus('Voice input stopped.');
    recognizerRef.current.stopContinuousRecognitionAsync();
  };
};


  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  let product;

  if (type === "tiles" && tileData) {
    product = {
      name: tileData.Name,
      image: tileData.Image,
      description: tileData.Description,
      size: tileData.Size,
      price: tileData.Price || 0,
      manufacturer: tileData.Manufacturer || "N/A",
      subcategory: tileData.SubCategory || "N/A",
      stock: tileData.Stock || "N/A",
      color: tileData.Color || "N/A",
      stock: tileData.Stock_admin ?? "N/A",
    };
  } else if (type === "sinks" && sinkData) {
    product = {
      name: sinkData.Name,
      image: sinkData.Image,
      size: sinkData.Size || "N/A",
      price: sinkData.Price || 0,
      color: sinkData.Color || "N/A",
      manufacturer: sinkData.Manufacturer || "N/A",
      stock: sinkData.Stock_admin ?? "N/A",
      subcategory: sinkData.SubCategory || "N/A",
    };
  } else if (type === "bathtubs" && bathtubData) {
    product = {
      name: bathtubData.Name,
      image: bathtubData.Image,
      description: bathtubData.Description,
      size: bathtubData.Size || "N/A",
      price: bathtubData.Price || 0,
      color: bathtubData.Color || "N/A",
      manufacturer: bathtubData.Manufacturer || "N/A",
      origin: bathtubData.Origin || "N/A",
      stock: bathtubData.Stock_admin ?? "N/A",
    };
  } else if (type === "toilets" && toiletData) {
    product = {
      name: toiletData.Name,
      image: toiletData.Image,
      description: toiletData.Description,
      size: toiletData.Size,
      price: toiletData.Price || 0,
      type: toiletData["Sub Category"] || "",
      color: toiletData.Color || "",
      manufacturer: toiletData.Manufacturer || "",
      flush: toiletData["Flush Type"] || "",
      origin: toiletData.Origin || "",
      stock: toiletData.Stock_admin ?? "N/A",
    };
  } else if (type === "marble" && marbleData) {
    product = {
      name: marbleData.Name,
      image: marbleData.Image,
      description: marbleData.Description,
      size: marbleData.Size,
      price: marbleData.Price || 0,
      color: marbleData.Color || "N/A",
      origin: marbleData.Origin || "N/A",
      stock: marbleData.Stock_admin ?? "N/A",
    };
  } else if (type === "granite" && graniteData) {
    product = {
      name: graniteData.Name,
      image: graniteData.Image,
      description: graniteData.Description,
      size: graniteData.Size || "N/A",
      price: graniteData.Price || 0,
      color: graniteData.Color || "N/A",
      manufacturer: graniteData.Manufacturer || "N/A",
      origin: graniteData.Origin || "N/A",
      stock: graniteData.Stock_admin ?? "N/A",
    };
  } else {
    product = null;
  }

  if (!product) {
    return <div className="text-center p-10">Loading Product...</div>;
  }

  const parseSize = (sizeStr) => {
    const [length, width] = sizeStr.split("x").map(Number);
    if (!length || !width) return 1;
    const customArea = length * width;
    const standardArea = 12 * 12;
    return Math.ceil((customArea * quantity) / standardArea);
  };

  const totalTiles = parseSize(customSize);
  const totalPrice = totalTiles * (product.price || pricePerTile || 0);

  const handleBack = () => {
    switch (type) {
      case "marble":
        navigate("/slabs?type=marble");
        break;
      case "granite":
        navigate("/slabs?type=granite");
        break;
      case "tiles":
        navigate("/ceramics?type=tiles");
        break;
      case "sinks":
        navigate("/ceramics?type=sinks");
        break;
      case "toilets":
        navigate("/ceramics?type=toilets");
        break;
      case "bathtub":
      case "bathtubs":
        navigate("/ceramics?type=bathtub");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("You must be logged in to add items to your cart.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        className:
          "bg-white border border-red-400 text-red-800 text-lg font-semibold px-6 py-4 rounded-lg shadow-lg animate__animated animate__fadeInRight",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    const cartItem = {
      id: Date.now(),
      ...product,
      size: customSize,
      quantity,
      totalTiles,
      totalPrice,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = existingCart.findIndex(
      (item) => item.name === cartItem.name && item.size === cartItem.size
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += cartItem.quantity;
      existingCart[existingItemIndex].totalTiles += cartItem.totalTiles;
      existingCart[existingItemIndex].totalPrice += cartItem.totalPrice;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    toast.success("🛒 Added to cart!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      className:
        "bg-white border border-green-400 text-green-800 text-lg font-semibold px-6 py-4 rounded-lg shadow-lg animate__animated animate__fadeInRight",
    });
  };

  if (
    (type === "tiles" && !tileData) ||
    (type === "sinks" && !sinkData) ||
    (type === "toilets" && !toiletData) ||
    (type === "marble" && !marbleData) ||
    (type === "granite" && !graniteData) ||
    (type === "bathtubs" && !bathtubData)
  ) {
    return <div className="text-center p-10">Loading Product...</div>;
  }

  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* === HEADER === */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
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
  onClick={handleVoiceInput}
  className="ml-2 text-blue-600 hover:text-blue-800 flex items-center justify-center"
  title="Voice Search"
>
  <FaMicrophone size={18} />
</button>
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

      {/* MAIN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 bg-white text-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div
            onClick={() => setIsImageModalOpen(true)}
            className={`relative rounded-2xl overflow-hidden shadow-lg cursor-pointer ${
              type === "marble"
                ? "border border-gray-200 bg-white p-1 shadow-[0_4px_20px_rgba(218,165,32,0.3)]"
                : "border"
            }`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[420px] object-cover rounded-xl transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1
                className={`text-3xl font-bold ${
                  type === "marble" ? "text-gray-800 italic" : "text-gray-900"
                }`}
              >
                {product.name}
              </h1>

              <button
                onClick={() => alert("Coming Soon: Visualize in Room!")}
                className="text-sm px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                <FaEye className="inline mr-1" /> View in My Room
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <FaShareAlt size={20} />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-md p-3 z-50 space-y-2 text-sm">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        productURL
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:underline"
                    >
                      <FaWhatsapp /> Share on WhatsApp
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        productURL
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <FaFacebook /> Share on Facebook
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        productURL
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sky-600 hover:underline"
                    >
                      <FaTwitter /> Share on X
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(productURL);
                        alert("Link copied!");
                      }}
                      className="flex items-center gap-2 text-gray-700 hover:underline"
                    >
                      <FaLink /> Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-base text-gray-600">{product.description}</p>
            {type === "tiles" && (
              <div
                className="p-6 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl shadow-md space-y-4"
                style={{ animationDuration: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    Ceramic Tile
                  </span>
                  <span className="text-xs text-gray-500">
                    (Category: Tiles)
                  </span>
                </div>
                <ul className="text-base text-gray-800 leading-relaxed space-y-2">
                  <li>
                    <strong>Size:</strong> {product.size}
                  </li>
                  <li>
                    <strong>Usage Type:</strong> {product.subcategory}
                  </li>
                  <li>
                    <strong>Manufacturer:</strong> {product.manufacturer}
                  </li>
                  <li>
                    <strong>Color:</strong> {product.color}
                  </li>
                  <strong>Stock:</strong>{" "}
                  {product.stock !== "N/A" && parseInt(product.stock) > 10
                    ? "In Stock"
                    : product.stock !== "N/A"
                    ? `Only ${product.stock} left`
                    : "N/A"}
                  <li>
                    <strong>Price:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{product.price}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {type === "sinks" && (
              <div
                className="p-6 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl shadow-md space-y-4 "
                style={{ animationDuration: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold">
                    Ceramic Sink
                  </span>
                  <span className="text-xs text-gray-500">(Sanitary Ware)</span>
                </div>
                <ul className="text-base text-gray-800 leading-relaxed space-y-2">
                  <li>
                    <strong>Size:</strong> {product.size}
                  </li>
                  <li>
                    <strong>Usage Type:</strong> {product.subcategory}
                  </li>
                  <li>
                    <strong>Manufacturer:</strong> {product.manufacturer}
                  </li>
                  <li>
                    <strong>Color:</strong> {product.color}
                  </li>
                  <li>
                    <strong>Stock:</strong>{" "}
                    {product.stock !== "N/A" && parseInt(product.stock) > 10
                      ? "In Stock"
                      : product.stock !== "N/A"
                      ? `Only ${product.stock} left`
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Price:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{product.price}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {type === "bathtubs" && (
              <div
                className="p-6 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl shadow-md space-y-4"
                style={{ animationDuration: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                    Elegant Bathtub
                  </span>
                  <span className="text-xs text-gray-500">(Sanitary Ware)</span>
                </div>
                <ul className="text-base text-gray-800 leading-relaxed space-y-2">
                  <li>
                    <strong>Size:</strong> {product.size}
                  </li>
                  <li>
                    <strong>Color:</strong> {product.color}
                  </li>
                  <li>
                    <strong>Stock:</strong>{" "}
                    {product.stock !== "N/A" && parseInt(product.stock) > 10
                      ? "In Stock"
                      : product.stock !== "N/A"
                      ? `Only ${product.stock} left`
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Price:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{product.price}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {type === "toilets" && (
              <div
                className="p-6 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl shadow-md space-y-4"
                style={{ animationDuration: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-semibold">
                    Modern Toilet
                  </span>
                  <span className="text-xs text-gray-500">(Sanitary Ware)</span>
                </div>
                <ul className="text-base text-gray-800 leading-relaxed space-y-2">
                  <li>
                    <strong>Type:</strong> {product.type || "N/A"}
                  </li>
                  <li>
                    <strong>Size:</strong> {product.size || "N/A"}
                  </li>
                  <li>
                    <strong>Color:</strong> {product.color || "N/A"}
                  </li>
                  <li>
                    <strong>Manufacturer:</strong>{" "}
                    {product.manufacturer || "N/A"}
                  </li>
                  <li>
                    <strong>Flush Type:</strong> {product.flush || "N/A"}
                  </li>
                  <li>
                    <strong>Price:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{product.price}
                    </span>
                  </li>
                  <li>
                    <strong>Stock:</strong>{" "}
                    {product.stock !== "N/A" && parseInt(product.stock) > 10
                      ? "In Stock"
                      : product.stock !== "N/A"
                      ? `Only ${product.stock} left`
                      : "N/A"}
                  </li>
                </ul>
              </div>
            )}

            {type === "marble" && (
              <div
                className="p-6 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl shadow-md space-y-4"
                style={{ animationDuration: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                    Premium Marble
                  </span>
                  <span className="text-xs text-gray-500">(Natural Stone)</span>
                </div>
                <ul className="text-base text-gray-800 leading-relaxed space-y-2">
                  <li>
                    <strong>Size:</strong> {product.size}
                  </li>
                  <li>
                    <strong>Color:</strong> {product.color}
                  </li>
                  <li>
                    <strong>Origin:</strong> {product.origin}
                  </li>
                  <li>
                    <strong>Stock:</strong>{" "}
                    {product.stock !== "N/A" && parseInt(product.stock) > 10
                      ? "In Stock"
                      : product.stock !== "N/A"
                      ? `Only ${product.stock} left`
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Price:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{product.price}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {type === "granite" && (
              <div
                className="p-6 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl shadow-md space-y-4"
                style={{ animationDuration: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold">
                    Premium Granite
                  </span>
                  <span className="text-xs text-gray-500">(Natural Stone)</span>
                </div>
                <ul className="text-base text-gray-800 leading-relaxed space-y-2">
                  <li>
                    <strong>Size:</strong> {product.size}
                  </li>
                  <li>
                    <strong>Color:</strong> {product.color}
                  </li>
                  <li>
                    <strong>Origin:</strong> {product.origin}
                  </li>
                  <li>
                    <strong>Stock:</strong>{" "}
                    {product.stock !== "N/A" && parseInt(product.stock) > 10
                      ? "In Stock"
                      : product.stock !== "N/A"
                      ? `Only ${product.stock} left`
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Price:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{product.price}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {(type === "sinks" ||
              type === "toilets" ||
              type === "bathtubs") && (
              <>
                {/* Input Quantity */}
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={
                      product.stock !== "N/A"
                        ? parseInt(product.stock)
                        : undefined
                    }
                    value={quantity}
                    onInput={(e) => {
                      const val = parseInt(e.target.value);
                      const stock = parseInt(product.stock);

                      if (isNaN(val) || val < 1) {
                        setQuantity(1);
                        setStockError("");
                      } else if (product.stock !== "N/A" && val > stock) {
                        setQuantity(stock);
                        setStockError(`You can shop upto ${stock} item only.`);
                      } else {
                        setQuantity(val);
                        setStockError("");
                      }
                    }}
                    className="w-32 border border-gray-300 rounded-xl px-4 py-2 text-sm shadow focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2"
                  />
                  {stockError && (
                    <p className="text-red-600 text-sm mt-1">{stockError}</p>
                  )}
                </div>

                {/* Pricing Summary Section */}
                <div className="mt-6 grid gap-4">
                  {/* Total Units */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      Total Units
                    </span>
                    <span className="text-green-600 font-bold text-sm">
                      {totalTiles}
                    </span>
                  </div>

                  {/* Price Per Unit */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      Price Per Unit
                    </span>
                    <span className="text-green-600 font-bold text-sm">
                      ₹{product.price}
                    </span>
                  </div>

                  {/* Final Price */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <span className="text-base font-semibold text-gray-800">
                      Total Price
                    </span>
                    <span className="text-blue-700 text-lg font-bold">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="mt-6 w-full py-3 px-6 bg-blue-600 text-white text-base rounded-xl font-semibold shadow-md hover:bg-blue-700 transition"
                >
                  🛒 Add to Cart
                </button>
              </>
            )}
            {(type === "tiles" || type === "marble" || type === "granite") && (
              <>
                {/* Input Quantity */}
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={
                      product.stock !== "N/A"
                        ? parseInt(product.stock)
                        : undefined
                    }
                    value={quantity}
                    onInput={(e) => {
                      const val = parseInt(e.target.value);
                      const stock = parseInt(product.stock);

                      if (isNaN(val) || val < 1) {
                        setQuantity(1);
                        setStockError("");
                      } else if (product.stock !== "N/A" && val > stock) {
                        setQuantity(stock);
                        setStockError(`You can shop upto ${stock} items only.`);
                      } else {
                        setQuantity(val);
                        setStockError("");
                      }
                    }}
                    className="w-32 border border-gray-300 rounded-xl px-4 py-2 text-sm shadow focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2"
                  />
                  {stockError && (
                    <p className="text-red-600 text-sm mt-1">{stockError}</p>
                  )}
                </div>

                {/* Pricing Summary Section */}
                <div className="mt-6 grid gap-4">
                  {/* Total Units */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      Total Units
                    </span>
                    <span className="text-green-600 font-bold text-sm">
                      {totalTiles}
                    </span>
                  </div>

                  {/* Price Per Unit */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      Price Per Square Foot
                    </span>
                    <span className="text-green-600 font-bold text-sm">
                      ₹{product.price}
                    </span>
                  </div>

                  {/* Final Price */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <span className="text-base font-semibold text-gray-800">
                      Total Price
                    </span>
                    <span className="text-blue-700 text-lg font-bold">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="mt-6 w-full py-3 px-6 bg-blue-600 text-white text-base rounded-xl font-semibold shadow-md hover:bg-blue-700 transition"
                >
                  🛒 Add to Cart
                </button>
              </>
            )}
          </div>
        </div>{" "}
        {/* closes the grid */}
      </main>

      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-[90%] max-h-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-0 right-0 m-3 text-white text-3xl font-bold z-50 hover:text-red-400"
            >
              &times;
            </button>

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg border-4 border-white shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
      <ToastContainer />
    </div>
  );
}
