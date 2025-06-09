import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (password !== confirm) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      await auth.signOut();

      await updateProfile(user, {
        displayName: fullName,
      });

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullName: fullName,
        role: "customer",
      });

      setMessage("Signup successful! A verification email has been sent. Please verify before logging in.");
      setMessageType("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
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
          <h2 className="text-4xl font-extrabold text-center text-blue-600 mb-8">
            Create <span className="text-transparent bg-clip-text bg-blue-600 to-purple-600">Account</span>
          </h2>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdPerson className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdEmail className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 to-purple-600 text-white px-4 py-2 rounded-md w-full hover:opacity-90 transition font-semibold shadow"
            >
              Sign Up
            </button>

            {message && (
              <p
                className={`text-sm text-center font-medium mt-2 ${
                  messageType === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}