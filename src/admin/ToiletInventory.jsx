import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaToilet, FaPlus } from "react-icons/fa6";
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
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
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

export default function ToiletInventory() {
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
  Category: "Toilet",
  SubCategory: "",
  Quantity: "",
  Manufacturer: "",
  customBrand: "",
  FlushType: "",
  length: "",
  width: "",
  height: "",
});

  const brands = ["Hindware", "Jaquar", "Cera", "Parryware", "Imported", "Other"];
  const flushTypes = ["Single Flush", "Dual Flush", "Pressure Assisted", "5D Vortex Siphonic Flushing", "Siphonic Flushing", "Washdown Flushing", "with jet / without jet", "4D Vortex Flushing", "Other" ];
  const subcategories = ["One-Piece", "Two-Piece", "Wall Hung"];

  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [usageTypeFilter, setUsageTypeFilter] = useState("");
  const [flushTypeFilter, setFlushTypeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  useEffect(() => {
    fetchToilets();
  }, []);

  const fetchToilets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/toilets");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching toilets:", err);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileRef = ref(storage, `Inventory/Toilets/${file.name}-${Date.now()}`);
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

  const toiletData = {
    Name: formData.ProductName,
    Description: formData.ProductDescription,
    Color: formData.Color,
    Price: parseFloat(formData.Price),
    Image: image || formData.Image,
    Category: formData.Category,
    SubCategory: formData.SubCategory,
    Stock_admin: parseInt(formData.Quantity),
    Manufacturer: ManufacturerFinal,
    Size: Size,
    FlushType: formData.FlushType,
  };

  try {
    if (selectedProduct) {
      await axios.put(`http://localhost:5000/api/products/toilets/${selectedProduct._id}`, toiletData);
      alert("Toilet updated successfully!");
    } else {
      await axios.post("http://localhost:5000/api/products/toilets", toiletData);
      alert("Toilet added successfully!");
    }
    fetchToilets();
    resetForm();
  } catch (err) {
    console.error("Submit Error:", err);
    alert("Error saving toilet.");
  }
};

  const handleEdit = (item) => {
  const sizeParts = item.Size?.replace("mm", "").split("x").map(s => s.trim()) || [];

  setFormData({
    ProductName: item.Name || "",
    ProductDescription: item.Description || "",
    Color: item.Color || "",
    Price: item.Price || "",
    Image: item.Image || "",
    Category: item.Category || "Toilet",
    SubCategory: item.SubCategory || "",
    Quantity: item.Stock_admin || "",
    Manufacturer: item.Manufacturer || "",
    customBrand: "",
    FlushType: item.FlushType || "",
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
    if (!product || !window.confirm("Delete this toilet?")) return;
    try {
      if (product.Image?.includes("firebasestorage")) {
        const path = decodeURIComponent(product.Image.split("/o/")[1].split("?")[0]);
        await deleteObject(ref(storage, path));
      }
      await axios.delete(`http://localhost:5000/api/products/toilets/${id}`);
      fetchToilets();
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
  Category: "Toilet",
  SubCategory: "",
  Quantity: "",
  Manufacturer: "",
  customBrand: "",
  FlushType: "",
  length: "",
  width: "",
  height: "",
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
          <h1 className="text-3xl font-bold text-blue-800">Toilet Inventory</h1>
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
                  Category: "Toilet",
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
              <FaToilet size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">Toilet</h2>
            </div>
            <p className="text-gray-600">
              View and manage all toilet products here.
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
                <option value="Rimless One Piece Closet">
                  Rimless One Piece Closet
                </option>
                <option value="One Piece Closet">One Piece Closet</option>
              </select>
            </div>

            {/* Flush Type Filter */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Flush Type
              </label>
              <select
                value={flushTypeFilter}
                onChange={(e) => setFlushTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Flush Type</option>
                {flushTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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
                <option value="640 x 365 x 775mm">640 x 365 x 775mm</option>
                <option value="665 x 365 x 750mm">665 x 365 x 750mm</option>
                <option value="665 x 360 x 750mm">665 x 360 x 750mm</option>
                <option value="675 x 355 x 750mm">675 x 355 x 750mm</option>
                <option value="715 x 380 x 775mm">715 x 380 x 775mm</option>
                <option value="670 x 360x 730mm">670 x 360x 730mm</option>
                <option value="655 x 350 x 740mm">655 x 350 x 740mm</option>
                <option value="700 x 365 x 730mm">700 x 365 x 730mm</option>
                <option value="675 x 390 x 790mm">675 x 390 x 790mm</option>
                <option value="660 x 355 x 740mm">660 x 355 x 740mm</option>
                <option value="660 x 360 x 725mm">660 x 360 x 725mm</option>
                <option value="715 x 385 x 760mm">715 x 385 x 760mm</option>
                <option value="665 x 350 x 715mm">665 x 350 x 715mm</option>
                <option value="715 x 370 x 680mm">715 x 370 x 680mm</option>
                <option value="715 x 405 x 685mm">715 x 405 x 685mm</option>
                <option value="700 x 350 x 690mm">700 x 350 x 690mm</option>
                <option value="685 x 365 x 675mm">685 x 365 x 675mm</option>
                <option value="520 x 290 x 515mm">520 x 290 x 515mm</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setUsageTypeFilter("");
                  setFlushTypeFilter(""); 
                  setSizeFilter("");
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
                      (item.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
                      (usageTypeFilter === "" || item.SubCategory === usageTypeFilter) &&
                      (flushTypeFilter === "" || item.FlushType === flushTypeFilter) &&
                      (sizeFilter === "" || item.Size === sizeFilter)
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
                              const sizeParts = item.Size?.replace("mm", "").split("x").map(part => part.trim()) || [];
                              setFormData({
                                ProductName: item.Name,
                                ProductDescription: item.Description,
                                Color: item.Color,
                                Price: item.Price,
                                Category: item.Category,
                                SubCategory: item.SubCategory || "",
                                Quantity: item.Stock_admin,
                                Manufacturer: item.Manufacturer,
                                customBrand: "",
                                FlushType: item.FlushType || "",
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
            {selectedProduct 
              ? "Edit Toilet Product"
              : "Add Toilet Product"}
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
              <label className="block font-medium mb-1">Flush Type</label>
              <select
                name="FlushType"
                value={formData.FlushType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Flush Type</option>
                {flushTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              
              {formData.FlushType === "Other" && (
                <input
                  type="text"
                  name="customFlushType"
                  value={formData.customFlushType || ""}
                  onChange={handleChange}
                  placeholder="Enter Custom Flush Type"
                  className="mt-2 w-full px-3 py-2 border rounded-md"
                />
              )}
            </div>

              <div className="bg-gray-50">
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
                required
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
