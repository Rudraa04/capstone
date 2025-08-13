import React, { useEffect, useMemo, useState } from "react";
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
} from "react-icons/fi";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { api } from "../api";

/* ========= Pricing helpers (from customer OrderHistoryPanel) =========
   Keep math identical so admin and customer views show the same numbers. */
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
  const price = parseFloat(it.price) || 0; // ₹/sqft for tiles, ₹/unit for others
  const qty = parseInt(it.quantity) || 0;  // boxes or units

  if (isTilesItem(it)) {
    const sizeStr = it.specs?.size || it.size || "";
    const { sqftPerBox } = getBoxInfo(sizeStr);
    return price * sqftPerBox * qty; // ₹/sqft × sqft/box × boxes
  }
  return price * qty;
};

/** Decide per-item whether to use tile math or simple unit price (greedy to match order subtotal) */
const makeLineCalculator = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  const targetSubtotal =
    Number(order?.subtotal ?? 0) ||
    Math.max(
      0,
      Number(order?.totalAmount || 0) -
        Number(order?.taxTotal || 0) -
        Number(order?.shippingFee || 0)
    );

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

    // Treat huge slabs as unit items (same heuristic used in your panel)
    if (sqftPerBox > 25) return price * qty;
    return price * sqftPerBox * qty;
  });

  const unitSum = unitTotals.reduce((a, b) => a + b, 0);
  let need = targetSubtotal - unitSum;

  const deltas = tileTotals
    .map((t, i) => ({ i, delta: t - unitTotals[i] }))
    .filter((d) => d.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  const useTile = new Set();
  for (const d of deltas) {
    if (Math.abs(need - d.delta) <= Math.abs(need)) {
      useTile.add(d.i);
      need -= d.delta;
      if (Math.abs(need) < 1e-6) break;
    }
  }
  if (useTile.size === 0 && deltas.length) {
    let best = deltas.reduce(
      (best, d) =>
        Math.abs(need - d.delta) <
        Math.abs(need - (best?.delta ?? Infinity))
          ? d
          : best,
      null
    );
    if (best) useTile.add(best.i);
  }
  return (_item, idx) => (useTile.has(idx) ? tileTotals[idx] : unitTotals[idx]);
};
/* ========= end pricing helpers ========= */

/* ========= Simple modal (same pattern as your customer panel) ========= */
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
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative"
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
/* ========= end modal ========= */

export default function OrderManagement() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const money = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Load ALL orders (admin endpoint)
  useEffect(() => {
    let unsub = () => {};
    setLoading(true);

    unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        setErr("Please log in as an admin.");
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await api.get("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(res.data) ? res.data : []);
        setErr("");
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.error || e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub && unsub();
  }, []);

  // open/close modal
  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // also update the selected order after status change
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Please log in.");

      const token = await user.getIdToken();
      const res = await api.patch(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Failed to update status");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const rows = useMemo(
    () =>
      orders.map((o) => {
        const created = o.createdAt ? new Date(o.createdAt) : null;
        const firstItem = o.items?.[0];
        const productLabel =
          firstItem?.name ||
          firstItem?.productType ||
          (o.items?.length ? "Items" : "—");
        const qty = (o.items || []).reduce(
          (s, it) => s + Number(it.quantity || 0),
          0
        );
        return {
          id: o._id,
          customer:
            o.shippingAddress?.name || o.userUid?.slice(0, 6) + "…" || "—",
          product:
            (o.items?.length || 0) > 1
              ? `${productLabel} +${o.items.length - 1} more`
              : productLabel,
          quantity: qty,
          total: money(o.totalAmount),
          date: created ? created.toLocaleDateString() : "—",
          status: o.status || "Paid",
        };
      }),
    [orders]
  );

  const calcLineModal = useMemo(
    () => (selectedOrder ? makeLineCalculator(selectedOrder) : null),
    [selectedOrder]
  );

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
          <button
            onClick={() => navigate("/admin/slabs")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiBox /> Slabs Inventory
          </button>
          <button
            onClick={() => navigate("/admin/ceramics")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiPackage /> Ceramics Inventory
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full flex items-center gap-3 px-4 py-2 bg-gray-200 rounded-md font-semibold"
          >
            <FiSettings /> Orders
          </button>
          <button
            onClick={() => navigate("/admin/support")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiHeadphones /> Customer Support
          </button>
          <button
            onClick={() => navigate("/admin/reports")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiTrendingUp /> Sales & Reports
          </button>

          <button
            onClick={() => navigate("/", { state: { fromAdmin: true } })}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"
          >
            <FiGlobe /> Customer Homepage
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("isAdminLoggedIn");
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-800">Order Management</h1>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading orders…</div>
          ) : err ? (
            <div className="p-6 text-sm text-red-600">{err}</div>
          ) : (
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="text-center w-[300px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const serverOrder = orders.find((o) => o._id === row.id);
                  const status = row.status;
                  return (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 px-4">{row.id}</td>
                      <td className="py-2 px-4">{row.customer}</td>
                      <td className="py-2 px-4">{row.product}</td>
                      <td className="py-2 px-4 text-center">{row.quantity}</td>
                      <td className="py-2 px-4">{row.total}</td>
                      <td className="py-2 px-4">{row.date}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center w-[300px]">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openModal(serverOrder)} // ⬅️ open modal instead of navigate
                            className="w-20 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                          {status !== "Delivered" && status !== "Cancelled" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(row.id, "Delivered")
                                }
                                className="w-30 whitespace-nowrap px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Mark Delivered
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(row.id, "Cancelled")
                                }
                                className="w-20 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ===== Modal content ===== */}
      <Modal isOpen={showModal} onClose={closeModal}>
        {!selectedOrder ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-6">
            {/* Header: ID, date, status, total */}
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase">Order ID</div>
                <div className="font-semibold">{selectedOrder._id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Date</div>
                <div className="font-medium">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status || "Paid"}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Total</div>
                <div className="text-lg font-bold text-green-700">
                  {money(selectedOrder.totalAmount)}
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Items in this order</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 border rounded-lg p-3 bg-gray-50"
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
                        {(it.specs?.size || it.size) && (
                          <span>
                            Size: {it.specs?.size || it.size}
                            {it.specs?.totalSqft ? ` (${it.specs.totalSqft} sqft)` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-bold text-gray-800">
                      {money(
                        (calcLineModal ? calcLineModal(it, idx) : computeLineTotal(it)) || 0
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm">
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

            {/* Actions inside modal */}
            {selectedOrder.status !== "Delivered" &&
              selectedOrder.status !== "Cancelled" && (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder._id, "Delivered")}
                    className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Mark Delivered
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder._id, "Cancelled")}
                    className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
}
