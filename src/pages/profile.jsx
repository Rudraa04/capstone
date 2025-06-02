import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
// If you have Header component, uncomment the line below:
// import Header from "../components/Header";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="bg-[#fdf4ec] min-h-screen text-[#3a2d25] font-sans">
      {/* <Header /> */}

      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">My Profile</h2>
        {user ? (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={user.displayName || ""}
                className="w-full border border-gray-300 px-4 py-2 rounded-md bg-[#fdf9f3]"
                disabled
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full border border-gray-300 px-4 py-2 rounded-md bg-[#fdf9f3]"
                disabled
              />
            </div>
          </div>
        ) : (
          <p>Loading user info...</p>
        )}

        <div className="mt-8 text-right">
          <button
            onClick={handleSignOut}
            className="bg-[#c2703d] text-white px-6 py-2 rounded hover:bg-[#a55c30] transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
