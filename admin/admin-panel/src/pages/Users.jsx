import React, { useState, useEffect } from "react";
import { Users as UsersIcon, UserCheck, UserX, Shield, RefreshCw, Search, Ban, CheckCircle } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, gradient, iconBg }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
    <p className="mt-3 text-slate-500 text-sm font-medium">{title}</p>
  </div>
);

const UserRow = ({ user, onBan, onUnban }) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-indigo-50/30 transition-all duration-200 group">
      <td className="p-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="font-semibold text-slate-800">{user.name}</div>
        <div className="text-sm text-slate-500">{user.email}</div>
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-slate-100 text-slate-700'
        }`}>
          <Shield size={12} />
          {user.role?.toUpperCase() || 'USER'}
        </span>
      </td>
      <td className="p-4 text-center">
        {user.status === "active" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-sm">
            <CheckCircle size={12} />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-400 to-red-400 text-white shadow-sm">
            <Ban size={12} />
            Banned
          </span>
        )}
      </td>
      <td className="p-4">
        <div className="flex justify-end">
          {user.status === "active" ? (
            <button
              onClick={() => onBan(user)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 hover:border-rose-300 transition-all text-sm font-medium"
            >
              <Ban size={14} />
              Ban
            </button>
          ) : (
            <button
              onClick={() => onUnban(user)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all text-sm font-medium"
            >
              <CheckCircle size={14} />
              Unban
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/users");
      if (!res.ok) throw new Error("Lỗi khi tải người dùng");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBan(user) {
    if (!confirm(`Ban người dùng "${user.name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Lỗi khi ban người dùng");
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      console.error("Ban error:", err);
      alert(err.message);
    }
  }

  async function handleUnban(user) {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}/unban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Lỗi khi unban người dùng");
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      console.error("Unban error:", err);
      alert(err.message);
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }

    return pages.map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
          page === currentPage
            ? "bg-indigo-600 text-white shadow-md"
            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
        }`}
      >
        {page}
      </button>
    ));
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const bannedCount = users.filter(u => u.status === 'banned').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-100 text-sm mb-2">
          <span>Hệ thống</span>
          <span>›</span>
          <span className="text-white font-medium">Người dùng</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Quản lý Người dùng</h1>
        <p className="text-indigo-200 mt-1">Xem và quản lý tài khoản người dùng trên hệ thống</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <UserX className="w-5 h-5" />
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={users.length}
          icon={UsersIcon}
          gradient="from-indigo-600 to-purple-600"
          iconBg="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Đang hoạt động"
          value={activeCount}
          icon={UserCheck}
          gradient="from-emerald-500 to-teal-500"
          iconBg="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Đã cấm"
          value={bannedCount}
          icon={UserX}
          gradient="from-rose-500 to-red-500"
          iconBg="bg-rose-100 text-rose-600"
        />
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Đang tải..." : "Tải lại"}
          </button>

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900">
                <th className="p-4 text-left text-white font-semibold text-sm">Avatar</th>
                <th className="p-4 text-left text-white font-semibold text-sm">Thông tin</th>
                <th className="p-4 text-left text-white font-semibold text-sm">Vai trò</th>
                <th className="p-4 text-center text-white font-semibold text-sm">Trạng thái</th>
                <th className="p-4 text-right text-white font-semibold text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                      <span className="text-slate-500">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UsersIcon className="w-12 h-12 text-slate-300" />
                      <span className="text-slate-500">Không có người dùng nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onBan={handleBan}
                    onUnban={handleUnban}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>mục</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                ‹
              </button>
              {renderPagination()}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                ›
              </button>
            </div>

            <div className="text-sm text-slate-600">
              {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} / {filteredUsers.length} người dùng
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
