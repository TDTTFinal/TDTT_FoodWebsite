// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// --- THAY CÁI NÀY BẰNG MÃ CỦA BÀ LẤY TRÊN FIREBASE CONSOLE ---
const firebaseConfig = {
  apiKey: "AIzaSyATJxwJqMYx9iVjNgVnyl2bRTjElG1jmF0", // Copy từ Firebase của bà
  authDomain: "chewz-app.firebaseapp.com",
  projectId: "chewz-app",
  storageBucket: "chewz-app.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };