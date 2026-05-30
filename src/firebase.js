import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  VITE_FIREBASE_apiKey: "AIzaSyC3c6IJFYvKUY6lgyD2IupqtgO6CV_Is1s",
  VITE_FIREBASE_authDomain: "vacation-3bc4d.firebaseapp.com",
  VITE_FIREBASE_projectId: "vacation-3bc4d",
  VITE_FIREBASE_storageBucket: "vacation-3bc4d.firebasestorage.app",
  VITE_FIREBASE_messagingSenderId: "484787013070",
  VITE_FIREBASE_appId: "1:484787013070:web:4b5142240faa554e43979f"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
