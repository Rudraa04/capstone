import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b bg-primary text-dark">
      <h1 className="text-2xl font-bold">PATEL CERAMICS</h1>
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search for products"
          className="border px-4 py-2 rounded-md w-64"
        />
        <Link to="/login" className="text-accent font-medium">Login</Link>
        <Link to="/signup" className="text-accent font-medium">Sign Up</Link>
        <span>Cart</span>
      </div>
    </header>
  );
}
