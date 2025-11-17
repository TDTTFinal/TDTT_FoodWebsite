import { Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage.jsx";
import SignUpPage from "./pages/auth/SignupPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<SignInPage />} />
      <Route path="/register" element={<SignUpPage />} />

      {/* tạm thời, vào root tự redirect sang login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
