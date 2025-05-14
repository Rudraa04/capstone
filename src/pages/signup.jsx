import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // You can add real sign-up logic here
    navigate('/');
  };

  return (
    <div className="bg-primary min-h-screen flex items-center justify-center text-dark">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
          />
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
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
