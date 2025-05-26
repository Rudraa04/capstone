import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderManagement() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      customer: 'Krish Patel',
      product: 'Italian Marble – 6x4',
      quantity: 5,
      total: '$1000',
      status: 'Pending',
      date: 'May 26, 2025',
    },
  ]);

  const handleStatusUpdate = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-blue-800 mb-6">Order Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full border shadow-md">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="py-2 px-4 border">Order ID</th>
              <th className="py-2 px-4 border">Customer</th>
              <th className="py-2 px-4 border">Product</th>
              <th className="py-2 px-4 border">Qty</th>
              <th className="py-2 px-4 border">Total</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 px-4 border">{order.id}</td>
                <td className="py-2 px-4 border">{order.customer}</td>
                <td className="py-2 px-4 border">{order.product}</td>
                <td className="py-2 px-4 border text-center">{order.quantity}</td>
                <td className="py-2 px-4 border">{order.total}</td>
                <td className="py-2 px-4 border">{order.date}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-2 px-4 border space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View
                  </button>
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
