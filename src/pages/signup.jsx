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
import { setDoc, doc, serverTimestamp } from "firebase/firestore"; // ⬅️ added serverTimestamp
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

  // 👇 NEW: control visibility of password strength UI
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
    type: "success",
    size: "normal",
  });

  const triggerToast = (message, type = "success", size = "normal", duration = 5000) => {
    setToast({ show: true, message, type, size });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success", size: "normal" });
    }, duration);
  };

  const evaluatePassword = (pwd) => {
    const newValidations = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    setValidations(newValidations);
    const passed = Object.values(newValidations).filter(Boolean).length;
    setStrength(passed <= 2 ? "Weak" : passed <= 4 ? "Medium" : "Strong");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const allValid = Object.values(validations).every(Boolean);
    if (!isValidEmail) return triggerToast("❌ Please enter a valid email address", "error");
    if (!allValid) return triggerToast("❌ Password does not meet all criteria", "error");
    if (password !== confirm) return triggerToast("❌ Passwords do not match", "error");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullName: fullName,
        role: "customer",
      });

      await sendEmailVerification(user);
      await auth.signOut();

      triggerToast("✅ Signup successful! Verification email sent.", "success", "large");
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        triggerToast("❌ This email is already registered.", "error");
      } else if (error.code === "auth/weak-password") {
        triggerToast("❌ Your password is too weak.", "error");
      } else {
        triggerToast(`❌ ${error.message}`, "error");
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullName: user.displayName || "",
        role: "customer",
        createdAt: serverTimestamp(), // ✅ now imported
      });

      navigate("/");
    } catch (error) {
      triggerToast(`❌ ${error.message}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
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

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    evaluatePassword(e.target.value);
                  }}
                  onFocus={() => setShowPwdUI(true)}             // 👈 show on focus
                  onBlur={() => setShowPwdUI(Boolean(password))}  // 👈 hide if empty on blur
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-10 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 text-gray-600"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>

              {/* Password strength + checklist appears only when focused/typed */}
              {showPwdUI && (
                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        strength === "Weak"
                          ? "w-1/4 bg-red-500"
                          : strength === "Medium"
                          ? "w-2/4 bg-yellow-500"
                          : strength === "Strong"
                          ? "w-full bg-green-500"
                          : "w-0"
                      }`}
                    ></div>
                  </div>
                  <p
                    className={`text-sm mt-1 font-semibold ${
                      strength === "Strong"
                        ? "text-green-600"
                        : strength === "Medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    Strength: {strength || "N/A"}
                  </p>
                  <ul className="text-sm mt-1 space-y-1">
                    <li className={validations.length ? "text-green-600" : "text-red-600"}>✓ At least 8 characters</li>
                    <li className={validations.upper ? "text-green-600" : "text-red-600"}>✓ At least 1 uppercase letter</li>
                    <li className={validations.lower ? "text-green-600" : "text-red-600"}>✓ At least 1 lowercase letter</li>
                    <li className={validations.number ? "text-green-600" : "text-red-600"}>✓ At least 1 number</li>
                    <li className={validations.special ? "text-green-600" : "text-red-600"}>✓ At least 1 special character</li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  required
                  className="w-full border-b-2 border-black py-2 pl-10 pr-10 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <MdLock className="absolute left-2 top-2.5 text-gray-600 text-lg" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-2.5 text-gray-600"
                >
                  {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 to-purple-600 text-white px-4 py-2 rounded-md w-full hover:opacity-90 transition font-semibold shadow"
            >
              Sign Up
            </button>

            {/* Google button BELOW signup */}
            <div>
              <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200" />
                OR
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md font-semibold"
              >
                <img
                  alt="Google"
                  className="w-5 h-5"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                />
                Continue with Google
              </button>
            </div>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {toast.show && (
        <div
          onClick={() => setToast({ ...toast, show: false })}
          className={`fixed bottom-4 right-4 z-50 animate-slideIn cursor-pointer shadow-xl transition-all duration-500 ${
            toast.size === "large" ? "max-w-xs sm:max-w-sm p-6 text-xl font-bold" : "p-4 text-sm"
          } rounded-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {/*{toast.size === "large" && <div className="text-4xl mb-2 animate-bounce">🎉</div>}*/}
          {toast.message}
        </div>
      )}
    </div>
  );
}
