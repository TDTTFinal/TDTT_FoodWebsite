import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CategoryPage = () => {
  const { slug } = useParams(); // Lấy tên danh mục từ URL (ví dụ: "Lẩu")
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Yêu cầu của bà: 50 quán / trang

  // 1. Giả lập dữ liệu (Tạo tự động 120 quán để test phân trang)
  useEffect(() => {
    // Reset về trang 1 khi đổi danh mục
    setCurrentPage(1);
    window.scrollTo(0, 0);

    const mockData = [];
    // Tạo 125 quán giả
    for (let i = 1; i <= 125; i++) {
      mockData.push({
        id: i,
        name: `${slug} Ngon Số ${i}`, // Tên quán theo danh mục
        address: `Hẻm ${i}, Quận ${(i % 10) + 1}, TP.HCM`,
        rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Random điểm từ 3.5 đến 5.0
        img: `https://placehold.co/300x200/FFF3E0/E65100?text=${slug}+${i}`
      });
    }
    setRestaurants(mockData);
  }, [slug]);

  // 2. Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRestaurants = restaurants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(restaurants.length / itemsPerPage);

  // Hàm đổi trang
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu khi chuyển trang
  };

  return (
    <div className="page-wrapper">
      <Header />

      {/* BANNER DANH MỤC */}
      <div style={{ background: '#FFF3E0', padding: '40px 0', textAlign: 'center' }}>
        <div className="container">
            <h1 style={{ color: '#E65100', textTransform: 'capitalize' }}>
                Khám phá món: {slug} 😋
            </h1>
            <p>Tìm thấy <b>{restaurants.length}</b> địa điểm hấp dẫn cho bạn.</p>
        </div>
      </div>

      <main className="container main-content" style={{ marginTop: '40px', marginBottom: '40px' }}>
        
        {/* DANH SÁCH QUÁN (GRID) */}
        <div className="card-grid">
            {currentRestaurants.map((res) => (
                <Link to={`/restaurant/${res.id}`} key={res.id} style={{textDecoration:'none', color:'inherit'}}>
                    <div className="card">
                        <img src={res.img} alt={res.name} className="card-img" />
                        <div className="card-body">
                            <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'5px'}}>{res.name}</h3>
                            <p style={{fontSize:'12px', color:'#666'}}>📍 {res.address}</p>
                            <div style={{fontSize:'12px', marginTop:'8px', color:'#E65100', fontWeight:'bold'}}>
                                ⭐ {res.rating}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        {/* BỘ NÚT PHÂN TRANG */}
        {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '50px' }}>
                {/* Nút Previous */}
                <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    style={{
                        padding: '10px 15px', 
                        border: '1px solid #ddd', 
                        borderRadius: '5px', 
                        background: currentPage === 1 ? '#f5f5f5' : '#fff',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    &laquo; Trước
                </button>

                {/* Số trang */}
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #E65100',
                            borderRadius: '5px',
                            background: currentPage === i + 1 ? '#E65100' : '#fff',
                            color: currentPage === i + 1 ? '#fff' : '#E65100',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}

                {/* Nút Next */}
                <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '10px 15px', 
                        border: '1px solid #ddd', 
                        borderRadius: '5px', 
                        background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                >
                    Sau &raquo;
                </button>
            </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;