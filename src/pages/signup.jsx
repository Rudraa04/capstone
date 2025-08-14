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
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // optional: password strength helper (no UI changes required)
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
    size: "normal",  // 'normal' | 'large'
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

    // basic checks (no UI changes)
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) return triggerToast("Please enter a valid email.", "error");
    if (password !== confirm) return triggerToast("Passwords do not match.", "error");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // keep displayName consistent
      await updateProfile(user, { displayName: fullName });

      // ✅ Write user doc for dashboard metrics (NO UI changes)
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email || "",
          fullName: fullName || "",
          role: "customer",
          createdAt: serverTimestamp(), // Firestore Timestamp (works with Timestamp queries)
          createdAtMs: Date.now(),      // Number epoch (works with numeric queries)
        },
        { merge: true }
      );

      // optional email verification
      await sendEmailVerification(user);
      // sign out to force login flow (optional – keep if you already had it)
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

  // ---- Google sign-up/login (keeps same UI, adds doc write) ----
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ Same doc write (merge if exists)
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

      // go to homepage or wherever you already navigate
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

      {/* Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-blue-200">
          <h2 className="text-4xl font-extrabold text-center text-blue-600 mb-8">
            Create <span className="text-transparent bg-clip-text bg-blue-600">Account</span>
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPwdUI(true);
                    evaluatePassword(e.target.value);
                  }}
                  onBlur={() => setShowPwdUI(false)}
                  className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>

              {/* Optional: tiny strength hints (no design changes required) */}
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
                    <li className={validations.length ? "text-green-600" : "text-gray-500"}>
                      At least 8 characters
                    </li>
                    <li className={validations.upper ? "text-green-600" : "text-gray-500"}>
                      One uppercase letter
                    </li>
                    <li className={validations.lower ? "text-green-600" : "text-gray-500"}>
                      One lowercase letter
                    </li>
                    <li className={validations.number ? "text-green-600" : "text-gray-500"}>
                      One number
                    </li>
                    <li className={validations.special ? "text-green-600" : "text-gray-500"}>
                      One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirm((s) => !s)}
                >
                  {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
            >
              Sign Up
            </button>

            <div className="text-center text-sm text-gray-600">or</div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 border bg-white hover:bg-gray-50 px-4 py-2 rounded-md font-semibold"
            >
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              />
              Continue with Google
            </button>

            <div className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Tiny toast (unchanged) */}
      {toast.show && (
        <div
          onClick={() => setToast({ ...toast, show: false })}
          className={`fixed bottom-4 right-4 z-50 shadow-xl cursor-pointer transition-all duration-500 ${
            toast.size === "large" ? "max-w-xs sm:max-w-sm p-6 text-xl font-bold" : "p-4 text-sm"
          } rounded-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
