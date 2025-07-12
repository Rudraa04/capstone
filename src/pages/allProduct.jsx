import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/all');  // your new backend route
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchAllProducts();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {products.map((product, index) => (
    <div key={index} className="border rounded p-4 shadow hover:shadow-lg">
      <img
        src={product.Image || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={product.Name || 'No Name'}
        className="h-40 w-full object-cover mb-3"
      />
      <h2 className="text-lg font-semibold">{product.Name || 'No Name'}</h2>
      <p className="text-gray-600 text-sm mb-2">{product.Description || 'No description available'}</p>
      <p className="font-bold">₹{product.Price ?? 'N/A'}</p>
    </div>
  ))}
</div>

  );
};

export default AllProducts;
