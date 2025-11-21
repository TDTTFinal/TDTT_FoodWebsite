// src/pages/History.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const History = () => {
  const [historyList, setHistoryList] = useState([
    {
      id: 1,
      name: "Hải sản Trần Long",
      date: "20/11/2025",
      img: "https://placehold.co/100x100?text=Hai+San",
      address: "Quận 1",
    },
    {
      id: 2,
      name: "Kichi Kichi",
      date: "19/11/2025",
      img: "https://placehold.co/100x100?text=Kichi",
      address: "Quận 3",
    },
  ]);

  return (
    <div className="page-container">
      <Header />

      <div className="history-container">
        <div className="history-header">
          <h2>Lịch sử xem gần đây</h2>
          {historyList.length > 0 && (
            <button onClick={() => setHistoryList([])} className="btn-clear">
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="history-list">
          {historyList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              Trống trơn! <Link to="/">Đi ăn thôi</Link>
            </div>
          ) : (
            historyList.map((item) => (
              <div key={item.id} className="history-item">
                <img src={item.img} alt={item.name} className="history-img" />
                <div style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    {item.address}
                  </p>
                  <p style={{ fontSize: "11px", color: "#999" }}>
                    Xem ngày: {item.date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-copyright">© 2025 No Silent Treatment.</div>
      </footer>
    </div>
  );
};

export default History;
