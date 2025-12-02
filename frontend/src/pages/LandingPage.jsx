import React, { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  // 1. LOGIC SLOGAN
  const [slogan, setSlogan] = useState("");
  const funnyQuotes = [
    "Độc lập tự do, ăn no rồi ngủ. 😴",
    "Yêu là phải nói, cũng như đói là phải ăn. 💘",
    "Giảm cân là chuyện ngày mai, hôm nay cứ lai rai đã. 🍗",
    "Tiền là phù du, bò Wagyu là vĩnh cửu. 🥩",
    "Không có tình yêu nào chân thành hơn tình yêu đồ ăn. 🍔",
    "Đừng để cái bụng đói làm phiền não bộ thiên tài của bạn. 🧠",
    "Có thực mới vực được đạo. 😂",
    "Ăn mà ngại là hại bao tử. 🍜"
  ];

  useEffect(() => {
    setSlogan(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]);
  }, []);

  // 2. DATA
  const categories = [
    { name: 'Lẩu', icon: '🍲' }, { name: 'BBQ', icon: '🔥' }, { name: 'Cơm', icon: '🍚' },
    { name: 'Trà sữa', icon: '🧋' }, { name: 'Hải sản', icon: '🦞' }, { name: 'Sushi', icon: '🍣' },
    { name: 'Mì/Phở', icon: '🍜' }, { name: 'Ăn vặt', icon: '🍟' }, { name: 'Pizza', icon: '🍕' },
    { name: 'Burger', icon: '🍔' }, { name: 'Bánh ngọt', icon: '🍰' }, { name: 'Đồ uống', icon: '🍹' },
    { name: 'Chay', icon: '🥗' }, { name: 'Healthy', icon: '🥑' },
  ];

  const restaurants = [
    { id: 1, name: "Hải sản Trần Long", address: "Q1, TPHCM", rating: 9.5, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Hai+San" },
    { id: 2, name: "Kichi Kichi", address: "Q3, TPHCM", rating: 9.5, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Kichi" },
    { id: 3, name: "Bít tết Nha Trang", address: "Q5, TPHCM", rating: 9.5, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Bit+Tet" },
    { id: 4, name: "Gà hấp Đinh Tiên", address: "Q10, TPHCM", rating: 9.5, img: "https://placehold.co/300x200/FFF3E0/E65100?text=Ga+Hap" },
  ];

  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // EMOJI ICON STRING
  const foodIcons = "🍕 🍔 🍟 🌭 🍿 🥓 🥚 🧇 🥞 🍞 🥐 🥨 🥯 🧀 🥗 🥙 🥪 🌮 🌯 🍖 🍗 🥩 🍠 🥟 🥡 🍱 🍙 🍚 🍛 🍜 🍣 🍤 🍥 🍡 🍢 🥘 🍲 🍝 🥧 🍦 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 🍮 🍯 ☕ 🍵 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🧊 🥢 🍽️";

  return (
    <div>
      <Header />
      
      {/* CSS ANIMATION */}
      <style>
        {`
          /* Animation Gradient nền */
          @keyframes gradientBG {
             0% { background-position: 0% 50%; }
             50% { background-position: 100% 50%; }
             100% { background-position: 0% 50%; }
          }

          /* Animation Doodle chạy ngang */
          @keyframes moveRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
          @keyframes moveLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          
          .animated-bg-container {
             /* Gradient 4 màu: Cam Đậm - Vàng - Hồng - Cam Nhạt */
             background: linear-gradient(-45deg, #FF9966, #FF5E62, #FFC043, #E65100);
             background-size: 400% 400%;
             animation: gradientBG 15s ease infinite; /* Đổi màu trong 15s */
             
             position: relative;
             overflow: hidden;
             padding: 80px 0;
             color: white;
          }

          .doodle-row {
            position: absolute;
            left: 0;
            width: 100%;
            display: flex;
            align-items: center;
            overflow: hidden;
            pointer-events: none;
            /* Hiệu ứng bóng ma mờ ảo cho doodle */
            opacity: 0.3; 
            filter: brightness(0) invert(1) blur(1px); 
          }

          .doodle-track {
            white-space: nowrap;
            font-size: 45px;
            padding-right: 50px;
          }
        `}
      </style>

      {/* SEARCH SECTION VỚI GRADIENT & DOODLE */}
      <div className="animated-bg-container">
        
        {/* --- DÒNG 1: Chạy sang Phải --- */}
        <div className="doodle-row" style={{ top: '5%' }}>
           <div className="doodle-track" style={{ animation: 'moveRight 80s linear infinite' }}>
              {foodIcons} {foodIcons} {foodIcons}
           </div>
           <div className="doodle-track" style={{ animation: 'moveRight 80s linear infinite' }}>
              {foodIcons} {foodIcons} {foodIcons}
           </div>
        </div>

        {/* --- DÒNG 2: Chạy sang Trái (So le) --- */}
        <div className="doodle-row" style={{ top: '35%', opacity: 0.25 }}>
           <div className="doodle-track" style={{ animation: 'moveLeft 60s linear infinite' }}>
              {foodIcons} {foodIcons} {foodIcons}
           </div>
           <div className="doodle-track" style={{ animation: 'moveLeft 60s linear infinite' }}>
              {foodIcons} {foodIcons} {foodIcons}
           </div>
        </div>

        {/* --- DÒNG 3: Chạy sang Phải --- */}
        <div className="doodle-row" style={{ top: '65%' }}>
           <div className="doodle-track" style={{ animation: 'moveRight 70s linear infinite' }}>
              {foodIcons} {foodIcons} {foodIcons}
           </div>
           <div className="doodle-track" style={{ animation: 'moveRight 70s linear infinite' }}>
              {foodIcons} {foodIcons} {foodIcons}
           </div>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className="container search-content" style={{position: 'relative', zIndex: 10}}>
            <p style={{
                color: '#fff', fontSize: '20px', fontWeight: '700', fontStyle: 'italic',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)', 
                marginBottom: '25px', background: 'rgba(255,255,255,0.2)', 
                display: 'inline-block', padding: '10px 25px', borderRadius: '30px',
                backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.3)'
            }}>
                "{slogan}"
            </p>

            <div className="search-bar-wrapper">
                <input type="text" placeholder="Hôm nay bạn ăn gì?" className="main-search" />
                <span className="search-icon">🔍</span>
            </div>
            <div className="filter-row">
                <select><option>Khu vực</option></select>
                <select><option>Giá trung bình</option></select>
                <select><option>Món ăn</option></select>
            </div>
        </div>
      </div>

      <main className="container main-content">
        {/* SLIDER DANH MỤC */}
        <div className="category-section">
            <button className="scroll-btn left" onClick={() => scroll('left')}>&#10094;</button>
            <div className="category-container" ref={scrollRef}>
                {categories.map((item, index) => (
                    <Link to={`/category/${item.name}`} key={index} style={{textDecoration:'none', color:'inherit'}}>
                        <div className="cat-item">
                            <div className="cat-circle">{item.icon}</div>
                            <span>{item.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
            <button className="scroll-btn right" onClick={() => scroll('right')}>&#10095;</button>
        </div>

        {/* TOP NHÀ HÀNG */}
        <section>
            <h2 className="section-title">TOP NHÀ HÀNG ĐÁNH GIÁ CAO</h2>
            <div className="card-grid">
                {restaurants.map(res => (
                    <Link to={`/restaurant/${res.id}`} key={res.id} style={{textDecoration:'none', color:'inherit'}}>
                        <div className="card">
                            <img src={res.img} alt={res.name} className="card-img" />
                            <div className="card-body">
                                <h3>{res.name}</h3>
                                <p>📍 {res.address}</p>
                                <div style={{color:'#E65100', fontWeight:'bold'}}>⭐ {res.rating}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* GỢI Ý HÔM NAY */}
        <section>
            <h2 className="section-title">GỢI Ý HÔM NAY</h2>
            <div className="card-grid">
                {restaurants.map((res, idx) => (
                    <Link to={`/restaurant/${res.id}`} key={idx} style={{textDecoration:'none', color:'inherit'}}>
                        <div className="card">
                             <img src={`https://placehold.co/300x200/FFF3E0/E65100?text=Mon+Ngon+${idx+1}`} alt="Mon" className="card-img" />
                            <div className="card-body">
                                <h3>Món Ngon {idx+1}</h3>
                                <p>📍 {res.address}</p>
                                <div style={{color:'#E65100', fontWeight:'bold'}}>⭐ 9.8</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;