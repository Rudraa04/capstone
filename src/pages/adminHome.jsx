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

// 🔥 Firestore
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
  const [notifications, setNotifications] = useState([]);

  // Low stock
  const [lowStock, setLowStock] = useState({ items: [], count: 0 });
  const [lowLoading, setLowLoading] = useState(true);

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

  /* 🔶 Fetch monthly target from Firestore (shared for all admins) */
  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const ref = doc(db, "adminSettings", "dashboard");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const val = Number(snap.data()?.monthlyTarget || 0);
          if (val > 0) setMonthlyTarget(val);
        }
      } catch (e) {
        console.error("Failed to load monthly target:", e);
      } finally {
        setTargetLoading(false);
      }
    };
    fetchTarget();
  }, []);

  const saveTarget = async () => {
    try {
      setSavingTarget(true);
      const ref = doc(db, "adminSettings", "dashboard");
      await setDoc(
        ref,
        {
          monthlyTarget: Number(monthlyTarget) || 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Failed to save monthly target:", e);
      alert("Failed to save target. Check console for details.");
    } finally {
      setSavingTarget(false);
    }
  };

  /* Fetch orders + low stock and build everything */
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [ordersRes, lowRes] = await Promise.all([
          axios.get("http://localhost:5000/api/reports/all-orders"),
          axios
            .get("http://localhost:5000/api/inventory/low-stock")
            .catch(() => ({ data: { items: [], count: 0 } })), // fallback if route not ready
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const low = lowRes?.data?.items || [];

        // ---- Build quick "recent" (not stored in state; used for notifications only) ----
        const recent = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((o) => {
            const amount =
              o.totalAmount != null
                ? Number(o.totalAmount)
                : (o.items || []).reduce(
                    (s, it) =>
                      s + Number(it.quantity || 0) * Number(it.price || 0),
                    0
                  );
            return {
              id: "#" + String(o._id).slice(-5),
              customer: o.customerName || o.userUid || "Unknown",
              status: o.status || "Pending",
              amount,
              createdAt: o.createdAt,
            };
          });

        // ---- Summary + breakdowns ----
        let totalUnits = 0;
        let totalRevenue = 0;
        const revenueByCat = {};
        const unitsByCat = {};

        orders.forEach((o) => {
          (o.items || []).forEach((it) => {
            const cat = it.productType || "Unknown";
            const qty = Number(it.quantity || 0);
            const rev = qty * Number(it.price || 0);

            totalUnits += qty;
            totalRevenue += rev;
            unitsByCat[cat] = (unitsByCat[cat] || 0) + qty;
            revenueByCat[cat] = (revenueByCat[cat] || 0) + rev;
          });
        });

        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const ordersToday = orders.filter(
          (o) => new Date(o.createdAt) >= startOfToday
        ).length;

        // 🔶 Month-To-Date Revenue (for target progress)
        const mtd = orders.reduce((sum, o) => {
          const d = new Date(o.createdAt);
          if (d >= startOfMonth) {
            const r =
              o.totalAmount != null
                ? Number(o.totalAmount)
                : (o.items || []).reduce(
                    (s, it) =>
                      s + Number(it.quantity || 0) * Number(it.price || 0),
                    0
                  );
            return sum + r;
          }
          return sum;
        }, 0);

        if (!mounted) return;

        setSummary({
          totalProductsSold: totalUnits,
          ordersToday,
          newUsers: 0, // plug Firebase users if/when you want
          revenue: totalRevenue,
        });
        setByCategory({ revenue: revenueByCat, units: unitsByCat });
        setMtdRevenue(mtd);

        // ---- Low stock ----
        setLowStock({ items: low, count: low.length });

        // ---- Notifications ----
        const pendingCount = orders.filter(
          (o) => (o.status || "").toLowerCase() === "pending"
        ).length;
        const cancelledCount = orders.filter(
          (o) => (o.status || "").toLowerCase() === "cancelled"
        ).length;
        const latest = recent[0];

        const notifs = [];
        if (latest) {
          notifs.push({
            type: "new",
            title: "New order placed",
            detail: `${latest.id} by ${latest.customer} — ${INR(
              latest.amount
            )}`,
          });
        }
        if (pendingCount > 0) {
          notifs.push({
            type: "warn",
            title: "Pending orders",
            detail: `${pendingCount} order${
              pendingCount > 1 ? "s" : ""
            } awaiting action`,
          });
        }
        if (cancelledCount > 0) {
          notifs.push({
            type: "warn",
            title: "Cancelled orders",
            detail: `${cancelledCount} order${
              cancelledCount > 1 ? "s" : ""
            } cancelled today`,
          });
        }
        if (low.length > 0) {
          const preview = low
            .slice(0, 3)
            .map((i) => `${i.name} (${i.stock}/${i.reorderLevel})`);
          notifs.push({
            type: "warn",
            title: "Low stock alert",
            detail:
              low.length <= 3
                ? preview.join(", ")
                : `${preview.join(", ")} and ${low.length - 3} more`,
          });
        }
        setNotifications(notifs);
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
    monthlyTarget > 0
      ? Math.min(100, Math.round((mtdRevenue / monthlyTarget) * 100))
      : 0;

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
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4">
                <h3 className="text-sm font-semibold mb-3 text-blue-700">
                  Recent Notifications
                </h3>
                {notifications.length === 0 ? (
                  <div className="text-sm text-gray-500">No notifications.</div>
                ) : (
                  <ul className="text-sm text-gray-800 space-y-2">
                    {notifications.map((n, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className={n.type === "new" ? "text-blue-500" : "text-yellow-500"}>
                          {n.type === "new" ? "🆕" : "⚠️"}
                        </span>
                        <div>
                          <div className="font-medium">{n.title}</div>
                          <div className="text-gray-600">{n.detail}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Hover breakdown: units by category */}
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

          {/* Hover breakdown: revenue by category */}
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
              Period: {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()}
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
                    progress < 50 ? "bg-red-400" : progress < 80 ? "bg-yellow-400" : "bg-green-500"
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
            <h2 className="text-xl font-bold text-blue-700">
              Low Stock Products
            </h2>
            <div className="text-sm text-gray-600">
              Total low-stock items:{" "}
              <span className="font-semibold">{lowStock.count}</span>
            </div>
          </div>

          {lowLoading ? (
            <div className="py-6 text-center text-gray-500">Loading…</div>
          ) : lowStock.items.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              All good! No low-stock items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Product</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Threshold</th>
                    <th className="py-2">Collection</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.items.map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">{p.category}</td>
                      <td className="py-2">{p.stock}</td>
                      <td className="py-2">{p.reorderLevel}</td>
                      <td className="py-2 text-gray-500">{p.collection}</td>
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
