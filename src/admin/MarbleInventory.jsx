import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChessBoard, FaPlus } from "react-icons/fa";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiHome,
  FiGlobe,
} from "react-icons/fi";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") onClose();
  };

  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function MarbleInventory() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    ProductName: "",
    ProductDescription: "",
    Color: "",
    Price: "",
    Image: "",
    Category: "Marble",
    Quantity: "",
    Manufacturer: "",
    customBrand: "",
    Origin: "",
    length: "",
    width: "",
  });

  const [image, setImage] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const brands = [
    "Bhandari",
    "Classic Marble",
    "R K Marble",
    "Imported",
    "Other",
  ];
  const usageTypes = ["Interior", "Exterior"];

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const Size = `${formData.length}x${formData.width}`;
    const finalBrand =
      formData.Manufacturer === "Other"
        ? formData.customBrand
        : formData.Manufacturer;

    const marbleData = {
      ProductName: formData.ProductName,
      ProductDescription: formData.ProductDescription,
      Color: formData.Color,
      Price: formData.Price,
      Image: image || "",
      Category: formData.Category,
      Quantity: formData.Quantity,
      Manufacturer: finalBrand,
      Origin: formData.Origin,
      Size: Size,
    };

    if (selectedIndex !== null) {
      // It's an Edit
      const updatedProducts = [...products];
      updatedProducts[selectedIndex] = marbleData;
      setProducts(updatedProducts);
      alert("Product updated successfully!");
    } else {
      // It's a New Add
      setProducts([...products, marbleData]);
      alert("Marble product added successfully!");
    }

    setFormData({}); // Clear form
    setSelectedIndex(null);
    setShowModal(false);
    setImage(null);
  };

  const [products, setProducts] = useState([
    {
      ProductName: "White Italian Marble",
      ProductDescription: "Premium white marble",
      Color: "White",
      Price: 980,
      Quantity: 18,
      Manufacturer: "Bhandari",
      Category: "Marble",
      Origin: "Italy",
      Size: "12x12",
      Image: "",
    },
    {
      ProductName: "Makrana Classic",
      ProductDescription: "Classic marble from Makrana",
      Color: "Cream",
      Price: 920,
      Quantity: 10,
      Manufacturer: "Classic Marble",
      Category: "Marble",
      Origin: "India",
      Size: "12x12",
      Image: "",
    },
  ]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <button
          onClick={() => navigate("/admin")}
          className="text-2xl font-bold text-blue-700 flex items-center gap-2 hover:text-blue-900 transition"
        >
          <FiHome /> Admin Panel
        </button>

        <nav className="space-y-4 text-sm">
          <button
            onClick={() => navigate("/admin/slabs")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiBox /> Slabs Inventory
          </button>
          <button
            onClick={() => navigate("/admin/ceramics")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiPackage /> Ceramics Inventory
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiSettings /> Orders
          </button>
          <button
            onClick={() => navigate("/admin/support")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiHeadphones /> Customer Support
          </button>

          <button
            onClick={() => navigate("/admin/reports")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiTrendingUp /> Sales & Reports
          </button>

          <button
            onClick={() => navigate("/", { state: { fromAdmin: true } })}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"
          >
            <FiGlobe /> Customer Homepage
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-800">Marble Inventory</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setFormData({
                  ProductName: "",
                  ProductDescription: "",
                  Color: "",
                  Price: "",
                  Image: "",
                  Category: "Marble",
                  Quantity: "",
                  Manufacturer: "",
                  customBrand: "",
                  Origin: "",
                  length: "",
                  width: "",
                });
                setSelectedIndex(null);
                setImage(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FaPlus /> Add New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FaChessBoard size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">Marble</h2>
            </div>
            <p className="text-gray-600">
              View and manage all marble slab products here.
            </p>
          </div>
        </div>

        {/* Product Table */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Product List
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Search Product
              </label>
              <input
                type="text"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Filter by Color
              </label>
              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Colors</option>
                <option value="Milky White ">Milky White</option>
                <option value="Green">Green</option>
                <option value="Gold">Gold</option>
                <option value="Light Pink">Light Pink</option>
                <option value="Dark green">Dark Green</option>
                <option value="White">White</option>
                <option value="Beige">Beige</option>
              </select>
            </div>

            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Filter by Origin
              </label>
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Origins</option>
                <option value="West India">West India</option>
                <option value="South India">South India</option>
                <option value="North India">North India</option>
                <option value="East India">East India</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setColorFilter("");
                  setOriginFilter("");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582M20 20v-5h-.581M5 19A9 9 0 0119 5M5 5l14 14"
                  />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(
                    (item) =>
                      item.ProductName.toLowerCase().includes(
                        searchTerm.toLowerCase()
                      ) &&
                      (colorFilter === "" || item.Color === colorFilter) &&
                      (originFilter === "" || item.Origin === originFilter)
                  )
                  .map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-6 py-4">{item.ProductName}</td>
                      <td className="px-6 py-4">{item.Category}</td>
                      <td className="px-6 py-4">${item.Price}</td>
                      <td className="px-6 py-4">{item.Quantity}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setFormData({
                                ProductName: item.ProductName,
                                ProductDescription: item.ProductDescription,
                                Color: item.Color,
                                Price: item.Price,
                                Category: item.Category,
                                Quantity: item.Quantity,
                                Manufacturer: item.Manufacturer,
                                Origin: item.Origin,
                                length: item.Size?.split("x")[0] || "",
                                width: item.Size?.split("x")[1] || "",
                                customBrand: "",
                              });
                              setSelectedIndex(index);
                              setShowModal(true);
                            }}
                            className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                          >
                            Edit
                          </button>

                          <button className="px-3 py-1 rounded-md border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 border-b pb-2">
            {selectedIndex !== null
              ? "Edit Marble Product"
              : "Add Marble Product"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 text-sm text-gray-700"
          >
            <div className="space-y-4 bg-gray-50 p-4 rounded-md border">
              <div>
                <label className="block font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  name="ProductName"
                  value={formData.ProductName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Product Description
                </label>
                <textarea
                  name="ProductDescription"
                  rows="3"
                  value={formData.ProductDescription}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>
              <div>
                <label className="block font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border">
              <div>
                <label className="block font-medium mb-1">Color</label>
                <input
                  type="text"
                  name="Color"
                  value={formData.Color}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="Quantity"
                  value={formData.Quantity}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Place of Origin
                </label>
                <input
                  type="text"
                  name="Origin"
                  value={formData.Origin}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border">
              <div>
                <label className="block font-medium mb-1">
                  Size / Dimensions (in)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="Length"
                    min="0"
                    step="any"
                    required
                    className="w-1/2 px-3 py-2 border rounded-md"
                  />
                  <span className="font-bold text-lg leading-none">X</span>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width"
                    min="0"
                    step="any"
                    required
                    className="w-1/2 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border space-y-3">
              <label className="block font-medium">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block"
              />
              {image && (
                <div className="w-32 h-32 border rounded overflow-hidden">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="text-right pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-700 text-white font-semibold rounded"
              >
                {selectedIndex !== null ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
