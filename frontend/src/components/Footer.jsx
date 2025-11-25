import React from 'react';
import '../App.css'; // Đảm bảo nhận CSS chung

const Footer = () => {
  return (
    <footer className="footer-bg">
      <div className="container footer-content">
        <div style={{ flex: 1, minWidth: '200px', marginBottom: '15px' }}>
          <h4 style={{ color: "#FFB74D", marginBottom: "10px" }}>CHEWZ APP</h4>
          <p style={{ fontSize: "14px", color: "#ddd", lineHeight: "1.6" }}>
            Kết nối đam mê ẩm thực.<br/>
            Khám phá hương vị Sài Gòn cùng chúng tôi.
          </p>
        </div>
        
        <div style={{ flex: 1, textAlign: "right", minWidth: '200px' }}>
          <h4 style={{ color: "#fff", fontSize: "16px", marginBottom: "10px" }}>Liên Hệ</h4>
          <p style={{ fontSize: "14px", color: "#ddd", marginBottom: "5px" }}>
            📞 Hotline: <b style={{color:'#fff'}}>0981 669 020</b>
          </p>
          <p style={{ fontSize: "14px", color: "#ddd" }}>
            📧 Email: <b style={{color:'#fff'}}>contact@chewz.vn</b>
          </p>
        </div>
      </div>
      
      {/* Dòng Copyright */}
      <div className="footer-copyright" style={{ 
          textAlign: 'center', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          marginTop: '20px', 
          paddingTop: '15px', 
          fontSize: '13px', 
          color: '#aaa' 
      }}>
        © 2025 Chewz. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;