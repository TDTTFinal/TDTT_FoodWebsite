// src/pages/History.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const History = () => {
  // Mock data
  const [historyList, setHistoryList] = useState([
    {
      id: 1,
      name: "Hải sản Trần Long",
      date: "20/11/2025",
      img: "https://placehold.co/100x100/FFF3E0/E65100?text=Hai+San",
      address: "Quận 1, TP.HCM",
    },
    {
      id: 2,
      name: "Kichi Kichi",
      date: "19/11/2025",
      img: "https://placehold.co/100x100/FFF3E0/E65100?text=Kichi",
      address: "Quận 3, TP.HCM",
    },
    {
      id: 3,
      name: "Gà hấp Đinh Tiên",
      date: "18/11/2025",
      img: "https://placehold.co/100x100/FFF3E0/E65100?text=Ga+Hap",
      address: "Quận 10, TP.HCM",
    },
  ]);

  return (
    <div className="page-wrapper">
      <Header />

      {/* Container chính để giữ nội dung ở giữa */}
      <div className="container history-container">
        <div className="history-header">
          <h1>Lịch sử xem gần đây</h1>
          {historyList.length > 0 && (
            <button onClick={() => setHistoryList([])} className="btn-clear">
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="history-list">
          {historyList.length === 0 ? (
            <div className="empty-state">
              <p>Bạn chưa xem quán nào gần đây.</p>
              <Link to="/">Khám phá ngay &rarr;</Link>
            </div>
          ) : (
            historyList.map((item) => (
              <div key={item.id} className="history-item">
                <img src={item.img} alt={item.name} className="history-img" />
                <div className="history-info">
                  <h3>{item.name}</h3>
                  <p className="history-address">📍 {item.address}</p>
                  <p className="history-time">🕒 Xem ngày: {item.date}</p>
                </div>
                <div className="history-action">
                  <button className="btn-view">Đặt lại</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="footer-bg">
        <div className="container footer-content">
          <div style={{ flex: 1 }}>
            <h4 style={{ color: "#FFB74D" }}>CHEWZ APP</h4>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <p>© 2025 Chewz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default History;