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

// Derive square-feet from size string like "12x24"
const parseSizeSqft = (s = "") => {
  const key = String(s || "").replace(/\s+/g, "");
  const [L, W] = key.split("x").map(Number);
  return L && W ? (L * W) / 144 : 0;
};

// Stone (marble/granite) — used to price by sqft
const isStoneItem = (it = {}) => {
  const tag = String(
    it.productType || it.category || it.kind || it.type || ""
  ).toLowerCase();
  return tag.includes("marble") || tag.includes("granite");
};

const computeLineTotal = (it = {}) => {
  const price = parseFloat(it.price) || 0; // ₹/sqft for tiles & stone, ₹/unit for others
  const qty = parseInt(it.quantity) || 0; // boxes or units

  // Tiles: ₹/sqft × sqft/box × boxes
  if (isTilesItem(it)) {
    const sizeStr = it.specs?.size || it.size || "";
    const { sqftPerBox } = getBoxInfo(sizeStr);
    return price * sqftPerBox * qty;
  }

  // Stone (marble/granite): ₹/sqft × total sqft (prefer saved totalSqft; else derive from size × qty)
  if (isStoneItem(it)) {
    const totalSqft =
      Number(it.specs?.totalSqft) ||
      parseSizeSqft(it.specs?.customSizeLabel || it.specs?.size || it.size) *
        qty;
    return price * (totalSqft || qty);
  }

  // Everything else: unit price × qty
  return price * qty;
};
/* ===== end helpers ===== */

/**
 * Decide per-item whether to use tile/stone sqft math or unit price (greedy to match the order subtotal)
 * Used for the preview list and modal so we match the stored subtotal exactly.
 */
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

  // Precompute unit totals for each item
  const unitTotals = items.map((it) => {
    const price = parseFloat(it?.price) || 0;
    const qty = parseInt(it?.quantity) || 0;
    return price * qty;
  });

  // “Smart” totals: tiles by sqft/box, stone by total sqft, others by unit
  const smartTotals = items.map((it) => {
    const price = parseFloat(it?.price) || 0;
    const qty = parseInt(it?.quantity) || 0;

    if (isTilesItem(it)) {
      const sizeStr = it?.specs?.size || it?.size || "";
      const { sqftPerBox } = getBoxInfo(sizeStr);
      if (sqftPerBox > 25) return price * qty; // slab guard
      return price * sqftPerBox * qty;
    }

    if (isStoneItem(it)) {
      const sqft =
        Number(it?.specs?.totalSqft) ||
        parseSizeSqft(
          it?.specs?.customSizeLabel || it?.specs?.size || it?.size
        ) * qty;
      return price * (sqft || qty);
    }

    return price * qty;
  });

  const unitSum = unitTotals.reduce((a, b) => a + b, 0);
  let need = targetSubtotal - unitSum;

  // Start with unit for all; greedily flip items to “smart” to approach target
  const deltas = smartTotals
    .map((t, i) => ({ i, delta: t - unitTotals[i] }))
    .filter((d) => d.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const useSmart = new Set();
  for (const d of deltas) {
    if (Math.abs(need - d.delta) <= Math.abs(need)) {
      useSmart.add(d.i);
      need -= d.delta;
      if (Math.abs(need) < 1e-6) break; // close enough
    }
  }
  // If we didn’t pick any and there are candidates, pick the single closest
  if (useSmart.size === 0 && deltas.length) {
    let best = deltas.reduce(
      (best, d) =>
        Math.abs(need - d.delta) < Math.abs(need - (best?.delta ?? Infinity))
          ? d
          : best,
      null
    );
    if (best) useSmart.add(best.i);
  }

  // Return a calculator that needs the item's index
  return (_item, idx) =>
    useSmart.has(idx) ? smartTotals[idx] : unitTotals[idx];
};

function money(n) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(v);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

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
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto relative max-h-screen overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="sticky top-3 right-3 float-right text-gray-500 hover:text-gray-700 z-10"
        >
          ✕
        </button>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function OrderHistoryPanel() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const [isModalOpen, setModalOpen] = useState(false);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const calcLineModal = useMemo(
    () => (selectedOrder ? makeLineCalculator(selectedOrder) : null),
    [selectedOrder]
  );

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id || order.id}
              className="border rounded-xl p-4 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">ORDER ID</p>
                  <p className="font-mono text-sm">{order._id || order.id}</p>
                  <p className="text-sm text-gray-500">DATE</p>
                  <p className="text-sm">
                    {new Date(
                      order.createdAt || order?.timeline?.[0]?.at
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">TOTAL</p>
                  <p className="text-lg font-bold text-green-600">
                    {money(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Payment: {order?.payment?.processor || "—"}
                  {order?.payment?.brand ? ` · ${order.payment.brand}` : ""}
                  {order?.payment?.last4
                    ? ` · **** ${order.payment.last4}`
                    : ""}
                </div>
              </div>

              {/* items preview (use greedy calc to match subtotal) */}
              <div className="mt-4 space-y-2">
                {(order.items || []).slice(0, 3).map((it, idx) => {
                  const calcLine = makeLineCalculator(order);
                  return (
                    <div
                      key={`${it.productId || it.name}-${idx}`}
                      className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg border"
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
                      <div className="text-gray-700">
                        {money(calcLine(it, idx))}
                      </div>
                    </div>
                  );
                })}
                {order.items.length > 3 && (
                  <p className="text-xs italic text-gray-500">
                    …and {order.items.length - 3} more
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => openDetails(order)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeDetails}>
        {selectedOrder && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {selectedOrder.status || "Paid"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">ORDER ID</p>
                <p className="font-mono text-xs break-all">
                  {selectedOrder._id || selectedOrder.id}
                </p>
              </div>
              <div>
                <p className="text-gray-500">DATE</p>
                <p>
                  {new Date(
                    selectedOrder.createdAt || selectedOrder?.timeline?.[0]?.at
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">PAYMENT</p>
                <p>
                  {selectedOrder?.payment?.processor || "—"}
                  {selectedOrder?.payment?.brand
                    ? ` · ${selectedOrder.payment.brand}`
                    : ""}
                  {selectedOrder?.payment?.last4
                    ? ` · **** ${selectedOrder.payment.last4}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">TOTAL</p>
                <p className="font-bold text-green-600">
                  {money(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3 text-lg text-gray-900 border-b pb-2">
                Items in This Order
              </h3>
              <div className="space-y-3">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div
                    key={`${it.productId || it.name}-${idx}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image || "https://via.placeholder.com/48"}
                        alt={it.name || it.productType || "Item"}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div>
                        <p className="font-medium">
                          {it.name || it.productType || "Item"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantity: {it.quantity || 0}
                          {it?.specs?.size ? ` · Size: ${it.specs.size}` : ""}
                          {isStoneItem(it) && it?.specs?.totalSqft
                            ? ` · Sqft: ${it.specs.totalSqft}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* fallback to computeLineTotal if calcLineModal not ready */}
                      <div className="font-semibold">
                        {calcLineModal
                          ? money(calcLineModal(it, idx))
                          : money(computeLineTotal(it))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-8">
              <h3 className="font-bold mb-3 text-lg text-gray-900 border-b pb-2 mt-8">
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
