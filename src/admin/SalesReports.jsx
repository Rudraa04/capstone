import React, { useState, useEffect, useMemo } from "react";
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
  FiUpload,
  FiDownload,
  FiGlobe,
} from "react-icons/fi";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function SalesReports() {
  const navigate = useNavigate();

  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // sorting
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });

  // filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState("");     // yyyy-mm-dd

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15); // 15 by default, can be "all"

  // bottom chart: monthly range
  const [monthsBack, setMonthsBack] = useState(6);

  // top-3 range
  const [topRange, setTopRange] = useState("month"); // "month" | "all"

  // revenue-over-time scale
  const [revScale, setRevScale] = useState("biweekly"); // "daily" | "biweekly" | "monthly"

  const CATEGORIES = ["Tiles", "Sinks", "Toilets", "Bathtubs", "Granite", "Marble"];

  const INR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  // fetch
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/all-orders")
      .then((res) => {
        const transformed = [];
        (res.data || []).forEach((order) => {
          (order.items || []).forEach((item) => {
            transformed.push({
              product: item.name || "Unknown",
              category: item.productType || "Unknown",
              unitsSold: Number(item.quantity || 0),
              revenue: Number(item.price || 0) * Number(item.quantity || 0),
              date: new Date(order.createdAt).toISOString().split("T")[0], // yyyy-mm-dd
            });
          });
        });
        setSalesData(transformed);
      })
      .catch((err) => console.error("Failed to fetch order data:", err))
      .finally(() => setLoading(false));
  }, []);

  // sort handler
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "ascending" ? "descending" : "ascending" }
        : { key, direction: "ascending" }
    );
    setPage(1);
  };

  // ----- filtering pipeline -----
  const categoryFiltered = useMemo(() => {
    return selectedCategory === "All"
      ? salesData
      : salesData.filter((item) => item.category === selectedCategory);
  }, [salesData, selectedCategory]);

  const dateFiltered = useMemo(() => {
    if (!fromDate && !toDate) return categoryFiltered;
    return categoryFiltered.filter((row) => {
      const d = row.date; // yyyy-mm-dd
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [categoryFiltered, fromDate, toDate]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return dateFiltered;
    const out = [...dateFiltered].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return out;
  }, [dateFiltered, sortConfig]);

  // pagination slice
  const totalRows = sortedData.length;
  const pagedData = useMemo(() => {
    if (pageSize === "all") return sortedData;
    const start = (page - 1) * Number(pageSize);
    return sortedData.slice(start, start + Number(pageSize));
  }, [sortedData, page, pageSize]);

  // export helpers
  const handleExportCSV = () => {
    const csv = Papa.unparse(sortedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sales_report.csv";
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 16);
    const tableData = sortedData.map((row) => [
      row.product,
      row.category,
      row.unitsSold,
      INR(row.revenue),
      row.date,
    ]);
    doc.autoTable({
      head: [["Product", "Category", "Units Sold", "Revenue (INR)", "Date"]],
      body: tableData,
      startY: 20,
    });
    doc.save("sales_report.pdf");
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row) => ({
          product: row.product,
          category: row.category,
          unitsSold: parseInt(row.unitsSold),
          revenue: parseFloat(row.revenue),
          date: row.date,
        }));
        setSalesData(parsed);
        setPage(1);
      },
    });
  };

  // aggregated helpers
  const getCategoryData = () => {
    const categoryMap = {};
    dateFiltered.forEach((item) => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.unitsSold;
    });
    return Object.entries(categoryMap).map(([category, unitsSold]) => ({ category, unitsSold }));
  };

  // top sellers this month
  const getTopSellersThisMonth = (limit = 5) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const agg = new Map();
    salesData.forEach((row) => {
      const d = new Date(row.date);
      if (d >= startOfMonth) {
        const key = `${row.product}__${row.category}`;
        if (!agg.has(key)) agg.set(key, { product: row.product, category: row.category, units: 0, revenue: 0 });
        const rec = agg.get(key);
        rec.units += Number(row.unitsSold || 0);
        rec.revenue += Number(row.revenue || 0);
      }
    });
    return Array.from(agg.values()).sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, limit);
  };

  // top-3 products per category (month/all)
  const getTop3ForCategory = (category) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const agg = new Map();
    salesData.forEach((row) => {
      if (row.category !== category) return;
      if (topRange === "month" && new Date(row.date) < startOfMonth) return;
      const key = row.product;
      if (!agg.has(key)) agg.set(key, { product: row.product, units: 0, revenue: 0 });
      const rec = agg.get(key);
      rec.units += Number(row.unitsSold || 0);
      rec.revenue += Number(row.revenue || 0);
    });
    return Array.from(agg.values()).sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 3);
  };

  // monthly revenue for bottom chart (unchanged)
  const getMonthlyRevenueData = () => {
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let earliest = null;
    salesData.forEach((r) => {
      const d = new Date(r.date);
      if (!earliest || d < earliest) earliest = d;
    });
    const end = new Date();
    const start = monthsBack === "all"
      ? new Date(earliest || end)
      : new Date(end.getFullYear(), end.getMonth() - (Number(monthsBack) - 1), 1);

    const bucket = {}; // YYYY-M -> revenue
    salesData.forEach((row) => {
      const d = new Date(row.date);
      if (d >= start && d <= end) {
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        bucket[key] = (bucket[key] || 0) + Number(row.revenue || 0);
      }
    });

    const out = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    if (cursor > end) return out;
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
      out.push({
        month: `${monthNames[cursor.getMonth()]} ${String(cursor.getFullYear()).slice(-2)}`,
        sales: bucket[key] || 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  };

  // NEW: revenue over time with scale
  const getRevenueOverTime = () => {
    const rows = dateFiltered; // respect filters
    const outMap = new Map();

    const add = (label, amt) => {
      outMap.set(label, (outMap.get(label) || 0) + amt);
    };

    rows.forEach((r) => {
      const d = new Date(r.date);
      const amt = Number(r.revenue || 0);

      if (revScale === "daily") {
        const label = r.date; // yyyy-mm-dd
        add(label, amt);
      } else if (revScale === "biweekly") {
        // bucket into 1–15 and 16–end-of-month
        const y = d.getFullYear();
        const m = d.getMonth(); // 0-11
        const day = d.getDate();
        const half = day <= 15 ? "1–15" : "16–" + new Date(y, m + 1, 0).getDate();
        const label = `${half} ${d.toLocaleString("default", { month: "short" })} ${String(y).slice(-2)}`;
        add(label, amt);
      } else {
        // monthly
        const label = `${d.toLocaleString("default", { month: "short" })} ${String(d.getFullYear()).slice(-2)}`;
        add(label, amt);
      }
    });

    // stable order by date-ish: we can parse first number when biweekly, otherwise rely on insertion
    return Array.from(outMap.entries()).map(([label, revenue]) => ({ label, revenue }));
  };

  const topSellers = getTopSellersThisMonth();

  // pagination helpers
  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalRows / Number(pageSize)));
  const canPrev = page > 1 && pageSize !== "all";
  const canNext = page < totalPages && pageSize !== "all";

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <button
          onClick={() => navigate("/admin")}
          className="text-2xl font-bold text-blue-700 flex items-center gap-2 hover:text-blue-900 transition"
        >
          <FiHome /> Admin Panel
        </button>

        <nav className="space-y-4 text-sm">
          <button onClick={() => navigate("/admin/slabs")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiBox /> Slabs Inventory</button>
          <button onClick={() => navigate("/admin/ceramics")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiPackage /> Ceramics Inventory</button>
          <button onClick={() => navigate("/admin/orders")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiSettings /> Orders</button>
          <button onClick={() => navigate("/admin/support")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiHeadphones /> Customer Support</button>
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-gray-200 rounded-md font-semibold"><FiTrendingUp /> Sales & Reports</button>
          <button onClick={() => navigate("/", { state: { fromAdmin: true } })} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"><FiGlobe /> Customer Homepage</button>
          <button onClick={() => { localStorage.removeItem("isAdminLoggedIn"); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"><FiLogOut /> Logout</button>
        </nav>
      </aside>

      <main className="flex-1 px-10 py-8 space-y-10">
        <h1 className="text-3xl font-bold text-blue-800">Sales & Reports</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow cursor-pointer hover:bg-blue-700 transition">
              <FiUpload />
              <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
              Upload CSV
            </label>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition">
              <FiDownload /> Export CSV
            </button>
            {/* PDF available if you want */}
            {/* <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition">
              <FiDownload /> Export PDF
            </button> */}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-md shadow-sm bg-white text-sm"
            >
              <option value="All">All</option>
              {[...new Set(salesData.map((item) => item.category))].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <label className="text-sm text-gray-700 ml-2">From</label>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-md shadow-sm bg-white text-sm"/>
            <label className="text-sm text-gray-700">To</label>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-md shadow-sm bg-white text-sm"/>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="text-sm text-gray-600">
              {pageSize === "all"
                ? `Showing all ${totalRows} rows`
                : `Showing ${(page - 1) * Number(pageSize) + 1}-${Math.min(page * Number(pageSize), totalRows)} of ${totalRows}`}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Rows per page</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(e.target.value === "all" ? "all" : Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 border rounded"
              >
                <option value={15}>15</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <table className="w-full text-sm text-left text-gray-600 mt-2">
            <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
              <tr>
                {["product", "category", "unitsSold", "revenue", "date"].map((key) => (
                  <th key={key} onClick={() => handleSort(key)} className="py-3 px-4 cursor-pointer hover:bg-blue-200 transition">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key && <span className="ml-2">{sortConfig.direction === "ascending" ? "⬆️" : "⬇️"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-500">Loading...</td></tr>
              ) : pagedData.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-center text-gray-500">No data found.</td></tr>
              ) : (
                pagedData.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4">{item.product}</td>
                    <td className="py-2 px-4">{item.category}</td>
                    <td className="py-2 px-4">{item.unitsSold}</td>
                    <td className="py-2 px-4">{INR(item.revenue)}</td>
                    <td className="py-2 px-4">{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="h-3" />
        </div>

        {/* Top sellers (same) */}
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-700">Top Sellers</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Range:</label>
              <select value={topRange} onChange={(e) => setTopRange(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm">
                <option value="month">This month</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const top3 = getTop3ForCategory(cat);
              return (
                <div key={cat} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-700">{cat}</h3>
                    <span className="text-xs text-gray-500">{topRange === "month" ? "This month" : "All time"}</span>
                  </div>
                  {top3.length === 0 ? (
                    <div className="text-sm text-gray-500">No sales data.</div>
                  ) : (
                    <ol className="space-y-2 list-decimal list-inside">
                      {top3.map((p, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <div className="pr-2 truncate">{p.product}</div>
                          <div className="text-xs text-gray-600 text-right">
                            <div>Units: <span className="font-medium">{p.units}</span></div>
                            <div>Rev: <span className="font-medium">{INR(p.revenue)}</span></div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          {/* Revenue over time with scale */}
          <div className="bg-white rounded-xl p-6 shadow min-h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-700">Revenue Over Time</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Scale:</label>
                <select
                  value={revScale}
                  onChange={(e) => setRevScale(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="biweekly">15 days</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getRevenueOverTime()} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" minTickGap={20} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip formatter={(v) => INR(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Units by category (unchanged except it respects date filter) */}
          <div className="bg-white rounded-xl p-6 shadow min-h-[350px]">
            <h2 className="text-lg font-bold mb-4 text-blue-700">Units Sold by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryData()} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" minTickGap={20} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="unitsSold" fill="#10b981" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom chart: monthly revenue with range selector */}
        <div className="bg-white rounded-xl p-6 shadow min-h-[350px] mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-700">Sales Overview (Monthly Revenue)</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Range:</label>
              <select
                value={monthsBack}
                onChange={(e) => setMonthsBack(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
                <option value={24}>Last 24 months</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyRevenueData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => INR(v)} />
              <Legend />
              <Bar dataKey="sales" fill="#93c5fd" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
