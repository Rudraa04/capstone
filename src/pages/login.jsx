import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

// Firebase Auth
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

// Firestore
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// UI
import { FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    size: "normal",
  });

  const triggerToast = (
    message,
    type = "success",
    size = "normal",
    duration = 5000
  ) => {
    setToast({ show: true, message, type, size });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success", size: "normal" });
    }, duration);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [captchaValue, setCaptchaValue] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(() =>
    parseInt(localStorage.getItem("failedAttempts") || "0", 10)
  );
  const [showCaptcha, setShowCaptcha] = useState(failedAttempts >= 5);

  const handleCaptchaChange = (value) => setCaptchaValue(value);

  useEffect(() => {
    if (location.state?.logoutMessage) {
      triggerToast(location.state.logoutMessage, "success");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      triggerToast("❌ Please enter a valid email address first.", "error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      triggerToast(
        "📧 Password reset email sent! Check your inbox or spam.",
        "success"
      );
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        triggerToast("❌ No account found with this email.", "error");
      } else if (error.code === "auth/invalid-email") {
        triggerToast("⚠️ Invalid email format.", "error");
      } else {
        triggerToast("❌ Something went wrong. Please try again.", "error");
      }
    }
  };

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        triggerToast("❌ Please verify your email before logging in.", "error");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role;
        triggerToast("✅ Login successful!", "success");

        localStorage.removeItem("failedAttempts");
        setFailedAttempts(0);
        setShowCaptcha(false);
        setCaptchaValue(null);

        setTimeout(() => {
          if (role === "admin") navigate("/admin");
          else navigate("/");
        }, 800);
      } else {
        setMessage("No role found. Contact support.");
        setMessageType("error");
      }
    } catch (error) {
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      localStorage.setItem("failedAttempts", newFailed.toString());
      if (newFailed >= 5) setShowCaptcha(true);

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        triggerToast("❌ Email or Password is incorrect.", "error");
      } else if (error.code === "auth/too-many-requests") {
        triggerToast("⚠️ Too many attempts. Please try again later.", "error");
      } else {
        triggerToast("❌ Something went wrong. Please try again.", "error");
      }
      setMessageType("error");
    }
  };

  // Google Login (button BELOW the normal Login)
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Google users are already email-verified

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      // Create Firestore doc if missing
      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email || "",
          fullName: user.displayName || "",
          photoURL: user.photoURL || "",
          role: "customer",
          createdAt: new Date().toISOString(),
        });
      }

      const role = snap.exists() ? snap.data().role : "customer";

      triggerToast("✅ Logged in with Google!", "success");
      setTimeout(() => {
        if (role === "admin") navigate("/admin");
        else navigate("/");
      }, 600);
    } catch (e) {
      console.error(e);
      // common popup blockers / canceled
      if (e.code === "auth/popup-closed-by-user") {
        triggerToast("Popup closed before completing sign in.", "error");
      } else {
        triggerToast("Failed to sign in with Google. Try again.", "error");
      }
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
          <Link to="/" className="block text-center">
            <h1 className="text-4xl font-bold text-blue-800 mb-3">
              Patel Ceramics
            </h1>
          </Link>

          <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-6">
            Log In
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="text-right mt-1">
                <span
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>
            </div>

            {showCaptcha && (
              <div className="mt-4 flex justify-center">
                <ReCAPTCHA
                  sitekey="6LeBK2crAAAAAK3gxLQybTs7s7c5f4_-KTQ3uPWK"
                  onChange={handleCaptchaChange}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={showCaptcha && !captchaValue}
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:opacity-90 transition font-semibold shadow disabled:opacity-50"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="border-t" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
              OR
            </span>
          </div>

          {/* Google button BELOW the Login button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-700 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {toast.show && (
        <div
          onClick={() => setToast({ ...toast, show: false })}
          className={`fixed bottom-4 right-4 z-50 cursor-pointer shadow-xl transition-all duration-500 transform 
            ${
              toast.type === "success"
                ? "bg-green-600 text-white animate-pulse"
                : "bg-red-600 text-white"
            } 
            ${
              toast.size === "large"
                ? "max-w-xs sm:max-w-sm p-6 text-xl font-bold"
                : "p-4 text-sm"
            }
            rounded-lg animate-fadeInScale`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
