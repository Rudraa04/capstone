import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AddSink() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
    price: "",
    category: "",
    length: "",
    width: "",
    brand: "",
    quantity: "",
  });

  const [image, setImage] = useState(null);

  const brands = ["Hindware", "Jaquar", "Cera", "Parryware", "Imported"];

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

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const size = `${formData.length}x${formData.width}`;
    const sinkData = { ...formData, size };
    console.log("Submitted:", sinkData);
    alert("Sink product added successfully!");
    navigate(-1);
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
          <h1 className="text-3xl font-bold text-blue-700">Add Sink Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-4 max-w-3xl">
          {/* Product Name */}
          <div>
            <label className="block font-semibold mb-1">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Product Description</label>
            <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>

          {/* Color + Price */}
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

          {/* Category (Dropdown - Empty for Now) */}
          <div>
            <label className="block font-semibold mb-1">Product Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Select Category</option>
              {/* Placeholder only — no options for now */}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block font-semibold mb-1">Size / Dimensions (in)</label>
            <div className="flex items-center gap-2">
              <input type="text" name="length" value={formData.length} onChange={handleChange} placeholder="Length" className="w-1/2 p-2 border rounded text-center" required />
              <span className="text-lg font-bold">x</span>
              <input type="text" name="width" value={formData.width} onChange={handleChange} placeholder="Width" className="w-1/2 p-2 border rounded text-center" required />
            </div>
          </div>

          {/* Brand + Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Brand / Manufacturer</label>
              <select name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded" required>
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block font-semibold mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block" />
            {image && (
              <div className="mt-4 w-32 h-32 border rounded overflow-hidden">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="text-right pt-4">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
              Save Sink
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
