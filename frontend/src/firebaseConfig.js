// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// --- THAY CÁI NÀY BẰNG MÃ CỦA BÀ LẤY TRÊN FIREBASE CONSOLE ---
const firebaseConfig = {
  apiKey: "AIzaSyATJxwJqMYx9iVjNgVnyl2bRTjElG1jmF0",
  authDomain: "tdtt-food-website.firebaseapp.com",
  projectId: "tdtt-food-website",
  storageBucket: "tdtt-food-website.firebasestorage.app",
  messagingSenderId: "1037452134820",
  appId: "1:1037452134820:web:11d7ccb86a0dbb4f321931",
  measurementId: "G-1WGL3ZJLB1",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };