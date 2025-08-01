import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
//firebase auth methods
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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

  // Forgot Password Function
  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) { //for valid email address
      alert("Please enter a valid email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email); //for email verification
      alert("Password reset email sent! Check your inbox or spam.");
    } catch (error) {
      console.error("Reset error:", error.message);
        //Error handling based on Firebase error codes
      if (error.code === "auth/user-not-found") { // if users not found  
        alert("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault(); //prevent page reload
    setMessage(""); //clears previous messages

    try {
      //Firebase auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Use Firebase Auth to sign in the user with the provided email and password.
      const user = userCredential.user; // get the user object which contains user details
      //check if user has verified email
      if (!user.emailVerified) {
        setMessage("Please verify your email before logging in.");
        setMessageType("error"); //show error message
        return; // If email is not verified, show a message and stop login here.
      }

      //check role from firestore
      const userDocRef = doc(db, "users", user.uid); //Create a reference to the user's document in Firestore
      const userDocSnap = await getDoc(userDocRef); //Get the actual user document from Firestore using the reference.

      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role; //get the role from user document

        setMessage("Login successful!");
        setMessageType("success");
        //resets all captcha value after successful login
        localStorage.removeItem("failedAttempts"); //removes failed attempts count
        setFailedAttempts(0); //sets to 0
        setShowCaptcha(false); //hides captcha
        setCaptchaValue(null); //clear captcha token
        //redirects user based on role
        setTimeout(() => {
          if (role === "admin") navigate("/admin"); // If the user is an admin, navigate to the admin dashboard.
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
        setMessage("Email or Password is incorrect.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Too many attempts. Please try again later.");
      } else {
        setMessage("Something went wrong. Please try again.");
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
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
