// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkKh7i1m2-y4bMNqrW2BVtIqkRhE9wH2I",
  authDomain: "flowers-shop-19660.firebaseapp.com",
  projectId: "flowers-shop-19660",
  storageBucket: "flowers-shop-19660.firebasestorage.app",
  messagingSenderId: "820732880462",
  appId: "1:820732880462:web:284e5d8c722462f32f851f",
  measurementId: "G-G79QY5T7T1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;