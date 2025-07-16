import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBath, FaPlus } from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebase";
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

export default function BathtubInventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState(null);

  const [formData, setFormData] = useState({
    ProductName: "",
    ProductDescription: "",
    Color: "",
    Price: "",
    Image: "",
    Category: "Bathtub",
    Quantity: "",
    Manufacturer: "",
    customBrand: "",
    length: "",
    width: "",
    height: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const brands = [
  "KOHLER",
  "TOTO",
  "American Standard",
  "Duravit",
  "Jaquar",
  "Hansgrohe",
  "Delta",
  "Other"
];

  const handleLogout = () => {
  localStorage.removeItem("isAdminLoggedIn");
  navigate("/login");
};
  const fetchBathtubs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/bathtubs");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching bathtubs:", err);
    }
  };

  useEffect(() => {
    fetchBathtubs();
  }, []);

  const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fileRef = ref(storage, `Inventory/Bathtubs/${file.name}-${Date.now()}`);
      try {
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        setImage(url);
        setFormData((prev) => ({ ...prev, Image: url }));
      } catch (err) {
        alert("Image upload failed.");
      }
    };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const Size = `${formData.length} x ${formData.width} x ${formData.height}mm`;
    const ManufacturerFinal = formData.Manufacturer === "Other" ? formData.customBrand : formData.Manufacturer;

    const data = {
      Name: formData.ProductName,
      Description: formData.ProductDescription,
      Color: formData.Color,
      Price: parseFloat(formData.Price),
      Image: image || formData.Image,
      Category: formData.Category,
      SubCategory: formData.SubCategory,
      Stock_admin: parseInt(formData.Quantity),
      Manufacturer: ManufacturerFinal,
      Size,
    };

    try {
      if (selectedProduct) {
        await axios.put(`http://localhost:5000/api/products/bathtubs/${selectedProduct._id}`, data);
        alert("Bathtub updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/products/bathtubs", data);
        alert("Bathtub added successfully!");
      }
      fetchBathtubs();
      resetForm();
    } catch (err) {
      console.error("Error submitting bathtub:", err);
      alert("Failed to save bathtub.");
    }
  };

  const handleEdit = (item) => {
    const sizeParts = item.Size?.replace("mm", "").split("x").map(s => s.trim()) || [];
    const brandExists = brands.some(
    (b) => b.toLowerCase() === (item.Manufacturer || "").toLowerCase()
  );
    setFormData({
      ProductName: item.Name || "",
      ProductDescription: item.Description || "",
      Color: item.Color || "",
      Price: item.Price || "",
      Image: item.Image || "",
      Category: item.Category || "Bathtub",
      Quantity: item.Stock_admin || "",
      Manufacturer: brandExists ? item.Manufacturer : "Other",
    customBrand: brandExists ? "" : item.Manufacturer || "",
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
  if (!product || !window.confirm("Delete this bathtub?")) return;
  try {
    // Delete image from Firebase
    if (product.Image?.includes("firebasestorage")) {
      const path = decodeURIComponent(product.Image.split("/o/")[1].split("?")[0]);
      await deleteObject(ref(storage, path));
    }

    // Delete product from backend
    await axios.delete(`http://localhost:5000/api/products/bathtubs/${id}`);
    fetchBathtubs(); // Refresh the list after deletion
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
      Category: "Bathtub",
      SubCategory: "",
      Quantity: "",
      Manufacturer: "",
      customBrand: "",
      length: "",
      width: "",
      height: "",
    });
    setImage(null);
    setSelectedProduct(null);
    setShowModal(false);
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
          <h1 className="text-3xl font-bold text-blue-800">
            Bathtub Inventory
          </h1>
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
                  Category: "Bathtub",
                  SubCategory: "",
                  Quantity: "",
                  Manufacturer: "",
                  customBrand: "",
                  length: "",
                  width: "",
                  height: "",
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
              <FaBath size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">Bathtubs</h2>
            </div>
            <p className="text-gray-600">
              View and manage all bathtub products here.
            </p>
          </div>
        </div>

        {/* Product Table */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Product List
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <option value="Light Blue">Light Blue</option>
                <option value="White">White</option>
                <option value="White + Dark Pink">White + Dark Pink</option>
                <option value="Blue">Blue</option>
                <option value="Golden">Golden</option>
              </select>
            </div>

            {/* Reset Button */}
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
                  .filter((item) => {
                    const name = item?.Name?.toLowerCase() || "";
                    const search = searchTerm.toLowerCase();
                  
                    return name.includes(search) &&
                      (colorFilter === "" || item.Color === colorFilter);
                  })
                
                  .map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-6 py-4">{item.Name}</td>
                      <td className="px-6 py-4">{item.Category}</td>
                      <td className="px-6 py-4">₹{item.Price}</td>
                      <td className="px-6 py-4">{item.Stock_admin}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
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
            {selectedProduct ? "Edit Bathtub Product" : "Add Bathtub Product"}
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
  <label className="block font-medium mb-1">Brand / Manufacturer</label>
  <select
  name="Manufacturer"
  value={formData.Manufacturer}
  onChange={handleChange}
  className="w-full px-3 py-2 border rounded-md"
>
  <option value="">Select Brand</option>
  {[...new Set([...brands, formData.Manufacturer])]
    .filter(Boolean)
    .map((brand) => (
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
                  <span className="font-bold text-lg leading-none">X</span>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
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
                {selectedProduct !== null ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
