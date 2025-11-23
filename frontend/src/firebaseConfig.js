// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATJxwJqMYx9iVjNgVnyl2bRTjElG1jmF0",
  authDomain: "tdtt-food-website.firebaseapp.com",
  projectId: "tdtt-food-website",
  storageBucket: "tdtt-food-website.firebasestorage.app",
  messagingSenderId: "1037452134820",
  appId: "1:1037452134820:web:11d7ccb86a0dbb4f321931",
  measurementId: "G-1WGL3ZJLB1",
};

// Khởi tạo app Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth và Provider Google
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
