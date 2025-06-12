import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "../firebase/firebase";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [fromAdmin, setFromAdmin] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    bio: "",
    phone: "",
    address: "",
  });
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          const isAdmin =
            localStorage.getItem("fromAdmin") === "true" &&
            userData.role === "admin";

          setFromAdmin(isAdmin);

          if (!isAdmin) {
            localStorage.removeItem("fromAdmin");
          }

          setProfileData((prev) => ({
            ...prev,
            fullName: currentUser.displayName || "",
            bio: userData.bio || "",
            phone: userData.phone || "",
            address: userData.address || "",
          }));
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handlePasswordReset = async () => {
    if (user?.email) {
      await sendPasswordResetEmail(auth, user.email);
      alert("Password reset email sent!");
    }
  };

  const handleSave = async () => {
    try {
      if (user && profileData.fullName !== user.displayName) {
        await updateProfile(user, { displayName: profileData.fullName });
      }
      await setDoc(doc(db, "users", user.uid), {
        bio: profileData.bio,
        phone: profileData.phone,
        address: profileData.address,
        role: fromAdmin ? "admin" : "customer", 
      });
      alert("Profile updated!");
      setEditing(false);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: url });
      setUser({ ...user, photoURL: url });
      setPreviewUrl(null);

      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Error uploading picture");
    }
    setUploading(false);
  };

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <Header />

      <main className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white/30 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-2xl p-10 text-gray-800">
          {fromAdmin && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate("/admin")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
              >
                🔙 Back to Admin
              </button>
            </div>
          )}

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-28 h-28 mb-4 relative group">
              {previewUrl || user?.photoURL ? (
                <img
                  src={previewUrl || user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full border-2 border-blue-500 shadow"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold shadow">
                  {profileData.fullName?.charAt(0) || "U"}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer">
                {uploading ? "Uploading..." : "Change"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
              {profileData.fullName || "Unnamed User"}
              {fromAdmin && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{user?.email}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Edit Profile
              </button>
              <button
                onClick={handlePasswordReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Change Password
              </button>
              <button
                onClick={async () => {
                  await signOut(auth);
                  localStorage.removeItem("fromAdmin");
                  navigate("/login");
                }}
                className="bg-red-100 hover:bg-red-200 text-red-600 px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Full Name", key: "fullName" },
              { label: "Phone", key: "phone" },
              { label: "Email", key: "email", value: user?.email },
              { label: "Address", key: "address" },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {label}
                </label>
                {editing && key !== "email" ? (
                  key === "address" ? (
                    <textarea
                      rows={2}
                      value={profileData[key] || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 bg-white"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profileData[key] || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 bg-white"
                    />
                  )
                ) : (
                  <div className="w-full border border-gray-200 px-4 py-3 rounded-lg bg-white/70 text-gray-700">
                    {value || profileData[key] || "-"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
