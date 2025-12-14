// src/pages/FoodTourPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from '../config/api'; // Import api instance
import { useAuth } from '../context/AuthContext'; // Import auth context
// import restaurantsData from "../data/restaurants.json"; // nếu chưa có API

const TIME_SLOTS = [
  { id: "morning", label: "Buổi sáng" },
  { id: "noon", label: "Buổi trưa" },
  { id: "afternoon", label: "Buổi chiều" },
  { id: "evening", label: "Buổi tối" },
];

const FoodTourPage = () => {
  const { user } = useAuth(); // Get user from auth
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [foodTour, setFoodTour] = useState({
    morning: [],
    noon: [],
    afternoon: [],
    evening: [],
    unsorted: [] // Added unsorted to match schema default
  });
  const [tourName, setTourName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // ===== LẤY DATA NHÀ HÀNG =====
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/restaurants");
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
        // fallback demo
        // setRestaurants(restaurantsData);
      }
    };
    fetchRestaurants();
  }, []);

  // ===== HÀM XỬ LÝ =====
  const addToSlot = (restaurant, slotId) => {
    setFoodTour((prev) => {
      const already = prev[slotId].some((r) => r._id === restaurant._id);
      if (already) return prev; // tránh trùng
      return {
        ...prev,
        [slotId]: [...prev[slotId], restaurant],
      };
    });
  };

  const removeFromSlot = (slotId, restaurantId) => {
    setFoodTour((prev) => ({
      ...prev,
      [slotId]: prev[slotId].filter((r) => r._id !== restaurantId),
    }));
  };

  const getAllSelectedRestaurants = () => {
    const all = [
      ...foodTour.morning,
      ...foodTour.noon,
      ...foodTour.afternoon,
      ...foodTour.evening,
    ];
    // loại trùng
    const uniqueById = {};
    all.forEach((r) => {
      uniqueById[r._id] = r;
    });
    return Object.values(uniqueById);
  };

  // ===== NÚT LƯU FOOD TOUR =====
  const handleSaveTour = async () => {
    if (!user) {
      setSaveMessage("⚠️ Vui lòng đăng nhập để lưu Food Tour.");
      return;
    }

    if (!tourName.trim()) {
      setSaveMessage("⚠️ Nhập tên tour trước đã nha.");
      return;
    }

    // Calculate total restaurants
    const totalRestaurants = 
      foodTour.morning.length + 
      foodTour.noon.length + 
      foodTour.afternoon.length + 
      foodTour.evening.length;

    const payload = {
      name: tourName,
      description: `Tour ${totalRestaurants} điểm ăn uống tại TP.HCM`, // Auto description or add input later
      tourItems: foodTour, // Send entire state object
      totalRestaurants
    };

    try {
      setSaving(true);
      setSaveMessage("");

      // Use api instance which handles base URL and auth tokens
      const res = await api.post("/food-tours", payload);

      if (res.success) {
        setSaveMessage("✅ Đã lưu Food tour! Xem trong Profile.");
        // Optional: redirect to profile
        // setTimeout(() => navigate('/profile'), 1500);
      } else {
        throw new Error(res.message || "Lưu thất bại");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("❌ Lỗi khi lưu tour: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ===== CENTER MAP =====
  const selected = getAllSelectedRestaurants();
  const defaultCenter = [10.776889, 106.700806]; // toạ độ mặc định Q1
  const firstSelected = selected[0];
  const mapCenter = firstSelected
    ? [firstSelected.lat, firstSelected.lng]
    : defaultCenter;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Demo tạo Food tour (thủ công)
            </h1>
            <p className="text-slate-500 text-sm">
              Chọn quán ở bên trái, thêm vào buổi sáng / trưa / chiều / tối. Map
              sẽ tự hiển thị vị trí các điểm trong tour.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="border rounded-lg px-3 py-1 text-sm"
              placeholder="Tên Food tour, ví dụ: Q1 cuối tuần"
              value={tourName}
              onChange={(e) => setTourName(e.target.value)}
            />
            <button
              onClick={handleSaveTour}
              disabled={saving}
              className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu Food tour"}
            </button>
          </div>
        </header>

        {saveMessage && (
          <div className="text-sm text-slate-700 bg-slate-100 px-3 py-2 rounded-lg">
            {saveMessage}
          </div>
        )}

        {/* Layout chính */}
        <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] gap-6">
          {/* Cột trái: danh sách nhà hàng */}
          <section className="bg-white rounded-2xl shadow-sm border p-4 space-y-3 overflow-y-auto max-h-[70vh]">
            <h2 className="font-semibold text-lg mb-1">
              Danh sách nhà hàng (demo)
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              Dữ liệu lấy từ dataset (HuggingFace / DB). Mỗi card có nút thêm
              vào từng buổi.
            </p>
            {restaurants.map((r) => (
              <article
                key={r._id}
                className="border rounded-xl p-3 mb-2 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">{r.name}</h3>
                  {r.rating && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      ⭐ {r.rating.toFixed ? r.rating.toFixed(1) : r.rating}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{r.address}</p>
                <p className="text-[11px] text-slate-500">
                  Giờ mở cửa: {r.openTime} - {r.closeTime}
                </p>
                {/* Tag demo */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {/* Nút thêm vào buổi */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => addToSlot(r, slot.id)}
                      className="text-[11px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                    >
                      Thêm vào {slot.label.toLowerCase()}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>

          {/* Cột phải: tour + map */}
          <section className="flex flex-col gap-4">
            {/* 4 khung buổi */}
            <div className="grid md:grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white border rounded-2xl p-3 shadow-sm min-h-[120px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{slot.label}</h3>
                    <span className="text-[11px] text-slate-400">
                      {foodTour[slot.id].length} điểm
                    </span>
                  </div>

                  {foodTour[slot.id].length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Chưa có quán nào. Thêm từ cột bên trái.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {foodTour[slot.id].map((r) => (
                        <li
                          key={r._id}
                          className="flex justify-between items-center text-xs border rounded-lg px-2 py-1"
                        >
                          <span className="truncate max-w-[70%]">{r.name}</span>
                          <button
                            onClick={() => removeFromSlot(slot.id, r._id)}
                            className="text-[11px] text-red-500 hover:underline"
                          >
                            Xoá
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-white border rounded-2xl p-3 shadow-sm h-[320px]">
              <h3 className="font-semibold text-sm mb-2">Bản đồ Food tour</h3>
              <p className="text-[11px] text-slate-500 mb-2">
                Hiển thị vị trí tất cả các quán đã chọn. Sau này có thể vẽ
                polyline route.
              </p>
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-[260px] rounded-xl"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selected.map((r) => (
                  <Marker key={r._id} position={[r.lat, r.lng]}>
                    <Popup>
                      <strong>{r.name}</strong>
                      <br />
                      {r.address}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FoodTourPage;
