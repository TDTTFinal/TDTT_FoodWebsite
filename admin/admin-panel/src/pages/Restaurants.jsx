import React, { useState, useEffect } from "react";
import RestaurantDetail from "../components/RestaurantDetail";
import AddRestaurantForm from "../components/AddRestaurantForm";
import {
  Plus,
  RefreshCw,
  Search,
  MoreHorizontal,
  Edit3,
  EyeOff,
  Trash,
  Store,
  Star,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const Row = ({ item, onOpen, onEdit, onHide, onDelete }) => {
  const tagsCount =
    item.tags && Array.isArray(item.tags) ? item.tags.length : 0;
  const isVisible = item.visible !== false;

  return (
    <tr
      className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer"
      onClick={() => onOpen(item)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
            <img
              src={item.avatar_url || item.image || "/src/assets/logo.png"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-xs text-slate-500">
              {item.address || "Chưa cập nhật địa chỉ"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {tagsCount} danh mục
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {isVisible ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Hiển thị
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            Đã ẩn
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Sửa"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onHide(item)}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title={isVisible ? "Ẩn" : "Hiện"}
          >
            <EyeOff size={18} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash size={18} />
          </button>
        </div>
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
      const res = await fetch(
        "http://localhost:5000/api/admin/restaurants?limit=100"
      );
      if (!res.ok) throw new Error("Lỗi khi tải danh sách nhà hàng");
      const json = await res.json();
      setRestaurants(json.data || []);
    } catch (err) {
      console.error("Failed to load restaurants", err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload) {
    try {
      console.log("🚀 Calling API to create restaurant:", payload);

      const res = await fetch("http://localhost:5000/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 API Response status:", res.status);

      if (res.ok) {
        const json = await res.json();
        console.log("✅ Restaurant created successfully:", json.data);
        setRestaurants((s) => [json.data, ...s]);
        setShowAdd(false);
        return json.data;
      } else {
        const json = await res.json();
        console.error("❌ API Error:", json);
        throw new Error(json.message || "Create failed");
      }
    } catch (err) {
      console.error("❌ Exception in handleCreate:", err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/restaurants/${updated._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (res.ok) {
        const json = await res.json();
        setRestaurants((prev) =>
          prev.map((r) => (r._id === updated._id ? json.data : r))
        );
        setSelectedForEdit(null);
      } else {
        const json = await res.json();
        throw new Error(json.message || "Update failed");
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
        `http://localhost:5000/api/admin/restaurants/${item._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visible: false }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        setRestaurants((prev) =>
          prev.map((r) => (r._id === item._id ? json.data : r))
        );
      } else {
        const json = await res.json();
        throw new Error(json.message || "Hide failed");
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
        `http://localhost:5000/api/admin/restaurants/${item._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r._id !== item._id));
      } else {
        const json = await res.json();
        throw new Error(json.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tất cả nhà hàng</h2>
          <p className="text-slate-500 mt-1">
            Quản lý danh sách nhà hàng và đối tác của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRestaurants}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
            title="Tải lại"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={20} />
            Thêm nhà hàng
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng nhà hàng"
          value={restaurants.length}
          icon={Store}
          color="bg-indigo-500"
        />
        <StatCard
          title="Tổng đánh giá"
          value={restaurants
            .filter((r) => r.rating !== null && r.rating !== undefined)
            .reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
            .toFixed(1)}
          icon={Star}
          color="bg-amber-500"
        />
        <StatCard
          title="Hoạt động"
          value={restaurants.filter((r) => r.visible !== false).length}
          icon={Store}
          color="bg-emerald-500"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          {/* Filter Placeholder - could add dropdowns here */}
        </div>

        {/* Error Banners */}
        {actionError && (
          <div className="mx-4 mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            {actionError}
          </div>
        )}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg">
            Lỗi tải dữ liệu: {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRestaurants.map((s) => (
                <Row
                  key={s._id}
                  item={s}
                  onOpen={(it) => setSelected(it)}
                  onEdit={(it) => setSelectedForEdit(it)}
                  onHide={handleHide}
                  onDelete={handleDelete}
                />
              ))}

              {!loading && filteredRestaurants.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Store size={32} className="text-slate-400" />
                    </div>
                    <p>Không tìm thấy nhà hàng nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
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

      {showAdd && (
        <AddRestaurantForm
          onClose={() => setShowAdd(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
