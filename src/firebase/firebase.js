//import functions from firebase SDK
import { initializeApp } from "firebase/app"; //start firebase in website
import { getAuth } from "firebase/auth"; //handles login/signup/logut
import { getFirestore } from "firebase/firestore"; //read/write data in the Firestore database
import { getStorage } from "firebase/storage"; //upload and get product images


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
//start firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // Export auth so you can use it to log in / sign up in other files
export const db = getFirestore(app); // Export Firestore to read/write user data
export const storage = getStorage(app); // Export Storage to upload and get product images
