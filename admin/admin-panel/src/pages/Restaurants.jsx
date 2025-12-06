import React, { useState, useEffect } from "react";
import RestaurantDetail from "../components/RestaurantDetail";
import AddRestaurant from "../components/AddRestaurant";

const StatCard = ({ title, value }) => (
  <div className="w-56 h-40 bg-sky-100 rounded-lg border border-sky-300 flex flex-col items-center justify-center">
    <div className="text-lg font-semibold mb-2">{title}</div>
    <div className="text-4xl font-extrabold">{value}</div>
  </div>
);

const Row = ({ item, onOpen, onEdit, onHide, onDelete }) => {
  const tagsCount = item.tags
    ? item.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean).length
    : 0;
  const status =
    item.visible === false
      ? { text: "Bị ẩn", color: "bg-gray-400 text-gray-900" }
      : { text: "Hiển thị", color: "bg-emerald-200 text-emerald-800" };
  return (
    <tr className="border-t hover:bg-slate-50">
      <td className="p-4 w-28 cursor-pointer" onClick={() => onOpen(item)}>
        <img
          src={item.image || "/src/assets/logo.png"}
          alt=""
          className="w-20 h-20 rounded-lg object-cover"
        />
      </td>
      <td
        className="p-4 font-extrabold cursor-pointer"
        onClick={() => onOpen(item)}
      >
        {item.name}
      </td>
      <td
        className="p-4 text-center font-bold cursor-pointer"
        onClick={() => onOpen(item)}
      >
        {tagsCount}
      </td>
      <td
        className="p-4 text-center cursor-pointer"
        onClick={() => onOpen(item)}
      >
        <span className={`px-3 py-1 rounded-full text-sm ${status.color}`}>
          {status.text}
        </span>
      </td>
      <td className="p-4 text-right space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
        >
          Sửa
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHide(item);
          }}
          className="px-3 py-1 bg-amber-200 rounded hover:bg-amber-300"
        >
          Ẩn
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="px-3 py-1 bg-pink-400 text-white rounded hover:bg-pink-500"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
};

export default function Restaurants() {
  const [selected, setSelected] = useState(null);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/restaurants");
      if (!res.ok) throw new Error("Lỗi khi tải danh sách nhà hàng");
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Failed to load restaurants", err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload) {
    try {
      const res = await fetch("http://localhost:4000/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setRestaurants((s) => [created, ...s]);
        setShowAdd(false);
        return created;
      } else {
        const txt = await res.text();
        console.error("Create failed", txt);
        throw new Error(txt || "Create failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/restaurants/${updated.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        setSelectedForEdit(null);
      } else {
        const txt = await res.text();
        throw new Error(txt || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleHide(item) {
    if (!window.confirm(`Ẩn nhà hàng "${item.name}"?`)) return;
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/restaurants/${item.id}/hide`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, visible: false } : r))
        );
      } else {
        const txt = await res.text();
        throw new Error(txt || "Hide failed");
      }
    } catch (err) {
      console.error("Hide error:", err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Xóa nhà hàng "${item.name}" - không thể khôi phục?`))
      return;
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/restaurants/${item.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== item.id));
      } else {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="px-6 py-4 border-b bg-sky-200 text-slate-800">
        Quản lý nhà hàng &nbsp; &gt; &nbsp; Tất cả
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-2 border rounded-lg bg-sky-50"
          >
            + Thêm nhà hàng mới
          </button>
          <button
            onClick={fetchRestaurants}
            className="px-3 py-2 border rounded-lg bg-white"
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên nhà hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg w-80"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div />
          <div className="flex justify-center">
            <StatCard title="Tổng nhà hàng" value={restaurants.length} />
          </div>
          <div className="flex justify-center">
            <StatCard
              title="Tổng đánh giá"
              value={restaurants
                .filter((r) => r.rating !== null && r.rating !== undefined)
                .reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
                .toFixed(1)}
            />
          </div>
        </div>

        {selectedForEdit && (
          <RestaurantDetail
            item={selectedForEdit}
            onClose={() => setSelectedForEdit(null)}
            inline
            isEdit={true}
            onSave={handleUpdate}
          />
        )}

        {selected && !selectedForEdit && (
          <RestaurantDetail
            item={selected}
            onClose={() => setSelected(null)}
            inline
          />
        )}

        {actionError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {actionError}
          </div>
        )}

        <div className="overflow-hidden border rounded-lg">
          {error && (
            <div className="p-4 text-red-600">Lỗi khi tải dữ liệu: {error}</div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-200 text-slate-800">
                <th className="p-4">Hình ảnh</th>
                <th className="p-4">Thông tin nhà hàng</th>
                <th className="p-4 text-center">Số danh mục</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {restaurants
                .filter((r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((s) => (
                  <Row
                    key={s.id}
                    item={s}
                    onOpen={(it) => setSelected(it)}
                    onEdit={(it) => setSelectedForEdit(it)}
                    onHide={handleHide}
                    onDelete={handleDelete}
                  />
                ))}
              {!loading &&
                restaurants.filter((r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      {searchQuery
                        ? `Không tìm thấy nhà hàng với từ khóa "${searchQuery}"`
                        : 'Không có nhà hàng nào. Nhấn "Tải lại" hoặc thêm nhà hàng mới.'}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {showAdd && (
          <AddRestaurant
            onClose={() => setShowAdd(false)}
            onCreate={handleCreate}
          />
        )}
      </div>
    </div>
  );
}
