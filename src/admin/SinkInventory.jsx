import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSink, FaPlus } from "react-icons/fa6";
import { storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import axios from "axios";
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

export default function SinkInventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    ProductName: "",
    ProductDescription: "",
    Color: "",
    Price: "",
    Image: "",
    Category: "Sink",
    SubCategory: "",
    Quantity: "",
    Manufacturer: "",
    customBrand: "",
    length: "",
    width: "",
    height: "",
  });
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [usageTypeFilter, setUsageTypeFilter] = useState("");

  const brands = ["Hindware", "Jaquar", "Cera", "Parryware", "Imported", "Other"];
  const categories = ["Wall Mounted", "Table Top", "Corner Sink", "Under Counter"];

  useEffect(() => {
    fetchSinks();
  }, []);

  const fetchSinks = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/products/sinks"); // use full URL if no proxy
    setProducts(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Error fetching sinks:", err);
    setProducts([]);
  }
};

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileRef = ref(storage, `Inventory/Sinks/${file.name}-${Date.now()}`);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setImage(url);
      setFormData((prev) => ({ ...prev, Image: url }));
    } catch (err) {
      alert("Image upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const Size = `${formData.length}mm x ${formData.width}mm x ${formData.height}mm`;
    const ManufacturerFinal = formData.Manufacturer === "Other" ? formData.customBrand : formData.Manufacturer;

    const sinkData = {
      Name: formData.ProductName,
      Description: formData.ProductDescription,
      Color: formData.Color,
      Price: parseFloat(formData.Price),
      Image: image || formData.Image,
      Category: formData.Category,
      SubCategory: formData.SubCategory,
      Stock_admin: parseInt(formData.Quantity),
      Manufacturer: ManufacturerFinal,
      Size: `${formData.length} x ${formData.width} x ${formData.height}mm`
    };

    try {
      if (selectedProduct) {
        await axios.put(`http://localhost:5000/api/products/sinks/${selectedProduct._id}`, sinkData);
        alert("Sink updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/products/sinks", sinkData);
        alert("Sink added successfully!");
      }
    const res = await axios.get("http://localhost:5000/api/products/sinks");
    console.log("Fetched after update:", res.data);
    setProducts(res.data);
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving sink.");
    } finally {
      resetForm();
    }
  };

  const handleEdit = (item) => {
  const sizeParts = item.Size?.replace("mm", "").split("x").map(s => s.trim()) || [];
    setFormData({
      ProductName: item.Name,
      ProductDescription: item.Description,
      Color: item.Color,
      Price: item.Price,
      Image: item.Image,
      Category: item.Category,
      SubCategory: item.SubCategory,
      Quantity: item.Stock_admin,
      Manufacturer: isCustomBrand ? "Other" : item.Manufacturer,
      customBrand: isCustomBrand ? item.Manufacturer : "",
      length: sizeParts[0] || "",
      width: sizeParts[1] || "",
      height: sizeParts[2] || "",
    });
    setImage(item.Image);
    setSelectedProduct(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const product = products.find((p) => p._id === id);
    if (!product || !window.confirm("Delete this sink?")) return;

    try {
      if (product.Image?.includes("firebasestorage")) {
        const path = decodeURIComponent(product.Image.split("/o/")[1].split("?")[0]);
        await deleteObject(ref(storage, path));
      }
      await axios.delete(`http://localhost:5000/api/products/sinks/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert("Deleted successfully");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      ProductName: "",
      ProductDescription: "",
      Color: "",
      Price: "",
      Image: "",
      Category: "Sink",
      SubCategory: "",
      Quantity: "",
      Manufacturer: "",
      customBrand: "",
      length: "",
      width: "",
    });
    setImage(null);
    setSelectedProduct(null);
    setShowModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

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
          <h1 className="text-3xl font-bold text-blue-800">Sink Inventory</h1>
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
                  Category: "Sink",
                  SubCategory: "",
                  Quantity: "",
                  Manufacturer: "",
                  customBrand: "",
                  length: "",
                  width: "",
                });
                setSelectedProduct(null);
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
              <FaSink size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">Sink</h2>
            </div>
            <p className="text-gray-600">
              View and manage all sink products here.
            </p>
          </div>
        </div>

        {/* Product Table */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Product List
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Search Filter */}
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

            {/* Color Filter */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Color
              </label>
              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Colors</option>
                <option value="Matt Beige">Matt Beige</option>
                <option value="White">White</option>
                <option value="Matt Black">Matt Black</option>
                <option value="Matt Coco">Matt Coco</option>
                <option value="Glossy Black">Glossy Black</option>
                <option value="Royal Blue">Royal Blue</option>
                <option value="Matt Bianco">Matt Bianco</option>
              </select>
            </div>

            {/* Size Filter */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Size
              </label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Sizes</option>
                <option value="390 x 390 x 140mm">390 x 390 x 140mm</option>
                <option value="420 x 320 x 175mm">420 x 320 x 175mm</option>
                <option value="550 x 370 x 150mm">550 x 370 x 150mm</option>
                <option value="465 x 310 x 140mm">465 x 310 x 140mm</option>
                <option value="450 x 310 x 130mm">450 x 310 x 130mm</option>
                <option value="560 x 385 x 215mm">560 x 385 x 215mm</option>
                <option value="800 x 475 x 240mm">800 x 475 x 240mm</option>
                <option value="500 x 365 x 145mm">500 x 365 x 145mm</option>
                <option value="580 x 360 x 155mm">580 x 360 x 155mm</option>
                <option value="600 x 410 x 130mm">600 x 410 x 130mm</option>
                <option value="600 x 360 x 100mm">600 x 360 x 100mm</option>
                <option value="410 x 335 x 145mm">410 x 335 x 145mm</option>
                <option value="400 x 310 x 140mm">400 x 310 x 140mm</option>
                <option value="450 x 350 x 135mm">450 x 350 x 135mm</option>
                <option value="370 x 370 x 205mm">370 x 370 x 205mm</option>
                <option value="545 x 385 x 200mm">545 x 385 x 200mm</option>
                <option value="510 x 405 x 200mm">510 x 405 x 200mm</option>
                <option value="590 x 410 x 250mm">590 x 410 x 250mm</option>
                <option value="475 x 370 x 130mm">475 x 370 x 130mm</option>
                <option value="395 x 395 x 145mm">395 x 395 x 145mm</option>
                <option value="555 x 400 x 160mm">555 x 400 x 160mm</option>
                <option value="540 x 385 x 175mm">540 x 385 x 175mm</option>
                <option value="405 x 405 x 140mm">405 x 405 x 140mm</option>
                <option value="420 x 350 x 190mm">420 x 350 x 190mm</option>
              </select>
            </div>

            {/* Usage Type Filter */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Usage Type
              </label>
              <select
                value={usageTypeFilter}
                onChange={(e) => setUsageTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Usage Types</option>
                <option value="Table Top Sink Matt">Table Top Sink Matt</option>
                <option value="Art Table Top ">Art Table Top</option>
                <option value="Table Top Sink">Table Top Sink</option>
                <option value="Wall-hung Sink">Wall-hung Sink</option>
                <option value="Sink under Counter">Sink under Counter</option>
                <option value="Ceramic Sink">Ceramic Sink</option>
                <option value="Sink Under Counter">Sink Under Counter</option>
                <option value="Table Top Sink Glossy">
                  Table Top Sink Glossy
                </option>
                <option value="Counter Top Sink">Counter Top Sink</option>
                <option value="Platform Sink Glossy">
                  Platform Sink Glossy
                </option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setColorFilter("");
                  setSizeFilter("");
                  setUsageTypeFilter("");
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
                  .filter((item) =>
                    (item?.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (colorFilter === "" || item.Color === colorFilter) &&
                    (sizeFilter === "" || item.Size === sizeFilter) &&
                    (usageTypeFilter === "" || item.SubCategory === usageTypeFilter)
                  )

                  .map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-6 py-4">{item.Name}</td>
                      <td className="px-6 py-4">{item.Category}</td>
                      <td className="px-6 py-4">₹{item.Price}</td>
                      <td className="px-6 py-4">{item.Stock_admin}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                                const sizeParts = item.Size?.replace("mm", "").split("x").map(s => s.trim()) || [];

                              setFormData({
                                ProductName: item.Name || "",
                                ProductDescription: item.Description || "",
                                Color: item.Color || "",
                                Price: item.Price || "",
                                Image: item.Image || "",
                                Category: item.Category || "Sink",
                                SubCategory: item.SubCategory || "",
                                Quantity: item.Stock_admin || "",
                                Manufacturer: brands.includes(item.Manufacturer) ? item.Manufacturer : "Other",
                                customBrand: brands.includes(item.Manufacturer) ? "" : item.Manufacturer,
                                length: sizeParts[0] || "",
                                width: sizeParts[1] || "",
                                height: sizeParts[2] || "",
                              });

                              setImage(item.Image);
                              setSelectedProduct(item);
                              setShowModal(true);
                            }}
                            className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="px-3 py-1 rounded-md border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                          >
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
            {selectedProduct ? "Edit Sink Product" : "Add Sink Product"}
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
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block font-medium mb-1">Sub Category</label>
                  <input
                    type="text"
                    name="SubCategory"
                    value={formData.SubCategory}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
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
                <label className="block font-medium mb-1">Price (₹)</label>
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
                  Brand / Manufacturer
                </label>
                <select
                  name="Manufacturer"
                  value={formData.Manufacturer}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                {formData.Manufacturer === "Other" && (
                  <input
                    type="text"
                    name="customBrand"
                    value={formData.customBrand}
                    onChange={handleChange}
                    placeholder="Enter Brand Name"
                    className="mt-2 w-full px-3 py-2 border rounded-md"
                  />
                )}
              </div>

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
                    className="w-1/3 px-3 py-2 border rounded-md"
                  />
                  <span className="font-bold text-lg leading-none">×</span>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width"
                    min="0"
                    step="any"
                    required
                    className="w-1/3 px-3 py-2 border rounded-md"
                  />
                  <span className="font-bold text-lg leading-none">×</span>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
                    min="0"
                    step="any"
                    required
                    className="w-1/3 px-3 py-2 border rounded-md"
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
                {selectedProduct ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
