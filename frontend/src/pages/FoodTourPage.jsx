// src/pages/FoodTourPage.jsx
// Trang tạo Food Tour mới - UI giống FoodTourEditPage
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, MapPin, Search } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TourBuilder from "../components/foodtour/TourBuilder";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

const FoodTourPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tour data states
  const [tourName, setTourName] = useState("");
  const [tourItems, setTourItems] = useState({
    unsorted: [],
    morning: [],
    lunch: [],
    afternoon: [],
    dinner: [],
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load pending items from localStorage (from AdvancedSearchPage)
  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = () => {
    try {
      const pendingData = localStorage.getItem("pendingTourItems");
      if (pendingData) {
        const pendingItems = JSON.parse(pendingData);
        if (pendingItems.length > 0) {
          // Add cartId to each pending item and add to unsorted
          const itemsWithIds = pendingItems.map(item => ({
            ...item,
            cartId: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9)
          }));
          
          setTourItems(prev => ({
            ...prev,
            unsorted: [...prev.unsorted, ...itemsWithIds]
          }));
          
          setMessage(`✅ Đã thêm ${pendingItems.length} quán mới vào tour`);
          setTimeout(() => setMessage(""), 5000);
          
          // Clear pending items
          localStorage.removeItem("pendingTourItems");
        }
      }
    } catch (err) {
      console.error("Load pending items error:", err);
    }
  };

  // Generate unique ID for items
  const generateId = () => "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);

  // Find container (slot) for an item
  const findContainer = (id) => {
    if (id in tourItems) return id;
    return Object.keys(tourItems).find((key) =>
      tourItems[key].find((item) => item.cartId === id)
    );
  };

  // Drag handlers
  const handleDragStart = (event) => {
    // Nothing special needed for create mode
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTourItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((i) => i.cartId === active.id);
      const overIndex = overItems.findIndex((i) => i.cartId === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.cartId !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = tourItems[activeContainer].findIndex((i) => i.cartId === id);
      const overIndex = tourItems[overContainer].findIndex((i) => i.cartId === overId);

      if (activeIndex !== overIndex) {
        setTourItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
        }));
      }
    }
  };

  // Remove item from tour
  const handleRemove = (itemId) => {
    setTourItems((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((item) => item.cartId !== itemId);
      });
      return next;
    });
  };

  // Calculate total restaurants
  const calculateTotal = () => {
    return (
      tourItems.unsorted.length +
      tourItems.morning.length +
      tourItems.lunch.length +
      tourItems.afternoon.length +
      tourItems.dinner.length
    );
  };

  // Save new tour
  const handleSave = async () => {
    if (!user) {
      setError("Vui lòng đăng nhập để lưu tour");
      navigate("/login");
      return;
    }

    if (!tourName.trim()) {
      setError("Vui lòng nhập tên tour");
      return;
    }

    if (calculateTotal() === 0) {
      setError("Tour chưa có địa điểm nào! Hãy thêm quán từ trang tìm kiếm.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: tourName,
        description: `Tour ${calculateTotal()} điểm ăn uống tại TP.HCM`,
        tourItems: tourItems,
        totalRestaurants: calculateTotal()
      };

      const res = await api.post("/food-tours", payload);

      if (res.success) {
        setMessage("✅ Đã lưu Food Tour thành công!");
        // Navigate to edit page for the new tour
        setTimeout(() => {
          navigate(`/food-tour/${res.tour._id}`);
        }, 1500);
      } else {
        setError(res.message || "Lưu thất bại");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Lỗi khi lưu: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Navigate to AdvancedSearchPage to add restaurants
  const handleAddRestaurants = () => {
    navigate("/search-advanced?addToTour=new");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Back Button + Title */}
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-2 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Quay về Trang chủ</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              🗺️ Tạo Food Tour mới
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Thêm nhà hàng từ trang tìm kiếm, sau đó kéo thả để sắp xếp theo các buổi trong ngày
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRestaurants}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Search size={18} />
              Tìm quán để thêm
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Tour Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Chưa sắp xếp", count: tourItems.unsorted.length, color: "bg-gray-100 text-gray-600" },
            { label: "Buổi sáng", count: tourItems.morning.length, color: "bg-green-100 text-green-600" },
            { label: "Buổi trưa", count: tourItems.lunch.length, color: "bg-yellow-100 text-yellow-600" },
            { label: "Buổi chiều", count: tourItems.afternoon.length, color: "bg-orange-100 text-orange-600" },
            { label: "Buổi tối", count: tourItems.dinner.length, color: "bg-purple-100 text-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Empty State - Guide user to add restaurants */}
        {calculateTotal() === 0 && (
          <div className="mb-6 p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={40} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bắt đầu tạo Food Tour</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Click nút bên dưới để tìm kiếm và thêm các nhà hàng vào tour của bạn.
              Sau đó kéo thả để sắp xếp theo buổi sáng, trưa, chiều, tối.
            </p>
            <button
              onClick={handleAddRestaurants}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
            >
              <Search size={20} />
              Tìm nhà hàng để thêm
            </button>
          </div>
        )}

        {/* TourBuilder Component - Only show when there are items */}
        {calculateTotal() > 0 && (
          <TourBuilder
            tourItems={tourItems}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onRemove={handleRemove}
            tourName={tourName}
            setTourName={setTourName}
            onSave={handleSave}
            isSaving={saving}
          />
        )}

        {/* Bottom Save Bar (Fixed) - Only show when there are items */}
        {calculateTotal() > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-orange-500" />
                <span className="font-semibold">{calculateTotal()} địa điểm</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !user}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Đang lưu..." : "Lưu Food Tour"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spacer for fixed bottom bar */}
        {calculateTotal() > 0 && <div className="h-24"></div>}
      </div>

      <Footer />
    </div>
  );
};

export default FoodTourPage;
