import React, { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { api } from "../api";

/* ===== pricing helpers (UI untouched) ===== */

// Only treat real “Tiles” as tiles based on product type/category/kind
const isTilesItem = (it = {}) => {
  const tag = String(
    it.productType || it.category || it.kind || it.type || ""
  ).toLowerCase();
  return tag.includes("tile");
};

const BOX_CONFIG = {
  "48x24": { tilesPerBox: 2, sqftPerBox: 16 },
  "24x24": { tilesPerBox: 4, sqftPerBox: 16 },
  "12x18": { tilesPerBox: 6, sqftPerBox: 9 },
  "12x12": { tilesPerBox: 8, sqftPerBox: 8 },
};

const getBoxInfo = (sizeStr = "") => {
  const key = String(sizeStr || "").replace(/\s+/g, "");
  if (BOX_CONFIG[key]) return BOX_CONFIG[key];
  const [L, W] = key.split("x").map(Number);
  const sqftPerTile = L && W ? (L * W) / 144 : 0;
  return { tilesPerBox: 1, sqftPerBox: sqftPerTile };
};

const computeLineTotal = (it = {}) => {
  const price = parseFloat(it.price) || 0;     // ₹/sqft for tiles, ₹/unit for others
  const qty = parseInt(it.quantity) || 0;      // boxes or units

  if (isTilesItem(it)) {
    const sizeStr = it.specs?.size || it.size || "";
    const { sqftPerBox } = getBoxInfo(sizeStr);
    return price * sqftPerBox * qty;           // ₹/sqft × sqft/box × boxes
  }
  return price * qty;                          // non-tiles: price × qty
};
/* ===== end helpers ===== */
/** Decide per-order whether to use tile math or simple unit price */
/** Decide per-item whether to use tile math or simple unit price (greedy to match the order subtotal) */
const makeLineCalculator = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  // Target subtotal (prefer backend's subtotal; else total - tax - shipping)
  const targetSubtotal =
    Number(order?.subtotal ?? 0) ||
    Math.max(
      0,
      Number(order?.totalAmount || 0) -
      Number(order?.taxTotal || 0) -
      Number(order?.shippingFee || 0)
    );

  // Precompute unit and tile totals for each item
  const unitTotals = items.map((it) => {
    const price = parseFloat(it?.price) || 0;
    const qty = parseInt(it?.quantity) || 0;
    return price * qty;
  });

  const tileTotals = items.map((it) => {
    const price = parseFloat(it?.price) || 0;
    const qty = parseInt(it?.quantity) || 0;

    if (!isTilesItem(it)) return price * qty;

    const sizeStr = it?.specs?.size || it?.size || "";
    const { sqftPerBox } = getBoxInfo(sizeStr);

    // Heuristic: if the size is a huge slab (e.g., >25 sqft), treat it as non-tile
    if (sqftPerBox > 25) return price * qty;

    return price * sqftPerBox * qty;
  });

  const unitSum = unitTotals.reduce((a, b) => a + b, 0);
  let need = targetSubtotal - unitSum;

  // Start with unit for all; greedily flip items to tile to approach target
  const deltas = tileTotals
    .map((t, i) => ({ i, delta: t - unitTotals[i] }))
    .filter((d) => d.delta > 0) // only items that increase towards the target
    .sort((a, b) => b.delta - a.delta); // try bigger adjustments first

  const useTile = new Set();
  for (const d of deltas) {
    if (Math.abs(need - d.delta) <= Math.abs(need)) {
      useTile.add(d.i);
      need -= d.delta;
      if (Math.abs(need) < 1e-6) break; // close enough
    }
  }
  // If we didn’t pick any and there are candidates, pick the single closest
  if (useTile.size === 0 && deltas.length) {
    let best = deltas.reduce(
      (best, d) =>
        Math.abs(need - d.delta) < Math.abs(need - (best?.delta ?? Infinity))
          ? d
          : best,
      null
    );
    if (best) useTile.add(best.i);
  }

  // Return a calculator that needs the item's index
  return (_item, idx) => (useTile.has(idx) ? tileTotals[idx] : unitTotals[idx]);
};



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

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // INR formatter
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
    const calcLine = makeLineCalculator(order);

    return (
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:shadow-md hover:border-blue-300 transition-all duration-200">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-gray-700">
            <div><span className="font-semibold">Order ID:</span> {order._id}</div>
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

            {/* View Details */}
            <button
              onClick={() => openOrderModal(order)}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold px-3 py-1 border border-blue-200 rounded-md bg-white hover:bg-blue-50"
            >
              {isOpen ? "Hide details" : "View details"}
            </button>
          </div>
        </div>

        {/* Quick preview of first 3 items */}
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
                {/* show LINE TOTAL instead of qty × unit */}
                <div className="text-gray-600">
                  {money(calcLine(it, i))}
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
          className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="bg-white rounded-xl border p-4 space-y-6">
              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
                <div className="space-y-3">
                  {order.items?.map((it, idx) => {
                    const lineTotal = calcLine(it, idx);
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
                            {(it.specs?.customSizeLabel || it.specs?.size || it.size) && (
                              <span>
                                Size: {it.specs?.customSizeLabel || it.specs?.size || it.size}
                                {it.specs?.totalSqft ? ` (${it.specs.totalSqft} sqft)` : ""}
                                {" · "}
                              </span>
                            )}

                            {it.specs?.color && <span>Color: {it.specs.color} · </span>}
                            {it.specs?.finish && <span>Finish: {it.specs.finish}</span>}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div>
                            Qty: <span className="font-medium">{it.quantity}</span>
                          </div>
                          {/* keep “Unit” line if you like; it’s still the unit price,
                              but the bold value below is the LINE TOTAL */}
                          <div>
                            Unit: <span className="font-medium">₹{Number(it.price || 0).toFixed(2)}</span>
                          </div>
                          <div className="font-semibold">{money(lineTotal)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <h5 className="font-semibold text-gray-800 mb-2">Price Summary</h5>
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
              </div>

              {/* (There was a duplicate quick preview block here; keep it consistent) */}
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
                        {money(calcLine(it, i))}
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

  const calcLineModal = useMemo(
    () => (selectedOrder ? makeLineCalculator(selectedOrder) : null),
    [selectedOrder]
  );


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
                <p className="text-gray-500 text-xs uppercase">Payment Method</p>
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

            {/* Items list in modal */}
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
                        Quantity: <span className="font-medium">{it.quantity}</span>
                        {(it.specs?.size || it.size) &&
                          ` • Size: ${it.specs?.size || it.size}`}
                      </p>
                    </div>
                    <div className="text-right font-bold text-gray-800">
                      {calcLineModal ? money(calcLineModal(it, idx)) : money(computeLineTotal(it))}
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
                      <p className="mt-2">📞 {selectedOrder.shippingAddress.phone}</p>
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
