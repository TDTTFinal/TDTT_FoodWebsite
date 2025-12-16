// src/pages/FoodTourEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, RefreshCw, MapPin } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TourBuilder from "../components/foodtour/TourBuilder";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

const FoodTourEditPage = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tour data states
  const [tour, setTour] = useState(null);
  const [tourName, setTourName] = useState("");
  const [tourItems, setTourItems] = useState({
    unsorted: [],
    morning: [],
    lunch: [],
    afternoon: [],
    dinner: [],
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load tour on mount or when tourId changes
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadTour();
  }, [tourId, user]);

  // Separate effect: Check for pending items ONLY when window regains focus
  // AFTER tour data is already loaded (to avoid race conditions)
  useEffect(() => {
    // Only set up focus listener after tour is loaded
    if (!tour) return;
    
    const checkPendingOnFocus = () => {
      const pendingData = localStorage.getItem("pendingTourItems");
      if (pendingData) {
        console.log("[FoodTourEdit] Found pending items on window focus", pendingData);
        // Use current tourItems state since tour is already loaded
        loadPendingItems(null);
      }
    };
    
    // Add focus listener for when user switches back to this tab
    window.addEventListener('focus', checkPendingOnFocus);
    return () => window.removeEventListener('focus', checkPendingOnFocus);
  }, [tour]); // Only after tour is loaded

  const loadTour = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get(`/food-tours/${tourId}`);
      
      if (res.success && res.tour) {
        setTour(res.tour);
        setTourName(res.tour.name || "");
        
        // Map tourItems from API
        const items = res.tour.tourItems || {};
        const loadedItems = {
          unsorted: items.unsorted || [],
          morning: items.morning || [],
          lunch: items.lunch || items.noon || [],
          afternoon: items.afternoon || [],
          dinner: items.dinner || items.evening || [],
        };
        
        setTourItems(loadedItems);
        
        // Now check for pending items AFTER tour is loaded
        // Pass loadedItems to ensure we merge with fresh data
        setTimeout(() => loadPendingItems(loadedItems), 100);
      } else {
        setError("Không tìm thấy tour");
      }
    } catch (err) {
      console.error("Load tour error:", err);
      setError("Lỗi tải tour: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Load pending items from localStorage (from AdvancedSearchPage)
  // Accepts loadedItems to merge with already-loaded tour data
  const loadPendingItems = (loadedItems = null) => {
    try {
      const pendingData = localStorage.getItem("pendingTourItems");
      if (pendingData) {
        const pendingItems = JSON.parse(pendingData);
        if (pendingItems.length > 0) {
          // Add cartId to each pending item
          const itemsWithIds = pendingItems.map(item => ({
            ...item,
            cartId: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9)
          }));
          
          // Merge with existing data (use loadedItems if provided, else current state)
          setTourItems(prev => {
            const base = loadedItems || prev;
            return {
              ...base,
              unsorted: [...(base.unsorted || []), ...itemsWithIds]
            };
          });
          
          setHasChanges(true);
          setMessage(`✅ Đã thêm ${pendingItems.length} quán mới vào tour`);
          setTimeout(() => setMessage(""), 3000);
          
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
    setHasChanges(true);
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
    setHasChanges(true);
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

  // Save tour changes
  const handleSave = async () => {
    if (!tourName.trim()) {
      setError("Vui lòng nhập tên tour");
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

      const res = await api.put(`/food-tours/${tourId}`, payload);

      if (res.success) {
        setMessage("✅ Đã lưu thay đổi thành công!");
        setHasChanges(false);
        setTimeout(() => setMessage(""), 3000);
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

  // Delete tour
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tour này? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      const res = await api.delete(`/food-tours/${tourId}`);
      if (res.success) {
        navigate("/profile", { state: { message: "Đã xóa tour thành công" } });
      } else {
        setError("Xóa tour thất bại");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Lỗi khi xóa tour");
    }
  };

  // Navigate to AdvancedSearchPage to add more restaurants
  const handleAddRestaurants = () => {
    // Save current state to localStorage if there are changes
    if (hasChanges) {
      if (!window.confirm("Bạn có thay đổi chưa lưu. Tiếp tục sẽ mất các thay đổi. Lưu trước?")) {
        handleSave();
      }
    }
    navigate(`/search-advanced?addToTour=${tourId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải tour...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error && !tour) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay về Profile
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Back Button + Title */}
          <div>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-2 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Quay về Profile</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Chỉnh sửa Food Tour
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kéo thả để sắp xếp, thêm hoặc xóa nhà hàng trong tour
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRestaurants}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Thêm quán mới
            </button>
            <button
              onClick={loadTour}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Tải lại dữ liệu gốc"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} />
              Xóa tour
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

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-between">
            <span>⚠️ Bạn có thay đổi chưa lưu</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu ngay"}
            </button>
          </div>
        )}

        {/* TourBuilder Component */}
        <TourBuilder
          tourItems={tourItems}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onRemove={handleRemove}
          tourName={tourName}
          setTourName={(name) => {
            setTourName(name);
            setHasChanges(true);
          }}
          onSave={handleSave}
          isSaving={saving}
        />

        {/* Bottom Save Bar (Fixed) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} className="text-orange-500" />
              <span className="font-semibold">{calculateTotal()} địa điểm</span>
              {hasChanges && (
                <span className="text-amber-500 text-sm">(chưa lưu)</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-24"></div>
      </div>

      <Footer />
    </div>
  );
};

export default FoodTourEditPage;
