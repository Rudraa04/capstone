import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaToilet, FaPlus } from "react-icons/fa6";
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
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };
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
    length: "",
    width: "",
  });
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const flushTypes = ["Dual Flush", "Single Flush", "Pressure Assisted"];
  const productTypes = ["One-Piece", "Two-Piece", "Wall Hung"];
  const brands = [
    "Hindware",
    "Cera",
    "Jaquar",
    "Parryware",
    "Imported",
    "Other",
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const Size = `${formData.length}x${formData.width}`;
    const ManufacturerFinal =
      formData.Manufacturer === "Other"
        ? formData.customBrand
        : formData.Manufacturer;

    const toiletData = {
      ProductName: formData.ProductName,
      ProductDescription: formData.ProductDescription,
      Color: formData.Color,
      Price: formData.Price,
      Image: image || "",
      Category: formData.Category,
      SubCategory: formData.SubCategory,
      Quantity: formData.Quantity,
      Manufacturer: ManufacturerFinal,
      Size: Size,
    };

    if (selectedIndex !== null) {
      const updated = [...products];
      updated[selectedIndex] = toiletData;
      setProducts(updated);
      alert("Toilet product updated successfully!");
    } else {
      setProducts([...products, toiletData]);
      alert("Toilet product added successfully!");
    }

    setFormData({});
    setImage(null);
    setSelectedIndex(null);
    setShowModal(false);
  };

  const [products, setProducts] = useState([
    {
      ProductName: "Dual Flush Toilet",
      ProductDescription: "Water-saving dual flush system.",
      Color: "White",
      Price: 280,
      Category: "Toilet",
      SubCategory: "Two-Piece",
      Quantity: 40,
      Manufacturer: "Hindware",
      Origin: "India",
      Size: "28x18",
      Image: "",
    },
    {
      ProductName: "Compact Ceramic Toilet",
      ProductDescription: "Space-saving ceramic toilet.",
      Color: "Beige",
      Price: 250,
      Category: "Toilet",
      SubCategory: "One-Piece",
      Quantity: 35,
      Manufacturer: "Cera",
      Origin: "India",
      Size: "26x16",
      Image: "",
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState(null);

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
                {products.map((item, index) => (
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
                              SubCategory: item.SubCategory,
                              Quantity: item.Quantity,
                              Manufacturer: item.Manufacturer,
                              customBrand: "",
                              length: item.Size?.split("x")[0] || "",
                              width: item.Size?.split("x")[1] || "",
                            });
                            setImage(item.Image || null);
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

              <div className="bg-gray-50">
                <label className="block font-medium mb-1">
                  Size / Dimensions (in)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="Length"
                    required
                    className="w-1/2 px-3 py-2 border rounded-md text-center"
                  />
                  <span className="font-bold">x</span>
                  <input
                    type="text"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width"
                    required
                    className="w-1/2 px-3 py-2 border rounded-md text-center"
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
