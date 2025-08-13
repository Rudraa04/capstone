// src/pages/AdminHome.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiLogOut,
  FiHome,
  FiBell,
  FiGlobe,
} from "react-icons/fi";

// Firestore
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

/* ---------- Small helper: hover popover card with breakdown ---------- */
function HoverBreakdownCard({ title, value, breakdown, formatter }) {
  const [open, setOpen] = React.useState(false);
  const entries = Object.entries(breakdown || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="relative bg-white p-5 rounded-xl shadow-md"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-blue-700">
        {formatter ? formatter(value) : value}
      </p>

      {open && entries.length > 0 && (
        <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <div className="text-xs font-semibold text-gray-500 mb-2">
            By category
          </div>
          <ul className="space-y-1 max-h-64 overflow-auto text-sm">
            {entries.map(([cat, amt]) => (
              <li key={cat} className="flex items-center justify-between">
                <span className="text-gray-700">{cat}</span>
                <span className="font-semibold">
                  {formatter ? formatter(amt) : amt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Utilities for the bell dropdown ---------- */
function formatRelative(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  const diff = (Date.now() - d.getTime()) / 1000; // seconds
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleString();
}

function summarizeLowStock(items, maxPerCat = 4) {
  if (!items?.length) return { total: 0, lines: [] };
  const byCat = items.reduce((m, it) => {
    (m[it.category || "Other"] ||= []).push(it);
    return m;
  }, {});
  const lines = Object.entries(byCat).map(([cat, list]) => {
    const top = list
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, maxPerCat)
      .map(
        (it) =>
          `${it.name} — ${it.stock ?? 0} left (min ${it.reorderLevel ?? "-"})`
      );
    const extra =
      list.length > maxPerCat ? `+${list.length - maxPerCat} more` : null;
    return { cat, items: top, extra };
  });
  return { total: items.length, lines };
}

/* ---------- Sqft-aware pricing helpers (shared logic) ---------- */
const tagOf = (it = {}) =>
  String(it.productType || it.category || it.kind || it.type || "").toLowerCase();

const isSqftPriced = (it = {}) => {
  const tag = tagOf(it);
  return tag.includes("tile") || tag.includes("granite") || tag.includes("marble");
};

const parseSqftFromSize = (sizeStr = "") => {
  const s = String(sizeStr || "").toLowerCase();
  const m = s.match(/([\d.]+)\s*[x×]\s*([\d.]+)/i);
  if (!m) return 0;
  const L = parseFloat(m[1]);
  const W = parseFloat(m[2]);
  if (!Number.isFinite(L) || !Number.isFinite(W)) return 0;
  return (L * W) / 144; // inches -> sqft
};

const BOX_CONFIG = {
  "48x24": { tilesPerBox: 2, sqftPerBox: 16 },
  "24x24": { tilesPerBox: 4, sqftPerBox: 16 },
  "12x18": { tilesPerBox: 6, sqftPerBox: 9 },
  "12x12": { tilesPerBox: 8, sqftPerBox: 8 },
};

const sqftPerUnit = (it = {}) => {
  const snap = Number(it?.sqftPerUnit ?? it?.specs?.sqftPerUnit);
  if (Number.isFinite(snap) && snap > 0) return snap;

  const specSqft =
    Number(it?.specs?.sqftPerBox) || Number(it?.specs?.totalSqft) || 0;
  if (Number.isFinite(specSqft) && specSqft > 0) return specSqft;

  const sizeStr = it?.specs?.size || it?.size || "";
  const key = String(sizeStr || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/in\b|inch(es)?\b/g, "");
  if (BOX_CONFIG[key]) return BOX_CONFIG[key].sqftPerBox;

  return parseSqftFromSize(sizeStr);
};

const unitPriceOf = (it = {}) =>
  Number(
    it?.unitPrice ?? it?.specs?.unitPrice ?? it?.price ?? it?.specs?.price
  ) || 0;

const quantityOf = (it = {}) =>
  Number(it?.quantity ?? it?.qty ?? it?.units ?? it?.specs?.quantity) || 0;

// Exact charged amount for one line item
const lineRevenueOf = (it = {}) => {
  const lt = Number(it?.lineTotal ?? it?.specs?.lineTotal);
  if (Number.isFinite(lt) && lt > 0) return lt;

  const unit = unitPriceOf(it);
  const qty = quantityOf(it);
  if (isSqftPriced(it)) {
    const s = sqftPerUnit(it);
    if (s > 0) return unit * s * qty; // ₹/sqft × sqft × boxes
  }
  return unit * qty;
};

// Order subtotal (pre-tax/ship) with safe fallbacks
const orderSubtotal = (o = {}) => {
  const sub = Number(o?.subtotal);
  if (Number.isFinite(sub) && sub >= 0) return sub;

  const items = Array.isArray(o?.items) ? o.items : [];
  const sumLines = items.reduce((s, it) => s + lineRevenueOf(it), 0);
  if (sumLines > 0) return sumLines;

  const total = Number(o?.totalAmount) || 0;
  const tax = Number(o?.taxTotal) || 0;
  const ship = Number(o?.shippingFee) || 0;
  const guess = total - tax - ship;
  return Number.isFinite(guess) && guess > 0 ? guess : total;
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // dashboard state
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalProductsSold: 0,
    ordersToday: 0,
    newUsers: 0,
    revenue: 0,
  });
  const [byCategory, setByCategory] = useState({ revenue: {}, units: {} });

  // Low stock
  const [lowStock, setLowStock] = useState({ items: [], count: 0 });
  const [lowLoading, setLowLoading] = useState(true);

  // Orders slice for notifications
  const [latestOrder, setLatestOrder] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  // 🔶 Monthly Target (shared in Firestore)
  const [monthlyTarget, setMonthlyTarget] = useState(100000); // default if none set
  const [targetLoading, setTargetLoading] = useState(true);
  const [savingTarget, setSavingTarget] = useState(false);
  const [mtdRevenue, setMtdRevenue] = useState(0);

  const INR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  /* Close the bell dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🔶 Live monthly target from Firestore (shared for all admins) */
  useEffect(() => {
    const ref = doc(db, "adminSettings", "dashboard");
    // ensure doc exists so subscription has something to read
    getDoc(ref).then((snap) => {
      if (!snap.exists()) {
        setDoc(
          ref,
          { monthlyTarget: 100000, updatedAt: serverTimestamp() },
          { merge: true }
        ).catch(() => {});
      }
    });

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const val = Number(snap.data()?.monthlyTarget ?? 0);
        if (Number.isFinite(val) && val >= 0) setMonthlyTarget(val || 0);
        setTargetLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to monthly target:", err);
        setTargetLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const saveTarget = async () => {
    const n = Number(monthlyTarget);
    if (!Number.isFinite(n) || n < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }
    try {
      setSavingTarget(true);
      const ref = doc(db, "adminSettings", "dashboard");
      await setDoc(
        ref,
        { monthlyTarget: n, updatedAt: serverTimestamp() },
        { merge: true }
      );
      // onSnapshot above will reflect the saved value automatically
    } catch (e) {
      console.error("Failed to save monthly target:", e);
      alert(
        e?.code === "permission-denied"
          ? "Permission denied: check your Firestore Security Rules or sign-in."
          : "Failed to save target. Check console for details."
      );
    } finally {
      setSavingTarget(false);
    }
  };

  /* NEW: live “new users today” counter */
  useEffect(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTs = Timestamp.fromDate(startOfToday);

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("createdAt", ">=", startTs));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setSummary((prev) => ({ ...prev, newUsers: snap.size }));
      },
      (err) => {
        console.error("New users listener failed:", err);
        setSummary((prev) => ({ ...prev, newUsers: 0 }));
      }
    );
    return () => unsub();
  }, []);

  // Canonicalize product category labels
  const canonCategory = (raw) => {
    const s = String(raw || "").trim().toLowerCase();
    if (!s) return "Unknown";
    if (s.startsWith("tile")) return "Tiles"; // unify Tile/Tiles
    if (s.includes("granite")) return "Granite";
    if (s.includes("marble")) return "Marble";
    if (s.includes("bathtub")) return "Bathtub";
    if (s.includes("sink")) return "Sink";
    if (s.includes("toilet")) return "Toilet";
    if (s === "slab" || s === "slabs") return "Slabs";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /* Fetch orders + low stock and build everything else */
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [ordersRes, lowRes] = await Promise.all([
          axios.get("http://localhost:5000/api/reports/all-orders"),
          axios
            .get("http://localhost:5000/api/inventory/low-stock")
            .catch(() => ({ data: { items: [], count: 0 } })), // fallback
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const low = lowRes?.data?.items || [];

        // ---- Build "recent" for notifications ----
        const recent = [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const head = recent[0];
        const latest =
          head && {
            id: "#" + String(head._id).slice(-5),
            customer: head.customerName || head.userUid || "Unknown",
            // show what was actually charged if present; else fall back to computed subtotal
            amount: Number(head.totalAmount ?? orderSubtotal(head)),
            createdAt: head.createdAt,
          };

        const pCount = orders.filter(
          (o) => (o.status || "").toLowerCase() === "pending"
        ).length;
        const cCount = orders.filter(
          (o) => (o.status || "").toLowerCase() === "cancelled"
        ).length;

        // ---- Summary + breakdowns (sqft-aware) ----
        let totalUnits = 0;
        let totalRevenue = 0;
        const revenueByCat = {};
        const unitsByCat = {};

        orders.forEach((o) => {
          (o.items || []).forEach((it) => {
            const catRaw =
              it.productType ??
              it.category ??
              it.Category ??
              it.collection ??
              it.type ??
              it.kind ??
              "Unknown";
            const cat = canonCategory(catRaw);

            const qty = quantityOf(it);
            const rev = lineRevenueOf(it);

            totalUnits += qty;
            totalRevenue += rev;
            unitsByCat[cat] = (unitsByCat[cat] || 0) + qty;
            revenueByCat[cat] = (revenueByCat[cat] || 0) + rev;
          });
        });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const ordersToday = orders.filter((o) => new Date(o.createdAt) >= startOfToday).length;

        // 🔶 Month-To-Date Revenue (sum of order subtotals)
        const mtd = orders.reduce((sum, o) => {
          const d = new Date(o.createdAt);
          if (d >= startOfMonth) return sum + orderSubtotal(o);
          return sum;
        }, 0);

        if (!mounted) return;

        setSummary((prev) => ({
          ...prev,
          totalProductsSold: totalUnits,
          ordersToday,
          revenue: totalRevenue,
        }));
        setByCategory({ revenue: revenueByCat, units: unitsByCat });
        setMtdRevenue(mtd);

        // ---- Low stock ----
        setLowStock({ items: low, count: low.length });

        // ---- Notif bits ----
        setLatestOrder(latest);
        setPendingCount(pCount);
        setCancelledCount(cCount);
      } catch (e) {
        console.error("Dashboard fetch failed:", e);
      } finally {
        if (mounted) {
          setLoading(false);
          setLowLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  // Progress calc
  const progress =
    monthlyTarget > 0 ? Math.min(100, Math.round((mtdRevenue / monthlyTarget) * 100)) : 0;

  // Build professional dropdown content
  const lowSummary = summarizeLowStock(lowStock.items, 3);

  // 🔔 badge count (number of sections with content)
  const notifCount =
    (latestOrder ? 1 : 0) +
    (pendingCount > 0 ? 1 : 0) +
    (cancelledCount > 0 ? 1 : 0) +
    (lowSummary.total > 0 ? 1 : 0);

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FiHome /> Admin Panel
          </h2>
        </div>
        <nav className="space-y-4 text-sm">
          <button
            onClick={() => navigate("/admin/slabs")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiBox /> Slabs Inventory
          </button>
          <button
            onClick={() => navigate("/admin/ceramics")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
          >
            <FiPackage /> Ceramics Inventory
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md"
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
            onClick={() => {
              localStorage.setItem("fromAdmin", "true");
              navigate("/", { state: { fromAdmin: true } });
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"
          >
            <FiGlobe /> Customer Homepage
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-100 rounded-md"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-between items-center mb-8 relative">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Welcome, Admin</h1>
            <p className="text-gray-500 text-sm">Here's what's happening today.</p>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative"
              aria-label="Notifications"
            >
              <FiBell size={24} className="text-blue-700 cursor-pointer" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                  {notifCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-[28rem] bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4">
                <h3 className="text-sm font-semibold mb-3 text-blue-700">Notifications</h3>

                {/* New Order */}
                {latestOrder && (
                  <div className="border rounded-lg p-3 mb-3">
                    <div className="text-xs uppercase text-gray-500 mb-1">New order</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{latestOrder.id}</div>
                        <div className="text-gray-600 text-sm">
                          {latestOrder.customer} • {INR(latestOrder.amount)}
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatRelative(latestOrder.createdAt)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status chips */}
                {pendingCount + cancelledCount > 0 && (
                  <div className="mb-3 flex gap-2 flex-wrap">
                    {pendingCount ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
                        {pendingCount} pending
                      </span>
                    ) : null}
                    {cancelledCount ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                        {cancelledCount} cancelled
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Low stock summary */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase text-gray-500">
                      Low stock {lowSummary.total ? `• ${lowSummary.total} items` : ""}
                    </div>
                    {lowSummary.total ? (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/admin/ceramics");
                        }}
                      >
                        Open inventory
                      </button>
                    ) : null}
                  </div>

                  {lowSummary.total === 0 ? (
                    <div className="text-sm text-gray-500">All good.</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-auto pr-1">
                      {lowSummary.lines.map(({ cat, items, extra }) => (
                        <div key={cat}>
                          <div className="text-xs font-semibold text-gray-600 mb-1">{cat}</div>
                          <ul className="text-sm text-gray-8 00 list-disc ml-5 space-y-0.5">
                            {items.map((ln, i) => (
                              <li key={i}>{ln}</li>
                            ))}
                          </ul>
                          {extra && (
                            <div className="text-xs text-gray-500 mt-1">{extra}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <HoverBreakdownCard
            title="Total Products Sold"
            value={summary.totalProductsSold}
            breakdown={byCategory.units}
          />

          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-sm text-gray-500">Orders Today</h3>
            <p className="text-2xl font-bold text-blue-700">{summary.ordersToday}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="text-sm text-gray-500">New Users</h3>
            <p className="text-2xl font-bold text-blue-700">{summary.newUsers}</p>
          </div>

          <HoverBreakdownCard
            title="Revenue"
            value={summary.revenue}
            breakdown={byCategory.revenue}
            formatter={INR}
          />
        </div>

        {/* 🔷 Monthly Target Progress */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-700">Monthly Target</h2>
            <div className="text-sm text-gray-600">
              Period: {new Date().toLocaleString("default", { month: "long" })}{" "}
              {new Date().getFullYear()}
            </div>
          </div>

          {targetLoading ? (
            <div className="py-4 text-gray-500 text-sm">Loading target…</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">MTD Revenue</div>
                  <div className="text-lg font-semibold">{INR(mtdRevenue)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">Target</div>
                  <div className="text-lg font-semibold">{INR(monthlyTarget)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">Progress</div>
                  <div className="text-lg font-semibold">{progress}%</div>
                </div>
              </div>

              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full ${
                    progress < 50
                      ? "bg-red-400"
                      : progress < 80
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="px-3 py-2 border rounded-md w-48"
                  placeholder="Set monthly target (INR)"
                />
                <button
                  onClick={saveTarget}
                  disabled={savingTarget}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingTarget ? "Saving…" : "Save Target"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Low Stock Panel */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-700">Low Stock Products</h2>
            <div className="text-sm text-gray-600">
              Total low-stock items: <span className="font-semibold">{lowStock.count}</span>
            </div>
          </div>

          {lowLoading ? (
            <div className="py-6 text-center text-gray-500">Loading…</div>
          ) : lowStock.items.length === 0 ? (
            <div className="py-6 text-center text-gray-500">All good! No low-stock items.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Product</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Stock left</th>
                    <th className="py-2">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.items.map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">{p.category}</td>
                      <td className="py-2">{p.stock}</td>
                      <td className="py-2">{p.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
