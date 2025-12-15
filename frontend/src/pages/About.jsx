// src/pages/About.jsx
// Professional About Page matching website style
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, Users, Star, Heart, 
  Mail, Phone, Clock, Send, 
  ChefHat, Utensils, Coffee, Award,
  ArrowRight, Check
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../config/api";

const About = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/about/contact", formData);

      if (res.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Lỗi gửi thư:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { value: "500+", label: "Đối tác nhà hàng", icon: ChefHat },
    { value: "10K+", label: "Thực khách tin dùng", icon: Users },
    { value: "4.9/5", label: "Đánh giá trung bình", icon: Star },
    { value: "24/7", label: "Hỗ trợ khách hàng", icon: Clock },
  ];

  const features = [
    {
      icon: Utensils,
      title: "Đa dạng ẩm thực",
      desc: "Từ Phở Hà Nội đến BBQ Hàn Quốc, mọi hương vị đều có tại Chewz",
    },
    {
      icon: MapPin,
      title: "Tìm quán gần bạn",
      desc: "Công nghệ định vị thông minh giúp bạn khám phá quán ăn quanh đây",
    },
    {
      icon: Coffee,
      title: "Food Tour độc đáo",
      desc: "Lên kế hoạch ăn uống cả ngày với tính năng Food Tour thông minh",
    },
    {
      icon: Award,
      title: "Đánh giá chân thực",
      desc: "Hàng ngàn review từ thực khách giúp bạn chọn đúng nơi",
    },
  ];

  const team = [
    { name: "Nguyễn Trường Sơn", role: "Founder & CEO", emoji: "👨‍💼" },
    { name: "Team TDTT", role: "Development Team", emoji: "👩‍💻" },
    { name: "Cộng đồng Chewz", role: "Nguồn cảm hứng", emoji: "❤️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6 animate-pulse">
            <Heart size={16} className="fill-white" />
            Chewz - Kết nối qua hương vị
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Về Chúng Tôi
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            Hành trình mang hương vị ẩm thực Sài Gòn đến gần bạn hơn. 
            Từ phở sáng đến lẩu tối, Chewz là bạn đồng hành tin cậy!
          </p>
          
          <Link
            to="/search-advanced"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 hover:scale-105 transition-all shadow-lg"
          >
            Khám phá ngay
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="text-orange-600" size={24} />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 text-sm font-bold rounded-full mb-4">
                Câu chuyện của chúng tôi
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 leading-tight">
                Chewz - Sản phẩm của 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> niềm đam mê ẩm thực</span>
              </h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                Được thành lập vào năm 2025, <strong className="text-orange-600">Chewz</strong> không chỉ là một ứng dụng tìm kiếm nhà hàng. 
                Chúng tôi là người bạn đồng hành sành ăn, giúp bạn khám phá những góc ẩm thực tuyệt vời nhất tại Sài Gòn.
              </p>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Sứ mệnh của chúng tôi là kết nối con người qua những bữa ăn ngon, với tông màu cam rực rỡ 
                tượng trưng cho sự nhiệt huyết và hương vị bùng nổ.
              </p>
              
              {/* Checklist */}
              <div className="space-y-3">
                {["Tìm kiếm thông minh với AI", "Food Tour cá nhân hóa", "Review từ cộng đồng thực khách"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-2xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
                alt="Restaurant ambiance"
                className="relative rounded-3xl shadow-2xl w-full object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Heart className="text-orange-600 fill-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-800">2025</p>
                    <p className="text-xs text-gray-500">Thành lập</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-orange-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 text-sm font-bold rounded-full mb-4">
              Tính năng nổi bật
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
              Tại sao chọn Chewz?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Chúng tôi không chỉ giúp bạn tìm quán ăn, mà còn mang đến trải nghiệm ẩm thực hoàn hảo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-gray-500 text-lg">
              Những con người đam mê tạo nên Chewz
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all w-64"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">
                  {member.emoji}
                </div>
                <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                <p className="text-orange-600 text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Info */}
            <div className="text-white">
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-sm font-bold rounded-full mb-4">
                Liên hệ
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                Kết nối với chúng tôi
              </h2>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                Bạn có câu hỏi, góp ý hay muốn hợp tác? Đừng ngần ngại liên hệ với đội ngũ Chewz!
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Email</p>
                    <p className="font-semibold">ntson2434@clc.fitus.edu.vn</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Hotline</p>
                    <p className="font-semibold">1900 123 456</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Địa chỉ</p>
                    <p className="font-semibold">Trường Đại học KHTN, TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Cảm ơn bạn!</h3>
                  <p className="text-gray-500">Chúng tôi đã nhận được thư và sẽ phản hồi sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Gửi tin nhắn</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Chủ đề</label>
                    <input
                      required
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Vd: Hợp tác / Góp ý..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Nhập nội dung tin nhắn..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      "Đang gửi..."
                    ) : (
                      <>
                        <Send size={18} />
                        Gửi tin nhắn
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
