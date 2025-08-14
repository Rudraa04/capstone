import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // optional: password strength helper (kept; behavior unchanged)
  const [showPwdUI, setShowPwdUI] = useState(false);
  const [strength, setStrength] = useState("");
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // 'success' | 'error'
    size: "normal", // 'normal' | 'large'
  });

  const triggerToast = (message, type = "success", size = "normal", ms = 2400) => {
    setToast({ show: true, message, type, size });
    setTimeout(() => setToast({ show: false, message: "", type: "success", size: "normal" }), ms);
  };

  const evaluatePassword = (pwd) => {
    const v = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    setValidations(v);
    const score = Object.values(v).filter(Boolean).length;
    setStrength(score >= 4 ? "Strong" : score >= 3 ? "Medium" : "Weak");
  };

  // ---- Email / Password signup ----
  const handleSignup = async (e) => {
    e.preventDefault();

    // basic checks (logic unchanged)
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) return triggerToast("Please enter a valid email.", "error");
    if (password !== confirm) return triggerToast("Passwords do not match.", "error");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      await updateProfile(user, { displayName: fullName });

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email || "",
          fullName: fullName || "",
          role: "customer",
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        },
        { merge: true }
      );

      await sendEmailVerification(user);
      await auth.signOut();

      triggerToast("Signup successful! Please verify your email.", "success", "large", 2200);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      if (err?.code === "auth/email-already-in-use") {
        triggerToast("This email is already in use.", "error");
      } else {
        triggerToast(err?.message || "Signup failed.", "error");
      }
    }
  };

  // ---- Google sign-up/login ----
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email || "",
          fullName: user.displayName || "",
          role: "customer",
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        },
        { merge: true }
      );

      navigate("/");
    } catch (err) {
      triggerToast(err?.message || "Google signup failed.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-gray-700 hover:text-black flex items-center gap-2 text-sm"
      >
        <FaArrowLeft /> Back
      </button>

      {/* Centered Card (matches Login) */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-blue-200">
          {/* Brand (matches Login) */}
          <Link to="/" className="block text-center">
            <h1 className="text-4xl font-bold text-blue-800 mb-3">Patel Ceramics</h1>
          </Link>

          {/* Title (matches Login style) */}
          <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-6">Sign Up</h2>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">Full Name</label>
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

            {/* Email */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">Email Address</label>
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

            {/* Password */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPwdUI(true);
                    evaluatePassword(e.target.value);
                  }}
                  onBlur={() => setShowPwdUI(false)}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-10 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-2.5 text-gray-600"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>

              {/* Optional tiny hints (kept; visually subtle) */}
              {showPwdUI && (
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <div>
                    Strength:{" "}
                    <span
                      className={
                        strength === "Strong"
                          ? "text-green-600 font-semibold"
                          : strength === "Medium"
                          ? "text-yellow-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {strength || "Weak"}
                    </span>
                  </div>
                  <ul className="list-disc list-inside">
                    <li className={validations.length ? "text-green-600" : "text-gray-500"}>At least 8 characters</li>
                    <li className={validations.upper ? "text-green-600" : "text-gray-500"}>One uppercase letter</li>
                    <li className={validations.lower ? "text-green-600" : "text-gray-500"}>One lowercase letter</li>
                    <li className={validations.number ? "text-green-600" : "text-gray-500"}>One number</li>
                    <li className={validations.special ? "text-green-600" : "text-gray-500"}>One special character</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-10 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-2 top-2.5 text-gray-600"
                >
                  {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:opacity-90 transition font-semibold shadow"
            >
              Sign Up
            </button>
          </form>

          {/* Divider (matches Login) */}
          <div className="relative my-6">
            <div className="border-t" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
              OR
            </span>
          </div>

          {/* Google (matches Login) */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Toast (left as-is; visually similar to Login) */}
      {toast.show && (
        <div
          onClick={() => setToast({ ...toast, show: false })}
          className={`fixed bottom-4 right-4 z-50 cursor-pointer shadow-xl transition-all duration-500 transform 
            ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"} 
            ${toast.size === "large" ? "max-w-xs sm:max-w-sm p-6 text-xl font-bold" : "p-4 text-sm"}
            rounded-lg`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
