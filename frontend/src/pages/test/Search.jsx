//Test Search API
import { useState } from "react";
import "../../styles/auth.css";
import { data } from "react-router-dom";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([])

  async function handlePostQuery() {
    try {
      // Gọi sang Python Backend
      const response = await fetch("http://127.0.0.1:8000/api/v1/search", {
        method: "POST", // 👈 Quan trọng: Phải là POST
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          query: query, //Field thiếu có giá trị mặc định

        }),
      });

      const data = await response.json();
      console.log("Kết quả trả về:", data);
      setResults(data)
      
    } catch (error) {
      console.error("Lỗi gửi query:", error);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signin">
        {/* SEARCH BOX */}
          <div>
            <label>Tìm kiếm</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Nhập nội dung cần tìm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button type="button" onClick={handlePostQuery}>
            BẮT ĐẦU TÌM KIẾM
          </button>

      </div>
    </div>
  );
}

export default Search;
