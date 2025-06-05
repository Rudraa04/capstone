import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import slabBanner from "../images/slabs-banner.png";

export default function Ceramics() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get("type") || "tiles";
  const [activeTab, setActiveTab] = useState(initialType.toLowerCase());
  const [filters, setFilters] = useState({
    category: [],
    size: [],
    color: [],
  });

  const navigate = useNavigate();

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Back Button */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Hero Section */}
      <section
        className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${slabBanner})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Finest Ceramic Fixtures</h1>
          <p className="text-lg">
            Stylish Tiles, Sinks, and Sanitaryware for Elegant Interiors
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="max-w-[92rem] mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Explore Ceramic Products</h2>
          <p className="text-gray-600">
            Choose a category and filter your options
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-[220px] space-y-8">
            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Filter Products
              </h3>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">
                  Search by Category
                </h4>
                {["Tiles", "Sinks", "Bathtubs", "Toilets"].map((option) => (
                  <label
                    key={option}
                    className="block text-sm text-gray-800 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.category.includes(option)}
                      onChange={() => toggleFilter("category", option)}
                    />
                    {option}
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">
                  Search by Size
                </h4>
                {["12x12", "16x16", "24x24", "30x30"].map((option) => (
                  <label
                    key={option}
                    className="block text-sm text-gray-800 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.size.includes(option)}
                      onChange={() => toggleFilter("size", option)}
                    />
                    {option}
                  </label>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Search by Color
                </h4>
                {["White", "Ivory", "Beige", "Gray", "Black"].map((option) => (
                  <label
                    key={option}
                    className="block text-sm text-gray-800 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.color.includes(option)}
                      onChange={() => toggleFilter("color", option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Section */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-4 mb-8">
              {["tiles", "bathtub", "sinks", "toilets"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold border ${
                    activeTab === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition"
                >
                  <img
                    src={`https://source.unsplash.com/400x300/?${activeTab},ceramic&sig=${i}`}
                    alt={`Ceramic ${i + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} #
                      {i + 1}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Elegant and functional. Designed for modern spaces.
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
