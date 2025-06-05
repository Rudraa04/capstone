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
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

export default function UserAccess() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Rudra Patel",
      email: "rudra@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Smit Patel",
      email: "smit@example.com",
      role: "User",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Karm Patel",
      email: "karm@example.com",
      role: "User",
      status: "Active",
    },
  ]);

  const handleEdit = (id) => {
    alert(`Edit role for user ID: ${id}`);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const toggleStatus = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <button
          onClick={() => navigate("/adminHome")}
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
          <button
            onClick={() => navigate("/admin/reports")}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
          >
            <FiTrendingUp /> Sales & Reports
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-gray-200 rounded-md font-semibold">
            <FiUsers /> User Access
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

      {/* Main Content */}
      <main className="flex-1 px-10 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800">User Access</h1>
        </div>

        <div className="bg-white shadow rounded-xl p-6 w-full min-h-[200px]">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4 whitespace-nowrap">{user.name}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{user.email}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{user.role}</td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={user.status === "Active"}
                        onChange={() => toggleStatus(user.id)}
                      />
                      <div
                        className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                          user.status === "Active"
                            ? "bg-green-400"
                            : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform duration-300 ${
                            user.status === "Active"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </label>
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap space-x-3">
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
