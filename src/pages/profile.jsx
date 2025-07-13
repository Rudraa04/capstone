import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase/firebase";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Profile() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.exists() ? docSnap.data() : {};

        const isAdmin =
          localStorage.getItem("fromAdmin") === "true" &&
          userData.role === "admin";

        setFromAdmin(isAdmin);
        if (!isAdmin) {
          localStorage.removeItem("fromAdmin");
        }

        setUser({
          ...currentUser,
          photoURL: currentUser.photoURL || userData.photoURL || null,
        });

        setProfileData((prev) => ({
          ...prev,
          fullName: currentUser.displayName || "",
          bio: userData.bio || "",
          phone: userData.phone || "",
          address: userData.address || "",
        }));
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
    if (!file || !auth.currentUser) return;

    if (file.size > 200 * 1024) {
      alert("File too large! Max size allowed is 200KB.");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `Profile/${auth.currentUser.uid}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL: url });

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          ...profileData,
          photoURL: url,
          role: fromAdmin ? "admin" : "customer",
        },
        { merge: true }
      );

      await auth.currentUser.reload();
      const refreshedUser = auth.currentUser;

      setUser({
        ...refreshedUser,
        photoURL: refreshedUser.photoURL,
      });

      setProfileData((prev) => ({
        ...prev,
        photoURL: refreshedUser.photoURL,
      }));

      alert("Profile picture updated!");
    } catch (err) {
      alert("Error uploading picture: " + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-blue-200 min-h-screen text-gray-900 font-sans">
      <Header />
      <main className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl border border-gray-200 p-10">
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

          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow border-2 border-blue-500 transition-transform duration-300 ease-in-out hover:scale-105 hover:ring hover:ring-blue-400 hover:shadow-xl">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold">
                  {profileData.fullName?.charAt(0) || "U"}
                </div>
              )}
            </div>

            <label className="mt-4 text-sm font-medium">
              {uploading
                ? "Uploading..."
                : user?.photoURL
                ? "Change Picture"
                : "Upload Picture"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicUpload}
              className="text-sm mt-1"
            />

            <h2 className="text-2xl font-bold mt-4">
              {profileData.fullName || "Unnamed User"}
            </h2>
            <p className="text-sm text-gray-600 mb-2">{user?.email}</p>

            {fromAdmin && (
              <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={handlePasswordReset}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg text-sm font-semibold"
            >
              Change Password
            </button>
            <button
              onClick={async () => {
                await signOut(auth);
                localStorage.removeItem("fromAdmin");
                navigate("/login");
              }}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-6 py-2 rounded-lg text-sm font-semibold"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["fullName", "phone", "email", "address"].map((key) => (
              <div key={key}>
                <label className="text-sm font-semibold mb-1 block text-gray-700">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
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
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-50 focus:outline-none"
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
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-50 focus:outline-none"
                    />
                  )
                ) : (
                  <div className="w-full border border-gray-200 px-4 py-3 rounded-lg bg-gray-100">
                    {key === "email" ? user?.email : profileData[key] || "-"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
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
