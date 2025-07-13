import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SearchResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q")?.toLowerCase() || "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [tilesRes, sinksRes, bathtubsRes, toiletsRes] = await Promise.all([
        fetch("http://localhost:5000/api/products/tiles"),
        fetch("http://localhost:5000/api/products/sinks"),
        fetch("http://localhost:5000/api/products/bathtubs"),
        fetch("http://localhost:5000/api/products/toilets"),
      ]);

      const [tiles, sinks, bathtubs, toilets] = await Promise.all([
        tilesRes.json(),
        sinksRes.json(),
        bathtubsRes.json(),
        toiletsRes.json(),
      ]);

      const all = [...tiles, ...sinks, ...bathtubs, ...toilets];

      const filtered = all.filter((item) => {
        const name = item?.Name?.toLowerCase() || "";
        const category = item?.Category?.toLowerCase() || "";
        const sub = item?.SubCategory?.toLowerCase() || "";
        return name.includes(query) || category.includes(query) || sub.includes(query);
      });

      setResults(filtered);
    };

    fetchAll();
  }, [query]);

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Search Results for: {query}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {results.length === 0 ? (
          <p>No matching products found.</p>
        ) : (
          results.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <img src={item.Image} alt={item.Name} className="w-full h-40 object-cover mb-4" />
              <h3 className="text-lg font-bold">{item.Name}</h3>
              <p className="text-sm text-gray-500">{item.Description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
