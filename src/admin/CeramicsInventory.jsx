import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CeramicsInventory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-8">
        <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Ceramics Inventory</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/admin/inventory/tiles')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-lg font-medium shadow"
        >
          Tiles
        </button>
        <button
          onClick={() => navigate('/admin/inventory/bathtubs')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-lg font-medium shadow"
        >
          Bathtubs
        </button>
        <button
          onClick={() => navigate('/admin/inventory/sinks')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-lg font-medium shadow"
        >
            Sinks
        </button>
        <button
          onClick={() => navigate('/admin/inventory/toilets')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-lg font-medium shadow"
        >
          Toilets
        </button>
      </div>
    </div>
  );
}
