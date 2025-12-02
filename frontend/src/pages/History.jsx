import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer'; // <--- Import Footer dùng chung
import { Link } from 'react-router-dom';

const History = () => {
  // Mock data giả lập lịch sử
  const [historyList, setHistoryList] = useState([
    { id: 1, name: "Hải sản Trần Long", date: "20/11/2025", img: "https://placehold.co/100x100/FFF3E0/E65100?text=Hai+San", address: "Quận 1, TP.HCM" },
    { id: 2, name: "Kichi Kichi", date: "19/11/2025", img: "https://placehold.co/100x100/FFF3E0/E65100?text=Kichi", address: "Quận 3, TP.HCM" },
    { id: 3, name: "Gà hấp Đinh Tiên", date: "18/11/2025", img: "https://placehold.co/100x100/FFF3E0/E65100?text=Ga+Hap", address: "Quận 10, TP.HCM" },
  ]);

  return (
    <div className="page-wrapper">
      <Header />

      <div className="container history-container">
        <div className="history-header">
            <h1>Lịch sử xem gần đây</h1>
            {historyList.length > 0 && (
                <button onClick={() => setHistoryList([])} className="btn-clear">Xóa tất cả</button>
            )}
        </div>

        <div className="history-list">
            {historyList.length === 0 ? (
                <div className="empty-state">
                    <p>Bạn chưa xem quán nào gần đây.</p>
                    <Link to="/">Khám phá ngay &rarr;</Link>
                </div>
            ) : (
                historyList.map(item => (
                    <div key={item.id} className="history-item">
                        <img src={item.img} alt={item.name} className="history-img" />
                        <div className="history-info">
                            <h3>{item.name}</h3>
                            <p className="history-address">📍 {item.address}</p>
                            <p className="history-time">🕒 Xem ngày: {item.date}</p>
                        </div>
                        <div className="history-action">
                            {/* Bấm vào Đặt lại sẽ chuyển sang trang chi tiết nhà hàng */}
                            <Link to={`/restaurant/${item.id}`} className="btn-view" style={{textDecoration:'none', display:'inline-block', textAlign:'center'}}>
                                Đặt lại
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
      
      {/* SỬ DỤNG COMPONENT FOOTER MỚI */}
      <Footer />
    </div>
  );
};

export default History;