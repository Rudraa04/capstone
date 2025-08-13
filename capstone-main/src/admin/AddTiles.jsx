import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";
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

export default function AddTiles() {
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
    usageCategory: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const brands = ["Kajaria", "Somany", "Johnson", "Asian Granito", "Nitco"];
  const usageTypes = ["Interior", "Exterior", "Sanitaryware"];
  const usageCategories = ["Wall", "Floor"];

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
        const storageRef = ref(
          storage,
          `Inventory/Tiles/${Date.now()}_${imageFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image.");
        return;
      }
   }

      const tileData = {
      Name: formData.name,
      Description: formData.description,
      Color: formData.color,
      Price: parseFloat(formData.price),
      Image: imageUrl,
      Category: "Tile",
      Stock_admin: parseInt(formData.quantity),
      Manufacturer: formData.brand,
      Size: size,
      SubCategory: formData.usageCategory,
      UsageType: formData.usageType,
    };

    try {
      await axios.post("http://localhost:5000/tiles", tileData);
      alert("Tile product added successfully!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Error adding tile product.");
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
          <button onClick={() => navigate("/admin/slabs")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiBox /> Slabs Inventory</button>
          <button onClick={() => navigate("/admin/ceramics")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiPackage /> Ceramics Inventory</button>
          <button onClick={() => navigate("/admin/orders")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiSettings /> Orders</button>
          <button onClick={() => navigate("/admin/support")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiHeadphones /> Customer Support</button>
          <button onClick={() => navigate("/admin/reports")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiTrendingUp /> Sales & Reports</button>
          <button onClick={() => navigate("/", { state: { fromAdmin: true } })} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"><FiGlobe /> Customer Homepage</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"><FiLogOut /> Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-blue-600 text-xl">
            <FiArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-blue-700">Add Tile Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-4 max-w-3xl">
          <div>
            <label className="block font-semibold mb-1">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Product Description</label>
            <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Brand / Manufacturer</label>
              <select name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded" required>
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Usage Type</label>
              <select name="usageType" value={formData.usageType} onChange={handleChange} className="w-full p-2 border rounded" required>
                <option value="">Select Usage Type</option>
                {usageTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Usage Category</label>
              <select name="usageCategory" value={formData.usageCategory} onChange={handleChange} className="w-full p-2 border rounded" required>
                <option value="">Select Usage Category</option>
                {usageCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Size / Dimensions (in)</label>
            <div className="flex items-center gap-2">
              <input type="text" name="length" value={formData.length} onChange={handleChange} placeholder="Length" className="w-1/2 p-2 border rounded text-center" required />
              <span className="text-lg font-bold">x</span>
              <input type="text" name="width" value={formData.width} onChange={handleChange} placeholder="Width" className="w-1/2 p-2 border rounded text-center" required />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block" />
            {imagePreview && (
              <div className="mt-4 w-32 h-32 border rounded overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="text-right pt-4">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
              Save Tile
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
