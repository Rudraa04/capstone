import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiHome,
  FiUpload,
  FiDownload,
  FiGlobe,
} from "react-icons/fi";
import Papa from "papaparse"; //Upload file
import jsPDF from "jspdf";
import "jspdf-autotable"; //Download File
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

  const [salesData, setSalesData] = useState([
    {
      id: 1,
      product: "Italian Marble Slab",
      category: "Slabs",
      unitsSold: 18,
      revenue: 4500,
      date: "2025-05-26",
    },
    {
      id: 2,
      product: "Wall Tiles - Glossy White",
      category: "Ceramics",
      unitsSold: 42,
      revenue: 3780,
      date: "2025-05-25",
    },
    {
      id: 3,
      product: "Granite Kitchen Counter",
      category: "Slabs",
      unitsSold: 10,
      revenue: 2600,
      date: "2025-05-24",
    },
  ]);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  }); //control sorting of sales table
  const [selectedCategory, setSelectedCategory] = useState("All"); // filer sales data by category

  const handleSort = (key) => {
    // sorting in direction
    setSortConfig((prev) =>
      prev.key === key // sort by column
        ? {
            key,
            direction:
              prev.direction === "ascending" ? "descending" : "ascending",
          }
        : { key, direction: "ascending" }
    );
  };

  const filteredData =
    selectedCategory === "All" // show data all or selected category
      ? salesData
      : salesData.filter((item) => item.category === selectedCategory);

  const sortedData = [...filteredData].sort((a, b) => {
    //filter data of the column in direction
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData); //filter data to csv
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sales_report.csv"; // download
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF(); // create pdf
    doc.text("Sales Report", 14, 16);
    const tableData = filteredData.map((row) => [
      row.product,
      row.category,
      row.unitsSold,
      `$${row.revenue}`,
      row.date,
    ]);
    doc.autoTable({
      // create pdf
      head: [["Product", "Category", "Units Sold", "Revenue", "Date"]],
      body: tableData,
      startY: 20,
    });
    doc.save("sales_report.pdf");
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      // read upload csv by header and show data
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row, index) => ({
          id: index + 1,
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
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
            >
              <FiDownload /> Export PDF
            </button>
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
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No data found for this category.
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4 whitespace-normal">
                      {item.product}
                    </td>
                    <td className="py-2 px-4 whitespace-normal">
                      {item.category}
                    </td>
                    <td className="py-2 px-4">{item.unitsSold}</td>
                    <td className="py-2 px-4">${item.revenue}</td>
                    <td className="py-2 px-4">{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          <div className="bg-white rounded-xl p-6 shadow min-h-[350px]">
            <h2 className="text-lg font-bold mb-4 text-blue-700">
              Revenue Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow min-h-[350px]">
            <h2 className="text-lg font-bold mb-4 text-blue-700">
              Units Sold by Product
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="unitsSold" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
