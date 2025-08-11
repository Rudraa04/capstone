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

export default function OrderManagement() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

      // Update list optimistically with server response
      const updated = res.data;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
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
        const qty = (o.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
        return {
          id: o._id,
          customer:
            o.shippingAddress?.name ||
            o.userUid?.slice(0, 6) + "…" ||
            "—",
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
                  <th className="py-3 px-4">Actions</th>
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
                    <td className="py-2 px-4 space-x-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${row.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                      {status !== "Delivered" && status !== "Cancelled" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(row.id, "Delivered")}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Mark Delivered
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(row.id, "Cancelled")}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
