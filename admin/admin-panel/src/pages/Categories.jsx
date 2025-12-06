import React, { useState, useEffect } from "react";
import CategoryDetail from "../components/CategoryDetail";

const ActionButtons = ({ onEdit, onHide, onDelete, isHidden }) => (
  <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
    <button
      onClick={onEdit}
      className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
    >
      Sửa
    </button>
    <button
      onClick={onHide}
      className="px-3 py-1 bg-amber-200 rounded hover:bg-amber-300"
    >
      {isHidden ? "Hiện" : "Ẩn"}
    </button>
    <button
      onClick={onDelete}
      className="px-3 py-1 bg-pink-400 text-white rounded hover:bg-pink-500"
    >
      Xóa
    </button>
  </div>
);

function AddFoodForm({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate({ name, description, price });
      setName("");
      setDescription("");
      setPrice("");
      onClose();
    } catch (err) {
      setError(err.message || "Lỗi khi thêm món ăn");
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
        <h2 className="text-xl font-bold mb-4">Thêm món ăn mới</h2>
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label className="block mb-1 font-semibold">Tên món ăn</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-semibold">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-semibold">Giá tiền (VNĐ)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="150000"
          />
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
  const [showAddFood, setShowAddFood] = useState(false);
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
      const res = await fetch("http://localhost:4000/api/categories");
      if (!res.ok) throw new Error("Lỗi khi tải danh mục");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(payload) {
    try {
      const res = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Lỗi khi thêm danh mục");
      }
      const created = await res.json();
      setCategories((prev) => [...prev, created]);
    } catch (err) {
      throw new Error(err.message || "Không thể kết nối với server");
    }
  }

  async function handleCreateFood(payload) {
    try {
      const res = await fetch("http://localhost:4000/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Lỗi khi thêm món ăn");
      }
      const created = await res.json();
      setFoods((prev) => [...prev, created]);
    } catch (err) {
      throw new Error(err.message || "Không thể kết nối với server");
    }
  }

  async function handleUpdateCategory(id, payload) {
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lỗi khi cập nhật danh mục");
      const updated = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingCategory(null);
    } catch (err) {
      alert(err.message || "Không thể cập nhật danh mục");
    }
  }

  async function handleHideCategory(id) {
    try {
      const category = categories.find((c) => c.id === id);
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...category, visible: !category.visible }),
      });
      if (!res.ok) throw new Error("Lỗi khi ẩn/hiện danh mục");
      const updated = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      alert(err.message || "Không thể ẩn/hiện danh mục");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Lỗi khi xóa danh mục");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message || "Không thể xóa danh mục");
    }
  }

  return (
    <div>
      <div className="px-6 py-4 border-b bg-sky-200 text-slate-800">
        Quản lý nhà hàng &nbsp; &gt; &nbsp; Danh mục
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            className="px-3 py-2 border rounded-lg bg-sky-50"
            onClick={() => setShowAdd(true)}
          >
            + Thêm danh mục
          </button>
          <button
            className="px-3 py-2 border rounded-lg bg-green-50"
            onClick={() => setShowAddFood(true)}
          >
            + Thêm món ăn
          </button>
          <div className="flex-1" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="overflow-hidden border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-200 text-slate-800 rounded-t-lg">
                <th className="p-4 w-20">STT</th>
                <th className="p-4">Tên danh mục</th>
                <th className="p-4 text-center">Số lượng món ăn</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((s, idx) => (
                <tr
                  key={s.id}
                  className="border-t hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelected(s)}
                >
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4 font-semibold">
                    {s.name}
                    {s.visible === false && (
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                        Bị ẩn
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {Array.isArray(s.foodIds) ? s.foodIds.length : 0}
                  </td>
                  <td className="p-4">
                    <ActionButtons
                      onEdit={() => setEditingCategory(s)}
                      onHide={() => handleHideCategory(s.id)}
                      onDelete={() => handleDeleteCategory(s.id)}
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
            onClose={() => setSelected(null)}
          />
        )}
        {showAdd && (
          <AddCategoryForm
            onClose={() => setShowAdd(false)}
            onCreate={handleCreateCategory}
          />
        )}
        {showAddFood && (
          <AddFoodForm
            onClose={() => setShowAddFood(false)}
            onCreate={handleCreateFood}
          />
        )}
        {editingCategory && (
          <EditCategoryForm
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
            onSave={(payload) =>
              handleUpdateCategory(editingCategory.id, payload)
            }
          />
        )}
      </div>
    </div>
  );
}
