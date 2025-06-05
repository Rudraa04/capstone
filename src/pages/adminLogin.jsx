import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { MdLock, MdPerson, MdStore } from "react-icons/md";

export default function AdminLogin() {
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("isAdminLoggedIn", "true");
    navigate("/adminHome");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-gray-700 hover:text-black flex items-center gap-2 text-sm"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-blue-200">
          <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-8">
            Admin{" "}
            <span className="text-transparent bg-clip-text bg-blue-600">
              Login
            </span>
          </h2>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            {/* Store ID */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Store ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your store ID"
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdStore className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            {/* Login ID */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Login ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your login ID"
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdPerson className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            <button
              type="submit"
              className=" bg-blue-600  text-white px-4 py-2 rounded-md w-full hover:opacity-90 transition font-semibold shadow"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
