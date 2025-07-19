import React, { useState } from "react"; //helps to manage input values like name, email, etc.
import { useNavigate, Link } from "react-router-dom"; // helps to redirect the user after signup. links create link to login page
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth"; // firebase service to create user, update profile and send verification email
import { auth } from "../firebase/firebase"; // firebase service to handle authentication
import { setDoc, doc } from "firebase/firestore"; // doc helps where to store the data in Firestore and setdoc helps to save the data in that location
import { db } from "../firebase/firebase"; // firebase service to handle Firestore database
import { FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Signup() { 
  //usestate hook to track input and state
  const navigate = useNavigate();  //these track the user’s name, email, password, error/success messages, and password visibility toggles.
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  // // Password strength text (Weak, Medium, Strong)
  const [strength, setStrength] = useState("");
  const [validations, setValidations] = useState({ // validations criteria for password strength set at false at first
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const evaluatePassword = (pwd) => { // function to evaluate the password strength
    const newValidations = {
      length: pwd.length >= 8, // has atleast 8 characters
      upper: /[A-Z]/.test(pwd), // has atleast 1 uppercase letter
      lower: /[a-z]/.test(pwd),// has atleast 1 lowercase letter
      number: /[0-9]/.test(pwd),// has atleast 1 number
      special: /[^A-Za-z0-9]/.test(pwd),// has atleast 1 special character
    };
    setValidations(newValidations); // updates the validations state with the new checks
    const passed = Object.values(newValidations).filter(Boolean).length; // counts how many validations passed means first part giveshow many is true/false second filter true and third display lenght of true
    setStrength(passed <= 2 ? "Weak" : passed <= 4 ? "Medium" : "Strong"); 
  }; //0-2 Weak, 3-4 Medium, 5 Strong

  const handleSignup = async (e) => { // function to handle signup
    e.preventDefault(); // prevent default form submission behavior
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);//This line checks if the entered email is in a valid format using a regular expression (RegEx)
    if (!isValidEmail) { // if email is not valid it shows error message and sets message type to error and stops the function
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    const allValid = Object.values(validations).every(Boolean); // checks for all validations to be true
    if (!allValid) { // if any validation fails it shows error message and sets message type to error and stops the function
      setMessage("Password does not meet all criteria.");
      setMessageType("error");
      return;
    }

    if (password !== confirm) { // checks if password and confirm password match id not it shows error message and sets message type to error and stops the function
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }
// firebase signup logic 
    try { //Call Firebase to create the user with email and password.auth is your Firebase authentication instance
      const userCredential = await createUserWithEmailAndPassword( //Result is stored in userCredential.
        auth,
        email,
        password
      );
      const user = userCredential.user;  //Get the user object from the credentials so you can update profile and send verification.

      await updateProfile(user, {
        displayName: fullName, //Add the user's full name to their Firebase profile 
      });

      await setDoc(doc(db, "users", user.uid), { // saves user data in Firestore under users
        email: user.email, // stores user email
        fullName: fullName, // stores user full name
        role: "customer", // sets default role as customer
      });

      await sendEmailVerification(user); // sends verification email to the user
      await auth.signOut(); // Log the user out after signup until they verify their email.

      setMessage(
        "Signup successful! A verification email has been sent. Please verify before logging in."
      );
      setMessageType("success");
      setTimeout(() => navigate("/login"), 2500); // Redirect to login page after 2.5 seconds
    } catch (error) { // catches any errors during signup process
      setMessage(error.message); // sets error message
      setMessageType("error"); // sets message type to error
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    evaluatePassword(e.target.value);
                  }}
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
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onPaste={(e) => e.preventDefault()} //  Prevent paste
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