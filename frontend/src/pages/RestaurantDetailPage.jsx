import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer'; // <--- Footer dùng chung

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Mock data chi tiết
    setRestaurant({
      id: id,
      name: "Hải sản Trần Long",
      address: "Số 888, Bến Nghé, Quận 1, TP.HCM",
      rating: 9.5,
      reviews_count: 128,
      open_time: "10:00 - 23:00",
      price_range: "50.000đ - 500.000đ",
      img: "https://placehold.co/800x400/FFF3E0/E65100?text=Hai+San+Tran+Long",
      description: "Nhà hàng hải sản tươi sống bậc nhất Sài Gòn với không gian thoáng mát...",
      menu: [
        { name: "Tôm hùm", price: "150k", img: "🦞" },
        { name: "Cua rang me", price: "200k", img: "🦀" },
        { name: "Lẩu Thái", price: "350k", img: "🍲" },
        { name: "Hàu nướng", price: "20k", img: "🦪" },
      ],
      reviews: [
        { user: "Nguyễn Văn A", rating: 10, content: "Hải sản tươi, nước chấm ngon!", date: "20/11/2025" }
      ]
    });
  }, [id]);

  if (!restaurant) return <div style={{textAlign:'center', padding:'50px'}}>Đang tải...</div>;

  return (
    <div className="page-wrapper">
      <Header />

      <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
        <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <img src={restaurant.img} alt={restaurant.name} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '300px' }}>
                <h1 style={{ color: '#E65100', fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>{restaurant.name}</h1>
                <p style={{ fontSize: '16px', color: '#555', marginBottom: '8px' }}>📍 <b>Địa chỉ:</b> {restaurant.address}</p>
                <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>⏰ <b>Giờ mở:</b> {restaurant.open_time} | 💵 {restaurant.price_range}</p>
                <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #E65100' }}>
                    <p>{restaurant.description}</p>
                </div>
            </div>

            <div style={{ flex: 1, background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', textAlign: 'center', height: 'fit-content' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#E65100' }}>{restaurant.rating}</div>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>trên 10 điểm</div>
                <button className="btn-sm register" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>Viết đánh giá</button>
            </div>
        </div>

        <div style={{ marginTop: '50px' }}>
            <h2 className="section-title">THỰC ĐƠN NỔI BẬT</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                {restaurant.menu.map((item, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>{item.img}</div>
                        <h4 style={{ fontSize: '16px', marginBottom: '5px' }}>{item.name}</h4>
                        <p style={{ color: '#E65100', fontWeight: 'bold' }}>{item.price}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;