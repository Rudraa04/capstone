import React, { useState, useEffect } from "react";
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
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });
  const [selectedCategory, setSelectedCategory] = useState("All");

  // NEW: how far back to show monthly sales in the bottom chart
  // can be 6, 12, 24, or "all"
  const [monthsBack, setMonthsBack] = useState(6);

  // INR formatter
  const INR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  // Fetch orders -> flatten items into salesData rows
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
              date: new Date(order.createdAt).toISOString().split("T")[0],
            });
          });
        });

        setSalesData(transformed);
      })
      .catch((err) => console.error("Failed to fetch order data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? {
            key,
            direction:
              prev.direction === "ascending" ? "descending" : "ascending",
          }
        : { key, direction: "ascending" }
    );
  };

  const filteredData =
    selectedCategory === "All"
      ? salesData
      : salesData.filter((item) => item.category === selectedCategory);

  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sales_report.csv";
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 16);
    const tableData = filteredData.map((row) => [
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
      },
    });
  };

  // Aggregate units by category
  const getCategoryData = () => {
    const categoryMap = {};
    filteredData.forEach((item) => {
      categoryMap[item.category] =
        (categoryMap[item.category] || 0) + item.unitsSold;
    });
    return Object.entries(categoryMap).map(([category, unitsSold]) => ({
      category,
      unitsSold,
    }));
  };

  // Monthly revenue (configurable range, or all time)
  const getMonthlyRevenueData = () => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Find earliest date if "all"
    let earliest = null;
    salesData.forEach((r) => {
      const d = new Date(r.date);
      if (!earliest || d < earliest) earliest = d;
    });

    const end = new Date();
    const start =
      monthsBack === "all"
        ? new Date(earliest || end)
        : new Date(
            end.getFullYear(),
            end.getMonth() - (Number(monthsBack) - 1),
            1
          );

    // bucket by YYYY-M
    const bucket = {};
    salesData.forEach((row) => {
      const d = new Date(row.date);
      if (d >= start && d <= end) {
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        bucket[key] = (bucket[key] || 0) + Number(row.revenue || 0);
      }
    });

    // fill months from start..end
    const out = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    // guard: if earliest is after end (no data), return empty
    if (cursor > end) return out;

    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
      out.push({
        month: `${monthNames[cursor.getMonth()]} ${String(
          cursor.getFullYear()
        ).slice(-2)}`,
        sales: bucket[key] || 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  };

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
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiSettings /> Orders
          </button>
          <button
            onClick={() => navigate("/admin/support")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiHeadphones /> Customer Support
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-gray-200 rounded-md font-semibold">
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

      <main className="flex-1 px-10 py-8 space-y-10">
        <h1 className="text-3xl font-bold text-blue-800">Sales & Reports</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow cursor-pointer hover:bg-blue-700 transition">
              <FiUpload />
              <input
                type="file"
                accept=".csv"
                onChange={handleUploadCSV}
                className="hidden"
              />
              Upload CSV
            </label>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
            >
              <FiDownload /> Export CSV
            </button>
            {/*<button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
            >
              <FiDownload /> Export PDF
            </button>*/}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md shadow-sm bg-white text-sm"
            >
              <option value="All">All</option>
              {[...new Set(salesData.map((item) => item.category))].map(
                (category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow min-h-[200px] w-full">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
              <tr>
                {["product", "category", "unitsSold", "revenue", "date"].map(
                  (key) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="py-3 px-4 cursor-pointer hover:bg-blue-200 transition"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {sortConfig.key === key && (
                        <span className="ml-2">
                          {sortConfig.direction === "ascending" ? "⬆️" : "⬇️"}
                        </span>
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No data found.
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4 whitespace-normal">
                      {item.product}
                    </td>
                    <td className="py-2 px-4 whitespace-normal">
                      {item.category}
                    </td>
                    <td className="py-2 px-4">{item.unitsSold}</td>
                    <td className="py-2 px-4">{INR(item.revenue)}</td>
                    <td className="py-2 px-4">{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Top row: two charts side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          <div className="bg-white rounded-xl p-6 shadow min-h-[350px]">
            <h2 className="text-lg font-bold mb-4 text-blue-700">
              Revenue Over Time
            </h2>
            {/* Revenue Over Time */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={filteredData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  minTickGap={20}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, (max) => (Number(max) || 0) + 50]} />
                <Tooltip formatter={(v) => INR(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow min-h-[350px]">
            <h2 className="text-lg font-bold mb-4 text-blue-700">
              Units Sold by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getCategoryData()}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  minTickGap={20}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, (max) => (Number(max) || 0) + 1]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="unitsSold" fill="#10b981" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: Sales Overview full width */}
        <div className="bg-white rounded-xl p-6 shadow min-h-[350px] mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-700">
              Sales Overview (Monthly Revenue)
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Range:</label>
              <select
                value={monthsBack}
                onChange={(e) =>
                  setMonthsBack(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
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
            <BarChart
              data={getMonthlyRevenueData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
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
