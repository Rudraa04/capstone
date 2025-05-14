import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // You can add real authentication logic here
    navigate('/');
  };

  return (
    <div className="bg-primary min-h-screen flex items-center justify-center text-dark">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
          />
          <button
            type="submit"
            className="bg-accent text-white px-4 py-2 rounded-md w-full hover:bg-opacity-90 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-accent underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
