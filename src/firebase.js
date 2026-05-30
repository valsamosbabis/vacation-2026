import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC3c6IJFYvKUY6lgyD2IupqtgO6CV_Is1s",
  authDomain: "vacation-3bc4d.firebaseapp.com",
  projectId: "vacation-3bc4d",
  storageBucket: "vacation-3bc4d.firebasestorage.app",
  messagingSenderId: "484787013070",
  appId: "1:484787013070:web:4b5142240faa554e43979f"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);