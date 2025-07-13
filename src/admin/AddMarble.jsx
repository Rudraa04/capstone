import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiLogOut,
  FiHome,
  FiGlobe,
  FiArrowLeft,
} from "react-icons/fi";

export default function AddMarble() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
    price: "",
    quantity: "",
    brand: "",
    length: "",
    width: "",
    usageType: "",
  });

  const [image, setImage] = useState(null);

  const brands = ["Bhandari", "Classic Marble", "R K Marble", "Imported"];
  const usageTypes = ["Interior", "Exterior"];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const size = `${formData.length.trim()}x${formData.width.trim()}`;
    
    let imageUrl = "";
    if (imageFile) {
      try {
        const storageRef = ref(storage, `Inventory/Marble/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image.");
        return;
      }
    }

    const marbleData = {
      Name: formData.name,
      Description: formData.description,
      Color: formData.color,
      Price: parseFloat(formData.price),
      Image: imageUrl,
      Category: "Marble",
      Stock_admin: parseInt(formData.quantity),
      Origin: formData.brand,
      Size: size,
      UsageType: formData.usageType,
    };

  try {
      await axios.post("http://localhost:5000/marble", marbleData);
      alert("Marble product added successfully!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Error adding marble product.");
    }
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

    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 text-xl"
          >
            <FiArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-blue-700">
            Add Marble Product
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Product Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold">
                Brand / Manufacturer
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Size with Length x Width inputs */}
            <div>
              <label className="block font-semibold mb-1">
                Size / Dimensions (in)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="length"
                  value={formData.length || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, length: e.target.value }))
                  }
                  placeholder="Length"
                  className="w-1/2 p-2 border rounded text-center"
                  required
                />
                <span className="font-bold text-lg">x</span>
                <input
                  type="text"
                  name="width"
                  value={formData.width || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, width: e.target.value }))
                  }
                  placeholder="Width"
                  className="w-1/2 p-2 border rounded text-center"
                  required
                />
              </div>
            </div>

            {/* Usage Type Dropdown */}
            <div>
              <label className="block font-semibold mb-1">Usage Type</label>
              <select
                name="usageType"
                value={formData.usageType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
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

          <div>
            <label className="block font-semibold">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block mt-1"
            />
            {image && (
              <div className="mt-4 w-32 h-32 border rounded overflow-hidden">
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
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Save Marble
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
