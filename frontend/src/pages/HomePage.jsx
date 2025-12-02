import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext'; 
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth(); 
  const [slogan, setSlogan] = useState("");

  // 1. KHO TÀNG CA DAO TỤC NGỮ VỀ ĂN UỐNG
  const funnyQuotes = [
    "Độc lập tự do, ăn no rồi ngủ. 😴",
    "Yêu là phải nói, cũng như đói là phải ăn. 💘",
    "Giảm cân là chuyện ngày mai, hôm nay cứ lai rai đã. 🍗",
    "Tiền là phù du, bò Wagyu là vĩnh cửu. 🥩",
    "Không có tình yêu nào chân thành hơn tình yêu đồ ăn. 🍔",
    "Đừng để cái bụng đói làm phiền não bộ thiên tài của bạn. 🧠",
    "Có thực mới vực được đạo (và vực được cả tâm trạng). 😂",
    "Ăn mà ngại là hại bao tử. 🍜"
  ];

  // 2. Random slogan mỗi khi vào trang
  useEffect(() => {
    const randomQuote = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
    setSlogan(randomQuote);
  }, []);

  const recommended = [
    { id: 1, name: "Cơm Tấm Sà Bì Chưởng", address: "Q1, TPHCM", rating: 9.8, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Com+Tam" },
    { id: 2, name: "Phở Lệ", address: "Q5, TPHCM", rating: 9.5, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Pho+Le" },
    { id: 3, name: "Bún Bò Gánh", address: "Q3, TPHCM", rating: 9.6, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Bun+Bo" },
    { id: 4, name: "Pizza 4P's", address: "Q1, TPHCM", rating: 9.9, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Pizza" },
  ];

  return (
    <div>
      <Header />

      {/* BANNER CHÀO MỪNG */}
      <div style={{ background: 'linear-gradient(135deg, #FFC043 0%, #FF8B3D 100%)', padding: '50px 0', color: '#fff' }}>
        <div className="container">
            <h1 style={{fontSize: '32px', marginBottom: '10px', fontWeight: '800'}}>
                Xin chào, {user?.name || "Bạn mình ơi"}! 👋
            </h1>
            
            {/* --- SLOGAN HÀI HƯỚC --- */}
            <p style={{
                fontSize: '18px', 
                opacity: 0.95, 
                fontStyle: 'italic', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'inline-block', 
                padding: '5px 15px', 
                borderRadius: '20px',
                marginTop: '5px'
            }}>
                "{slogan}"
            </p>
            
            {/* Ô tìm kiếm nhanh */}
            <div style={{marginTop: '25px', position: 'relative', maxWidth: '600px'}}>
                <input 
                    type="text" 
                    placeholder="Tìm món ngon, nhà hàng..." 
                    style={{width: '100%', padding: '15px 25px', borderRadius: '50px', border: 'none', outline: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', fontSize: '15px'}} 
                />
                <span style={{position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', cursor: 'pointer'}}>🔍</span>
            </div>
        </div>
      </div>

      <main className="container main-content">
        <section>
            <h2 className="section-title">Gợi ý riêng cho bạn</h2>
            <div className="card-grid">
                {recommended.map(res => (
                    <Link to={`/restaurant/${res.id}`} key={res.id} style={{textDecoration:'none', color:'inherit'}}>
                        <div className="card">
                            <img src={res.img} alt={res.name} className="card-img" />
                            <div className="card-body">
                                <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'5px'}}>{res.name}</h3>
                                <p style={{fontSize:'12px', color:'#666'}}>📍 {res.address}</p>
                                <div style={{fontSize:'12px', marginTop:'8px', color:'#E65100', fontWeight:'bold'}}>
                                    ⭐ {res.rating} (Rất phù hợp)
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        <section style={{marginTop: '50px', textAlign: 'center', padding: '40px', background: '#FFF3E0', borderRadius: '20px'}}>
            <h3 style={{color: '#E65100', marginBottom: '15px'}}>Chưa biết ăn gì?</h3>
            <p style={{marginBottom: '20px', color: '#555'}}>Để Chewz chọn đại một quán, ngon thì khen dở thì... thôi nhé!</p>
            <button className="btn-sm register" style={{padding: '12px 30px', fontSize: '16px'}}>🎲 Chọn giúp tôi</button>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;