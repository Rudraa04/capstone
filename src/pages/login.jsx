import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

//firebase auth methods
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
// Firestore methods
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
//react icons
import { FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
//recaptcha package
import ReCAPTCHA from "react-google-recaptcha";

//component starts
export default function Login() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // "success" or "error"
    size: "normal", // "normal" or "large"
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

  const [email, setEmail] = useState(""); //state variable for email
  const [password, setPassword] = useState(""); //for password
  const [showPassword, setShowPassword] = useState(false); //toggle password visibility
  //feedback message to user (success or error)
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  //stores captcha value when user solves it
  const [captchaValue, setCaptchaValue] = useState(null);
  //tracks the number of failed attempts
  //Count how many times the user failed to log in
  //We get this number from the browser's local storage
  //when page loads for the first time we still check the failed attempts before.
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem("failedAttempts") || "0", 10); //if null then default is 0 , and we convert string to int using parseint10
  });
  //captcha will be appeared after 5 failed attempts
  const [showCaptcha, setShowCaptcha] = useState(failedAttempts >= 5);
  //function is called when user solves the captcha
  const handleCaptchaChange = (value) => {
    setCaptchaValue(value); //save captcha value
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.logoutMessage) {
      triggerToast(location.state.logoutMessage, "success");

      // Clear the state after showing toast
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);
  useEffect(() => {
    if (toast.show && toast.type === "success") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.95, y: 0.9 }, // 95% from left, 90% from top → bottom-right area
      });
    }
  }, [toast]);

  // Forgot Password Function
  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      //for valid email address
      triggerToast("❌ Please enter a valid email address first.", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email); //for email verification
      triggerToast(
        "📧 Password reset email sent! Check your inbox or spam.",
        "success"
      );
    } catch (error) {
      console.error("Reset error:", error.message);
      //Error handling based on Firebase error codes
      if (error.code === "auth/user-not-found") {
        // if users not found
        triggerToast("❌ No account found with this email.", "error");
      } else if (error.code === "auth/invalid-email") {
        triggerToast("⚠️ Invalid email format.", "error");
      } else {
        triggerToast("❌ Something went wrong. Please try again.", "error");
      }
    }
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault(); //prevent page reload
    setMessage(""); //clears previous messages

    try {
      //Firebase auth login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      ); // Use Firebase Auth to sign in the user with the provided email and password.
      const user = userCredential.user; // get the user object which contains user details
      //check if user has verified email
      if (!user.emailVerified) {
        triggerToast("❌ Please verify your email before logging in.", "error");
        //show error message
        return; // If email is not verified, show a message and stop login here.
      }

      //check role from firestore
      const userDocRef = doc(db, "users", user.uid); //Create a reference to the user's document in Firestore
      const userDocSnap = await getDoc(userDocRef); //Get the actual user document from Firestore using the reference.

      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role; //get the role from user document
        triggerToast("✅ Login successful!", "success");

        //resets all captcha value after successful login
        localStorage.removeItem("failedAttempts"); //removes failed attempts count
        setFailedAttempts(0); //sets to 0
        setShowCaptcha(false); //hides captcha
        setCaptchaValue(null); //clear captcha token
        //redirects user based on role
        setTimeout(() => {
          if (role === "admin") navigate("/admin");
          // If the user is an admin, navigate to the admin dashboard.
          else navigate("/"); // If the user is a regular user, navigate to the home page.
        }, 1000); // after 1 second
      } else {
        setMessage("No role found. Contact support."); // If the user document does not exist or has no role, show an error message.
        setMessageType("error");
      }
    } catch (error) {
      //If login fails, increase the count of captcha by 1
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      //Save the new count to local storage so it's remembered
      localStorage.setItem("failedAttempts", newFailed.toString());
      //If the user has failed 5 or more times, show the captcha
      if (newFailed >= 5) setShowCaptcha(true);
      //handle common auth errors
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
                  //this runs after user solves captcha
                  onChange={handleCaptchaChange}
                />
              </div>
            )}

            <button
              type="submit"
              //if captcha is not solved the button will be disabled
              disabled={showCaptcha && !captchaValue}
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:opacity-90 transition font-semibold shadow disabled:opacity-50"
            >
              Login
            </button>
          </form>

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
          {toast.size === "large" && (
            <div className="text-4xl mb-2 animate-bounce">🎉</div>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
