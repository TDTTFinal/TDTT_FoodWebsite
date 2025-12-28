import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight, Send, Globe, Heart } from 'lucide-react';
import '../App.css'; 

const Footer = () => {
  return (
    <footer className="bg-black text-slate-300 pt-16 pb-8 border-t border-slate-900 font-sans">
      <div className="container mx-auto px-6">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
              CHEWZ
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Khám phá hương vị Sài Gòn theo cách riêng của bạn. Kết nối đam mê, chia sẻ khoảnh khắc và tìm kiếm những địa điểm ăn uống tuyệt vời nhất.
            </p>
            <div className="flex gap-4 pt-2">
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-3 transition-colors border border-slate-800">
                 <div className="text-left">
                   <div className="text-[10px] uppercase font-bold text-gray-500">Download on the</div>
                   <div className="text-sm font-bold leading-none">App Store</div>
                 </div>
              </button>
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-3 transition-colors border border-slate-800">
                 <div className="text-left">
                   <div className="text-[10px] uppercase font-bold text-gray-500">Get it on</div>
                   <div className="text-sm font-bold leading-none">Google Play</div>
                 </div>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Khám phá</h3>
            <ul className="space-y-4">
              <li><Link to="/explore" className="hover:text-orange-500 transition-colors block py-1">Quán ăn mới</Link></li>
              <li><Link to="/food-tour" className="hover:text-orange-500 transition-colors block py-1">Food Tour</Link></li>
              <li><Link to="/collections" className="hover:text-orange-500 transition-colors block py-1">Bộ sưu tập</Link></li>
              <li><Link to="/blog" className="hover:text-orange-500 transition-colors block py-1">Blog ẩm thực</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Công ty</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="hover:text-orange-500 transition-colors block py-1">Về chúng tôi</Link></li>
              {/* <li><Link to="/careers" className="hover:text-orange-500 transition-colors block py-1">Tuyển dụng</Link></li> */}
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors block py-1">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition-colors block py-1">Chính sách bảo mật</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors block py-1">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Đăng ký nhận tin</h3>
            <p className="text-slate-400 mb-4 text-sm">
              Nhận thông báo về quán mới, ưu đãi độc quyền và mẹo ăn uống hàng tuần.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email của bạn..." 
                  className="w-full bg-slate-900 border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Chúng tôi cam kết không spam. Hủy đăng ký bất cứ lúc nào.
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-900 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            © 2025 Chewz Inc. All rights reserved. 
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">Made with <Heart size={12} className="text-red-500 fill-red-500" /> in Saigon</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-white hover:text-black transition-all text-slate-400 border border-slate-800">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-white hover:text-black transition-all text-slate-400 border border-slate-800">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-white hover:text-black transition-all text-slate-400 border border-slate-800">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-white hover:text-black transition-all text-slate-400 border border-slate-800">
              <Globe size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;