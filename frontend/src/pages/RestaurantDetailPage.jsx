import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../config/api";
import { MapPin, Clock, DollarSign, Star, ChevronRight, Utensils, MessageSquare, TrendingUp, Heart, Share2, ExternalLink } from "lucide-react";
import ReviewSection from "../components/review/ReviewSection";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Custom restaurant marker
const restaurantIcon = L.divIcon({
  className: 'restaurant-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f97316, #fbbf24);
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 18px;">🍽️</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRestaurantDetail();
  }, [id]);

  const fetchRestaurantDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.get(`/restaurants/${id}`);

      if (result.success && result.data) {
        const data = result.data;
        setRestaurant({
          id: data._id,
          name: data.name,
          address: data.address || "Chưa cập nhật địa chỉ",
          rating: data.avg_rating || 0,
          reviews_count: data.reviews?.length || 0,
          open_time: data.opening_hours || "Đang cập nhật",
          price_range: data.price_range || "Đang cập nhật",
          img:
            data.avatar_url ||
            "https://placehold.co/800x400/FFF3E0/E65100?text=Restaurant",
          description:
            data.reviews?.[0]?.comment ||
            "Nhà hàng với nhiều món ăn ngon, không gian thoáng mát, phục vụ chuyên nghiệp và tận tình.",
          category: data.category || "Khác",
          scores: data.scores || {},
          menu:
            data.menu?.length > 0
              ? data.menu.map((item) => ({
                  name: item.name,
                  price: formatPrice(item.price),
                  img: getMenuEmoji(item.name),
                }))
              : [
                  { name: "Món đặc biệt 1", price: "Liên hệ", img: "🍽️" },
                  { name: "Món đặc biệt 2", price: "Liên hệ", img: "🥘" },
                ],
          reviews:
            data.reviews?.slice(0, 5).map((review) => ({
              user: review.user || "Khách hàng",
              rating: review.rating || 5,
              content: review.comment || "Đánh giá tốt",
              date: formatDate(review.date),
            })) || [],
          // Add coordinates for map
          coordinates: data.location?.coordinates 
            ? [data.location.coordinates[1], data.location.coordinates[0]] // [lat, lon]
            : data.lat && data.lon 
              ? [data.lat, data.lon]
              : null,
        });
      } else {
        throw new Error("Không tìm thấy nhà hàng");
      }
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      setError(err.message || "Không thể tải thông tin nhà hàng");
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    if (typeof price === "number") {
      return price >= 1000 ? `${(price / 1000).toFixed(0)}k` : `${price}đ`;
    }
    return price;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const getMenuEmoji = (name) => {
    const nameLower = (name || "").toLowerCase();
    if (nameLower.includes("phở") || nameLower.includes("mì") || nameLower.includes("bún")) return "🍜";
    if (nameLower.includes("cơm")) return "🍚";
    if (nameLower.includes("gà")) return "🍗";
    if (nameLower.includes("bò") || nameLower.includes("thịt")) return "🥩";
    if (nameLower.includes("tôm") || nameLower.includes("cua") || nameLower.includes("hải sản")) return "🦐";
    if (nameLower.includes("lẩu")) return "🍲";
    if (nameLower.includes("trà") || nameLower.includes("nước")) return "🧋";
    if (nameLower.includes("bánh")) return "🥮";
    return "🍽️";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Đang tải thông tin nhà hàng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <div className="text-7xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy nhà hàng</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Nhà hàng này có thể đã bị xóa hoặc không tồn tại trong hệ thống.
          </p>
          <Link
            to="/explore"
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
          >
            🍽️ Khám phá nhà hàng khác
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={restaurant.img}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://placehold.co/800x400/FFF3E0/E65100?text=Restaurant";
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <ChevronRight size={14} />
              <Link to="/explore" className="hover:text-white transition-colors">Khám phá</Link>
              <ChevronRight size={14} />
              <span className="text-white font-medium truncate max-w-[200px]">{restaurant.name}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all text-white">
            <Heart size={20} />
          </button>
          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all text-white">
            <Share2 size={20} />
          </button>
        </div>

        {/* Restaurant Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            {restaurant.category && (
              <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-bold uppercase tracking-wide rounded-full mb-4">
                {restaurant.category}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={18} />
              <span className="text-sm md:text-base">{restaurant.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Rating Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Star className="text-white" size={28} fill="white" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-800">
                {restaurant.rating > 5 ? restaurant.rating : (restaurant.rating * 2).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">
                {restaurant.reviews_count} đánh giá
              </div>
            </div>
          </div>

          {/* Opening Hours Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={28} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{restaurant.open_time}</div>
              <div className="text-sm text-gray-500">Giờ mở cửa</div>
            </div>
          </div>

          {/* Price Range Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={28} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{restaurant.price_range}</div>
              <div className="text-sm text-gray-500">Khoảng giá</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils size={22} className="text-orange-500" />
                Giới thiệu
              </h2>
              <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
              
              {/* Scores */}
              {restaurant.scores && Object.keys(restaurant.scores).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Điểm chi tiết
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(restaurant.scores).map(([key, value]) =>
                      value > 0 && (
                        <div
                          key={key}
                          className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <span className="text-gray-500 text-sm">{key}: </span>
                          <span className="text-orange-600 font-bold">{value}/5</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Utensils size={22} className="text-orange-500" />
                Thực đơn nổi bật
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {restaurant.menu.map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 text-center hover:shadow-md transition-all border border-orange-100 hover:border-orange-200"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Utensils size={20} className="text-orange-500" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{item.name}</h4>
                    <p className="text-orange-600 font-bold text-lg">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            {/* Reviews Section - New Component */}
            <ReviewSection 
              restaurantId={restaurant.id} 
              restaurantName={restaurant.name} 
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">



            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="h-48">
                {restaurant.coordinates ? (
                  <MapContainer 
                    center={restaurant.coordinates} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={restaurant.coordinates} icon={restaurantIcon}>
                      <Popup>
                        <div className="font-sans text-center p-1">
                          <strong className="text-orange-600">{restaurant.name}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">Chưa có tọa độ</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.address}</p>
                {restaurant.coordinates && (
                  <a 
                    href={`https://www.google.com/maps?q=${restaurant.coordinates[0]},${restaurant.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Mở trong Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 md:p-12 text-center text-white mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Khám phá thêm</h3>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Còn rất nhiều nhà hàng ngon đang chờ bạn khám phá tại Chewz!
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
          >
            <Utensils size={20} />
            Xem thêm nhà hàng
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
