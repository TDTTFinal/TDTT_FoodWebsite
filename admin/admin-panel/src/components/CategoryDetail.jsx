import React, { useState, useEffect } from "react";
import { Store, MapPin, Star, Edit2, Check, X, ArrowRight } from "lucide-react";

export default function CategoryDetail({ category, allCategories, onClose }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Quick Edit State
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (category) {
      fetchRestaurants();
    }
  }, [category]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/admin/restaurants?category=${encodeURIComponent(
          category.name
        )}&limit=100`
      );
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants for category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (restaurant) => {
    setEditingId(restaurant._id);
    setNewCategory(restaurant.category || category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewCategory("");
  };

  const handleUpdateCategory = async (restaurantId) => {
    if (!newCategory) return;
    
    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:5000/api/admin/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Remove from list if category changed to something else
        if (newCategory !== category.name) {
             setRestaurants(prev => prev.filter(r => r._id !== restaurantId));
        } else {
            // Just update local state if same category (unlikely logic but safe)
             setRestaurants(prev => prev.map(r => r._id === restaurantId ? { ...r, category: newCategory } : r));
        }
        setEditingId(null);
      } else {
        alert(data.message || "Lỗi cập nhật");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Lỗi kết nối");
    } finally {
      setUpdating(false);
    }
  };

  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Store size={24} />
              </span>
              {category.name}
            </h2>
            <p className="text-slate-500 mt-1 pl-12">
              Danh sách nhà hàng thuộc danh mục này ({restaurants.length})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Chưa có nhà hàng nào trong danh mục này.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {restaurants.map((r) => (
                <div
                  key={r._id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center group"
                >
                  <img
                    src={
                      r.image ||
                      "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image"
                    }
                    alt={r.name}
                    className="w-20 h-20 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate text-lg">
                      {r.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin size={14} />
                      {r.address}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                        <Star size={12} fill="currentColor" />
                        {r.rating || "N/A"}
                      </span>
                      {/* Show current category/action */}
                      {editingId === r._id ? (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                              <ArrowRight size={14} className="text-slate-400" />
                              <select 
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="text-sm p-1.5 border border-indigo-200 rounded-md bg-indigo-50 text-indigo-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                  {allCategories?.map(c => (
                                      <option key={c._id} value={c.name}>{c.name}</option>
                                  ))}
                              </select>
                              <button 
                                onClick={() => handleUpdateCategory(r._id)}
                                disabled={updating}
                                className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50"
                                title="Lưu"
                              >
                                  <Check size={16} />
                              </button>
                               <button 
                                onClick={handleCancelEdit}
                                disabled={updating}
                                className="p-1.5 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-colors"
                                title="Hủy"
                              >
                                  <X size={16} />
                              </button>
                          </div>
                      ) : (
                          <button
                            onClick={() => handleStartEdit(r)}
                            className="hidden group-hover:flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors"
                          >
                             <Edit2 size={12} />
                             Đổi danh mục
                          </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end">
           <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
