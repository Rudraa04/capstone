import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TilesInventory() {
  const navigate = useNavigate();
  const items = [
    { id: 1, name: 'Glossy Tile', price: '$10', size: '2x2' },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Tiles Inventory</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        + Add Tile Product
      </button>
      <InventoryTable items={items} color="blue" />
    </div>
  );
}

function InventoryTable({ items, color }) {
  return (
    <table className="w-full border shadow-sm">
      <thead className={`bg-${color}-100 text-${color}-800`}>
        <tr>
          <th className="py-2 px-4 border">ID</th>
          <th className="py-2 px-4 border">Name</th>
          <th className="py-2 px-4 border">Price</th>
          <th className="py-2 px-4 border">Size</th>
          <th className="py-2 px-4 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="py-2 px-4 border">{item.id}</td>
            <td className="py-2 px-4 border">{item.name}</td>
            <td className="py-2 px-4 border">{item.price}</td>
            <td className="py-2 px-4 border">{item.size}</td>
            <td className="py-2 px-4 border space-x-2">
              <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
