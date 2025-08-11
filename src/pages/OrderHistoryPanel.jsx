import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { api } from "../api";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") onClose();
  };

  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
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

export default function OrderHistoryPanel() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Format money in INR with ₹ symbol
  const money = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setOrders([]);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await api.get("/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError(e.message || "Failed to load orders");
        setOrders([]);
      }
    });
    return () => unsub();
  }, []);

  const statusBadge = (s) => {
    const base = "inline-block text-xs font-semibold px-2 py-1 rounded-full";
    if (s === "Delivered") return `${base} bg-green-100 text-green-700`;
    if (s === "Shipped") return `${base} bg-yellow-100 text-yellow-700`;
    if (s === "Cancelled") return `${base} bg-red-100 text-red-700`;
    return `${base} bg-blue-100 text-blue-700`; // Paid/Processing
  };

  const Row = ({ order }) => {
    const created = order.createdAt ? new Date(order.createdAt) : null;
    const isOpen = expandedId === order._id;

    return (
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:shadow-md hover:border-blue-300 transition-all duration-200">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-gray-700">
            <div>
              <span className="font-semibold">Order ID:</span> {order._id}
            </div>
            <div className="text-gray-500">
              Date: {created ? created.toLocaleDateString() : "—"}
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            {/* Price + Status */}
            <div className="text-left">
              <div className="text-sm font-semibold">
                {money(order.totalAmount)}
              </div>
              <div className="mt-1">
                <span className={statusBadge(order.status)}>
                  {order.status || "Paid"}
                </span>
              </div>
            </div>

            {/* View Details Button on Right */}
            <button
              onClick={() => openOrderModal(order)}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold px-3 py-1 border border-blue-200 rounded-md bg-white hover:bg-blue-50"
            >
              {isOpen ? "Hide details" : "View details"}
            </button>
          </div>
        </div>

        {/* Quick preview of items */}
        {Array.isArray(order.items) && order.items.length > 0 && !isOpen && (
          <div className="mt-3 space-y-2">
            {order.items.slice(0, 3).map((it, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={it.image || "https://via.placeholder.com/40"}
                    alt={it.name || it.productType || "Item"}
                    className="w-8 h-8 object-cover rounded border"
                  />
                  <span className="font-medium text-gray-800">
                    {it.name || it.productType || "Item"}
                  </span>
                </div>
                <div className="text-gray-600">
                  {it.quantity} × {money(it.price)}
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs italic text-gray-500">
                …and {order.items.length - 3} more
              </p>
            )}
          </div>
        )}

        {/* Expanded details */}
        <div
          className={`grid transition-all duration-300 ${
            isOpen
              ? "grid-rows-[1fr] opacity-100 mt-4"
              : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="bg-white rounded-xl border p-4 space-y-6">
              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
                <div className="space-y-3">
                  {order.items?.map((it, idx) => {
                    const lineTotal =
                      Number(it.price || 0) * Number(it.quantity || 1) ||
                      it.lineTotal;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 border rounded-lg p-2 bg-gray-50"
                      >
                        <img
                          src={it.image || "https://via.placeholder.com/60"}
                          alt={it.name || "Item"}
                          className="w-14 h-14 rounded object-cover border"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">
                            {it.name || it.productType || "Item"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {it.sku && <span>SKU: {it.sku} · </span>}
                            {it.specs?.size && (
                              <span>Size: {it.specs.size} · </span>
                            )}
                            {it.specs?.color && (
                              <span>Color: {it.specs.color} · </span>
                            )}
                            {it.specs?.finish && (
                              <span>Finish: {it.specs.finish}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div>
                            Qty:{" "}
                            <span className="font-medium">{it.quantity}</span>
                          </div>
                          <div>
                            Unit:{" "}
                            <span className="font-medium">
                              {money(it.price)}
                            </span>
                          </div>
                          <div className="font-semibold">
                            {money(lineTotal)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    Price Summary
                  </h5>
                  <div className="text-sm flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(order.subtotal ?? order.totalAmount)}</span>
                  </div>
                  {order.discountTotal != null && (
                    <div className="text-sm flex justify-between">
                      <span>Discounts</span>
                      <span>-{money(order.discountTotal)}</span>
                    </div>
                  )}
                  {order.taxTotal != null && (
                    <div className="text-sm flex justify-between">
                      <span>Tax</span>
                      <span>{money(order.taxTotal)}</span>
                    </div>
                  )}
                  {order.shippingFee != null && order.shippingFee !== 0 && (
                    <div className="text-sm flex justify-between">
                      <span>Shipping</span>
                      <span>{money(order.shippingFee)}</span>
                    </div>
                  )}
                  <div className="mt-1 border-t pt-2 font-semibold flex justify-between">
                    <span>Total</span>
                    <span>{money(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    Shipping & Payment
                  </h5>
                  {order.shippingAddress ? (
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">
                        {order.shippingAddress.name}
                      </div>
                      <div>{order.shippingAddress.street}</div>
                      <div>
                        {order.shippingAddress.city}
                        {order.shippingAddress.state
                          ? `, ${order.shippingAddress.state}`
                          : ""}{" "}
                        {order.shippingAddress.postalCode}
                      </div>
                      <div>{order.shippingAddress.country}</div>
                      {order.shippingAddress.phone && (
                        <div>📞 {order.shippingAddress.phone}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No address on file.
                    </div>
                  )}

                  <div className="mt-3 text-sm">
                    <div>
                      Payment:{" "}
                      <span className="font-medium">
                        {order.payment?.processor || "—"}
                      </span>
                    </div>
                    {order.payment?.receiptUrl && (
                      <a
                        href={order.payment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View receipt
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {/* Quick preview of items */}
              {Array.isArray(order.items) &&
                order.items.length > 0 &&
                !isOpen && (
                  <div className="mt-3 space-y-2">
                    {order.items.slice(0, 3).map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={it.image || "https://via.placeholder.com/40"}
                            alt={it.name || it.productType || "Item"}
                            className="w-8 h-8 object-cover rounded border"
                          />
                          <span className="font-medium text-gray-800">
                            {it.name || it.productType || "Item"}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {it.quantity} × {money(it.price)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs italic text-gray-500">
                        …and {order.items.length - 3} more
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-800">Order History</h2>

      {orders === null && <p className="text-sm text-gray-500">Loading…</p>}
      {!!error && <p className="text-sm text-red-600">{error}</p>}
      {orders && orders.length === 0 && !error && (
        <p className="text-sm text-gray-500">No orders yet.</p>
      )}

      <div className="space-y-4">
        {orders?.map((order) => (
          <Row key={order._id} order={order} />
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {selectedOrder && (
          <div className="space-y-8">
            {/* Header */}
            <div className="border-b pb-4 flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-blue-900 tracking-wide">
                Order Details
              </h2>
              <span
                className={`text-xs uppercase tracking-wide ${statusBadge(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>
            </div>

            {/* Order Info */}
            <div className="grid sm:grid-cols-2 gap-6 text-sm text-gray-800 bg-gray-50 p-5 rounded-xl border">
              <div>
                <p className="text-gray-500 text-xs uppercase">Order ID</p>
                <p className="font-medium">{selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Date</p>
                <p className="font-medium">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">
                  Payment Method
                </p>
                <p className="font-medium">
                  {selectedOrder.payment?.processor || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Total Amount</p>
                <p className="font-bold text-green-700 text-lg">
                  ₹{selectedOrder.totalAmount}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-bold mb-4 text-lg text-gray-900 border-b pb-2">
                Items in This Order
              </h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-5 border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={it.image || "https://via.placeholder.com/60"}
                      alt={it.name}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {it.name || it.productType}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Quantity:{" "}
                        <span className="font-medium">{it.quantity}</span> × ₹
                        {it.price}
                      </p>
                    </div>
                    <div className="text-right font-bold text-gray-800">
                      ₹{(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-bold mb-3 text-lg text-gray-900 border-b pb-2">
                Shipping Address
              </h3>
              <div className="bg-gray-50 p-5 rounded-xl border text-sm leading-relaxed">
                {selectedOrder.shippingAddress ? (
                  <>
                    <p className="font-semibold text-gray-800">
                      {selectedOrder.shippingAddress.name}
                    </p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state} -{" "}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && (
                      <p className="mt-2">
                        📞 {selectedOrder.shippingAddress.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No address on file.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
