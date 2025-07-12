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
} from "react-icons/fa";
import marbleImages from "../images/marble";
import graniteImages from "../images/granite";
import Footer from "../components/Footer";
import axios from "axios";
import { useLocation } from "react-router-dom";

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

  const [customSize, setCustomSize] = useState("12x12");
  const [quantity, setQuantity] = useState(1);
  const [pricePerTile, setPricePerTile] = useState(0);

  const [tileData, setTileData] = useState(null);
  const [sinkData, setSinkData] = useState(null);
  const [toiletData, setToiletData] = useState(null);

  const [marbleData, setMarbleData] = useState(null);

  const [graniteData, setGraniteData] = useState(null);

  const location = useLocation();
  const fromTab = location.state?.fromTab;

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

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    alert("Logged out!");
    navigate("/login");
  };

  const underlineHover =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300";

  const data = {
    marble: {
      names: [
        "Golden Emperador Marble",
        "Rosa Aurora Marble",
        "Verde Alpi Marble",
        "Crema Marfil Marble",
        "Carrara White Marble",
        "Jaisalmer Yellow Marble",
        "Calacatta Gold Marble",
        "Udaipur Green Marble",
      ],
      desc: [
        "Rich golden tones with dramatic dark veins. A luxurious choice for upscale interiors.",
        "Soft pink hue with delicate veining. Ideal for bathrooms and serene settings.",
        "Deep green marble with white veins. Adds bold character to any space.",
        "Creamy beige marble, classic and versatile. Matches any decor style.",
        "Iconic white marble with soft gray veins. A timeless choice for elegant surfaces.",
        "Warm golden-yellow tones. Popular in Indian architecture and temples.",
        "White marble with bold gold and brown veins. Premium and eye-catching.",
        "Bright green marble with natural white veining. Eco-inspired and unique.",
      ],
      images: marbleImages,
    },
    granite: {
      names: [
        "Black Galaxy Granite",
        "Ruby Red Granite",
        "Alaska White Granite",
        "Steel Grey Granite",
        "Ivory Brown Granite",
        "Forest Green Granite",
        "Blue Pearl Granite",
        "Tan Brown Granite",
      ],
      desc: [
        "Classic black finish with golden speckles. Perfect for countertops and vanities.",
        "Deep red granite with dark veins. Ideal for bold, statement interiors.",
        "Bright white granite with subtle gray patterns. Enhances modern kitchens.",
        "Mid-tone grey with consistent grain. Suitable for both floors and facades.",
        "A warm blend of beige and brown. Great for cozy living spaces.",
        "Natural green with dark accents. Adds a lush, earthy feel to any setting.",
        "Luxurious blue granite with a shimmering finish. A favorite for luxury spaces.",
        "Dark brown with chocolate and black flecks. Durable and elegant.",
      ],
      images: graniteImages,
    },
  };

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
      description: sinkData.Description || "N/A",
      size: sinkData.Size || "N/A",
      price: sinkData.Price || 0,
      color: sinkData.Color || "N/A",
      manufacturer: sinkData.Manufacturer || "N/A",
      stock: sinkData.Stock_admin ?? "N/A",
      subcategory: sinkData.SubCategory || "N/A",
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

  const handleAddToCart = () => {
    const cartItem = {
  id: Date.now(), // or a UUID
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
alert("✅ Added to cart!");
  };
  if (
    (type === "tiles" && !tileData) ||
    (type === "sinks" && !sinkData) ||
    (type === "toilets" && !toiletData) ||
    (type === "marble" && !marbleData) ||
    (type === "granite" && !graniteData)
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
              onClick={() => navigate(`/ceramics?type=${fromTab}`)}
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
                <div
                  className="absolute top-full right-0 mt-8 bg-white border border-gray-300 shadow-xl rounded-xl p-8 grid grid-cols-4 gap-10
          w-[1200px] max-w-screen-xl z-50 text-base font-sans transform translate-x-[100px]"
                >
                  {/* CATEGORY */}
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

                  {/* WALL TILES */}
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

                  {/* FLOOR TILES */}
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

                  {/* TILE FINDER */}
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

      {/* MAIN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 bg-white text-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Image with Zoom */}
          <div className="relative overflow-hidden border rounded-xl shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[420px] object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <button
                onClick={() => alert("📷 Coming Soon: Visualize in Room!")}
                className="text-sm px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>
                  <strong>Size:</strong> {product.size || "N/A"}
                </li>
                <li>
                  <strong>Sub Category:</strong> {product.subcategory || "N/A"}
                </li>
                <li>
                  <strong>Manufacturer:</strong> {product.manufacturer || "N/A"}
                </li>
                <li>
                  <strong>Color:</strong> {product.color || "N/A"}
                </li>
                <li>
                  <strong>Stock:</strong> {product.stock || "N/A"}
                </li>
                <li>
                  <strong>Price:</strong> ₹{product.price}
                </li>
              </ul>
            )}

            {type === "sinks" && (
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>
                  <strong>Size:</strong> {product.size}
                </li>
                <li>
                  <strong>Sub Category:</strong> {product.subcategory}
                </li>
                <li>
                  <strong>Color:</strong> {product.color}
                </li>
                <li>
                  <strong>Manufacturer:</strong> {product.manufacturer}
                </li>
                <li>
                  <strong>Stock:</strong> {product.stock}
                </li>
                <li>
                  <strong>Price:</strong> ₹{product.price}
                </li>
              </ul>
            )}

            {type === "toilets" && (
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>
                  <strong>Size:</strong> {product.size || "N/A"}
                </li>
                <li>
                  <strong>Type:</strong> {product.type || "N/A"}
                </li>
                <li>
                  <strong>Color:</strong> {product.color || "N/A"}
                </li>
                <li>
                  <strong>Manufacturer:</strong> {product.manufacturer || "N/A"}
                </li>
                <li>
                  <strong>Flush Type:</strong> {product.flush || "N/A"}
                </li>
                <li>
                  <strong>Origin:</strong> {product.origin || "N/A"}
                </li>
                <li>
                  <strong>Price:</strong> ₹{product.price}
                </li>
              </ul>
            )}

            {type === "marble" && (
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                {" "}
                <li>
                  <strong>Size:</strong> {product.size}
                </li>{" "}
                <li>
                  <strong>Color:</strong> {product.color}
                </li>{" "}
                <li>
                  <strong>Origin:</strong> {product.origin}
                </li>{" "}
                <li>
                  <strong>Stock:</strong> {product.stock}
                </li>{" "}
                <li>
                  <strong>Price:</strong> ₹{product.price}
                </li>{" "}
              </ul>
            )}

            {type === "granite" && (
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                {" "}
                <li>
                  <strong>Size:</strong> {product.size}
                </li>{" "}
                <li>
                  <strong>Color:</strong> {product.color}
                </li>{" "}
                <li>
                  <strong>Manufacturer:</strong> {product.manufacturer}
                </li>{" "}
                <li>
                  <strong>Origin:</strong> {product.origin}
                </li>{" "}
                <li>
                  <strong>Stock:</strong> {product.stock}
                </li>{" "}
                <li>
                  <strong>Price:</strong> ₹{product.price}
                </li>{" "}
              </ul>
            )}

            {(type === "tiles" ||
              type === "sinks" ||
              type === "toilets" ||
              type === "marble" ||
              type === "granite") && (
              <>
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-semibold text-gray-800">
                    Enter Custom Size (in inches, e.g., 24x36)
                  </label>
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-32 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-between text-sm text-gray-700 pt-2">
                  <span>Total Units:</span>
                  <span className="font-semibold text-green-700">
                    {totalTiles}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-700 pt-2">
                  <span>Price Per Item:</span>
                  <span className="font-semibold text-green-700">
                    ₹{product.price || pricePerTile}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-semibold mt-2">
                  <span>Total Price:</span>
                  <span className="text-blue-700">₹{totalPrice}</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-6 bg-blue-600 text-white text-base rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
