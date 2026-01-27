// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 1. ДОДАЛИ ІМПОРТ БАЗИ

const firebaseConfig = {
  apiKey: "AIzaSyDElH5Xf9Eg5bXx5h-ibGYiCaS8X2BCSbY",
  authDomain: "smoke-house-2c9d0.firebaseapp.com",
  projectId: "smoke-house-2c9d0",
  storageBucket: "smoke-house-2c9d0.firebasestorage.app",
  messagingSenderId: "868647246512",
  appId: "1:868647246512:web:4339e6953d37c60261f975",
  measurementId: "G-YNCTMYEWEK"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);

// Експортуємо інструменти
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // 👈 2. ЕКСПОРТУЄМО БАЗУ (db), ЩОБ ЇЇ БАЧИЛИ ІНШІ ФАЙЛИ