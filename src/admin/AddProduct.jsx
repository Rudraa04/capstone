import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiHome,
  FiArrowLeft,
  FiGlobe,
} from "react-icons/fi";

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    productType: "",
    usageType: "",
    brand: "",
    size: "",
    tags: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const brands = [
    "Kajaria",
    "Cera",
    "Hindware",
    "Johnson",
    "Somany",
    "Simpolo",
  ];

  const productTypes = [
    "Granite",
    "Marble",
    "Sinks",
    "Toilets",
    "Bathtubs",
    "Tiles",
  ];
  const usageTypes = ["Interior", "Exterior", "Sanitary"];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product added:", formData);
    alert("Product added successfully!");
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <div>
          <button
            onClick={() => navigate("/admin")}
            className="text-2xl font-bold text-blue-700 flex items-center gap-2 hover:text-blue-900 transition"
          >
            <FiHome /> Admin Panel
          </button>
        </div>
        <nav className="space-y-4 text-sm">
          <button
            onClick={() => navigate("/admin/slabs")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiBox /> Slabs Inventory
          </button>
          <button
            onClick={() => navigate("/admin/ceramics")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiPackage /> Ceramics Inventory
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
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
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-100 rounded-md"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Form Panel */}
      <main className="flex-1 flex justify-center items-start px-6 py-10 overflow-y-auto">
        <div className="bg-white w-full p-10 rounded-2xl shadow-2xl border border-gray-200">
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 text-xl"
            >
              <FiArrowLeft />
            </button>
            <h2 className="text-3xl font-bold text-blue-700">
              Add New Product
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Compact Grid*/}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              {/* Product Name */}
              <div>
                <label className="block font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Price & Quantity */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Product Type & Usage Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">
                    Product Type
                  </label>
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Type</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Usage Type</label>
                  <select
                    name="usageType"
                    value={formData.usageType}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Usage</option>
                    {usageTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand, Size, and Tags*/}
              <div className="grid md:grid-cols-3 gap-4 items-end">
                {/* Brand */}
                <div>
                  <label className="block font-semibold mb-1">
                    Brand / Manufacturer
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size - Centered */}
                <div className="flex flex-col items-center">
                  <label className="block font-semibold mb-1 text-center">
                    Size / Dimensions (in)
                  </label>
                  <div className="flex gap-2 justify-center">
                    <input
                      type="text"
                      name="length"
                      value={formData.length || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d{0,3}$/.test(val)) {
                          setFormData((prev) => ({ ...prev, length: val }));
                        }
                      }}
                      placeholder="Len"
                      className="w-20 p-2 border rounded-md text-center"
                      inputMode="numeric"
                    />
                    <span className="text-lg font-bold">x</span>
                    <input
                      type="text"
                      name="width"
                      value={formData.width || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d{0,3}$/.test(val)) {
                          setFormData((prev) => ({ ...prev, width: val }));
                        }
                      }}
                      placeholder="Wid"
                      className="w-20 p-2 border rounded-md text-center"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-semibold mb-1">
                    Tags / Keywords
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. polished, matte, classic"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Description & Image*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Product Description
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Upload Product Image
                </label>
                <div className="border border-dashed rounded-md p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="upload-image"
                  />
                  <label
                    htmlFor="upload-image"
                    className="cursor-pointer text-blue-600 font-medium"
                  >
                    Click to upload product image
                  </label>
                  {image && (
                    <div className="mt-4 w-32 h-32 mx-auto border rounded overflow-hidden">
                      <img
                        src={image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
