import React, { useState, useEffect } from "react";
import CategoryDetail from "../components/CategoryDetail";
import { Plus, RefreshCw, Edit3, Eye, EyeOff, Trash2, FolderOpen, Utensils } from "lucide-react";

const ActionButtons = ({ onEdit, onHide, onDelete, isHidden }) => (
  <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
    <button
      onClick={onEdit}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all text-sm font-medium"
    >
      <Edit3 size={14} />
      Sửa
    </button>
    <button
      onClick={onHide}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all text-sm font-medium"
    >
      {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
      {isHidden ? "Hiện" : "Ẩn"}
    </button>
    <button
      onClick={onDelete}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all text-sm font-medium"
    >
      <Trash2 size={14} />
      Xóa
    </button>
  </div>
);



function AddCategoryForm({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [foodIds, setFoodIds] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  async function fetchFoods() {
    try {
      const res = await fetch("http://localhost:4000/api/foods");
      if (!res.ok) throw new Error("Lỗi khi tải món ăn");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      setFoods([]);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate({ name, foodIds });
      setName("");
      setFoodIds([]);
      onClose();
    } catch (err) {
      setError(err.message || "Lỗi khi thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded shadow-lg p-6 w-full max-w-md z-10"
      >
        <h2 className="text-xl font-bold mb-4">Thêm danh mục mới</h2>
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label className="block mb-1 font-semibold">Tên danh mục</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-semibold">
            Chọn các món ăn thuộc loại này
          </label>
          <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto bg-gray-50">
            {foods.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có món ăn nào</p>
            ) : (
              foods.map((food) => (
                <label key={food.id} className="flex items-center py-1">
                  <input
                    type="checkbox"
                    checked={foodIds.includes(String(food.id))}
                    onChange={(e) => {
                      const foodId = String(food.id);
                      if (e.target.checked) {
                        setFoodIds([...foodIds, foodId]);
                      } else {
                        setFoodIds(foodIds.filter((id) => id !== foodId));
                      }
                    }}
                    className="mr-2"
                  />
                  <span>{food.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded bg-white"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-sky-200 rounded hover:bg-sky-300 disabled:opacity-50"
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditCategoryForm({ category, onClose, onSave }) {
  const [name, setName] = useState(category.name);
  const [foodIds, setFoodIds] = useState(category.foodIds || []);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  async function fetchFoods() {
    try {
      const res = await fetch("http://localhost:4000/api/foods");
      if (!res.ok) throw new Error("Lỗi khi tải món ăn");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      setFoods([]);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave({ name, foodIds });
      onClose();
    } catch (err) {
      setError(err.message || "Lỗi khi cập nhật danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded shadow-lg p-6 w-full max-w-md z-10"
      >
        <h2 className="text-xl font-bold mb-4">Sửa danh mục</h2>
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label className="block mb-1 font-semibold">Tên danh mục</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-semibold">
            Chọn các món ăn thuộc loại này
          </label>
          <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto bg-gray-50">
            {foods.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có món ăn nào</p>
            ) : (
              foods.map((food) => (
                <label key={food.id} className="flex items-center py-1">
                  <input
                    type="checkbox"
                    checked={foodIds.includes(String(food.id))}
                    onChange={(e) => {
                      const foodId = String(food.id);
                      if (e.target.checked) {
                        setFoodIds([...foodIds, foodId]);
                      } else {
                        setFoodIds(foodIds.filter((id) => id !== foodId));
                      }
                    }}
                    className="mr-2"
                  />
                  <span>{food.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded bg-white"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-sky-200 rounded hover:bg-sky-300 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/admin/categories");
      if (!res.ok) throw new Error("Lỗi khi tải danh mục");
      const json = await res.json();
      setCategories(json.data || json);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(payload) {
    try {
      const res = await fetch("http://localhost:5000/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Lỗi khi thêm danh mục");
      }
      const json = await res.json();
      setCategories((prev) => [...prev, json.data]);
    } catch (err) {
      throw new Error(err.message || "Không thể kết nối với server");
    }
  }



  async function handleUpdateCategory(id, payload) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/categories/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Lỗi khi cập nhật danh mục");
      const json = await res.json();
      setCategories((prev) => prev.map((c) => (c._id === id ? json.data : c)));
      setEditingCategory(null);
    } catch (err) {
      alert(err.message || "Không thể cập nhật danh mục");
    }
  }

// ... (This function is inside Categories component)
  async function handleHideCategory(id) {
    try {
      const category = categories.find((c) => c._id === id);
      const res = await fetch(
        `http://localhost:5000/api/admin/categories/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visible: !category.visible }),
        }
      );
      if (!res.ok) throw new Error("Lỗi khi ẩn/hiện danh mục");
      const json = await res.json();
      // Preserve restaurantCount from previous state
      setCategories((prev) => 
        prev.map((c) => (c._id === id ? { ...json.data, restaurantCount: c.restaurantCount } : c))
      );
    } catch (err) {
      alert(err.message || "Không thể ẩn/hiện danh mục");
    }
  }

// ...

// Remove AddFoodForm component definition (it was around line 31 in grep search, but let's confirm in file view)
// Actually I need to be careful with replace_file_content targetting multiple disjoint blocks. 
// I will just use multi_replace.


  async function handleDeleteCategory(id) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/categories/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Lỗi khi xóa danh mục");
      }
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message || "Không thể xóa danh mục");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-sm mb-2">
              <span>Quản lý nhà hàng</span>
              <span>›</span>
              <span className="text-white font-medium">Danh mục</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Danh mục món ăn</h1>
            <p className="text-indigo-200 mt-1">Quản lý các danh mục và phân loại món ăn</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategories}
              className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Tải lại"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={20} />
          Thêm danh mục
        </button>

      </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900">
                <th className="p-4 w-20 text-left text-white font-semibold text-sm">STT</th>
                <th className="p-4 text-left text-white font-semibold text-sm">Tên danh mục</th>
                <th className="p-4 text-center text-white font-semibold text-sm">Số lượng</th>
                <th className="p-4 text-right text-white font-semibold text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((s, idx) => (
                <tr
                  key={s._id}
                  className="border-b border-slate-100 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group"
                  onClick={() => setSelected(s)}
                >
                  <td className="p-4 text-slate-500 font-medium">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FolderOpen size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">{s.name}</span>
                        {s.visible === false && (
                          <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            Bị ẩn
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                      {s.restaurantCount || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <ActionButtons
                      onEdit={() => setEditingCategory(s)}
                      onHide={() => handleHideCategory(s._id)}
                      onDelete={() => handleDeleteCategory(s._id)}
                      isHidden={s.visible === false}
                    />
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selected && (
          <CategoryDetail
            category={selected}
            allCategories={categories}
            onClose={() => setSelected(null)}
          />
        )}
        {showAdd && (
          <AddCategoryForm
            onClose={() => setShowAdd(false)}
            onCreate={handleCreateCategory}
          />
        )}

        {editingCategory && (
          <EditCategoryForm
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
            onSave={(payload) =>
              handleUpdateCategory(editingCategory._id, payload)
            }
          />
        )}
      </div>
    </div>
  );
}
