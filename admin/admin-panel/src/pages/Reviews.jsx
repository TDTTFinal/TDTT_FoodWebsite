import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Clock, RefreshCw, Search, Filter, Check, X, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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

const StarRating = ({ rating }) => {
  const displayRating = rating > 5 ? Math.round(rating / 2) : rating;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          className={`${
            star <= displayRating 
              ? "text-amber-400 fill-amber-400" 
              : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { 
      label: "Đã duyệt", 
      classes: "bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-emerald-200" 
    },
    hidden: { 
      label: "Đã ẩn", 
      classes: "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-200" 
    },
    pending: { 
      label: "Chờ duyệt", 
      classes: "bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-200" 
    },
    deleted: {
        label: "Đã xóa",
        classes: "bg-slate-200 text-slate-500"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${config.classes}`}>
      {config.label}
    </span>
  );
};

const ReviewRow = ({ review, onApprove, onReject, onDelete }) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-indigo-50/30 transition-all duration-200 group">
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <StarRating rating={review.rating} />
          <span className="text-xs text-slate-400">{review.rating}/10</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{review.title || "(Không có tiêu đề)"}</span>
          {review.content && (
            <span className="text-sm text-slate-500 line-clamp-1 max-w-xs">{review.content}</span>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="text-slate-700 font-medium">{review.restaurant?.name || "N/A"}</span>
      </td>
      <td className="p-4 text-center">
        <StatusBadge status={review.status} />
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          {review.status !== 'active' && (
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(review); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all text-sm font-medium"
                title="Duyệt"
              >
                <Check size={14} />
                <span className="hidden sm:inline">Duyệt</span>
              </button>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); onReject(review); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-all text-sm font-medium"
            title="Không duyệt"
          >
            <X size={14} />
            <span className="hidden sm:inline">Từ chối</span>
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(review); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 hover:border-rose-300 transition-all text-sm font-medium"
            title="Xóa"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Debounce search
  useEffect(() => {
     const timer = setTimeout(() => {
         setPage(1); // Reset page on filter change
         fetchReviews();
     }, 500);
     return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, statusFilter]);

  // Fetch on page change (skip if triggered by filter change above to avoid double fetch? 
  // actually useEffect deps logic: changing filters updates dependency array)
  useEffect(() => {
      fetchReviews();
  }, [page]);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
          page: page,
          limit: 20,
          sort: "createdAt",
          order: "desc"
      });

      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`http://localhost:5000/api/admin/reviews?${params.toString()}`);
      if (!res.ok) throw new Error("Lỗi khi tải đánh giá");
      const json = await res.json();
      
      setReviews(json.data || []);
      if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalReviews(json.pagination.total);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(review) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/reviews/${review._id}/approve`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Lỗi khi duyệt đánh giá");
      const json = await res.json();
      setReviews((prev) => prev.map((r) => (r._id === review._id ? json.data : r)));
    } catch (err) {
      console.error("Approve error:", err);
      alert(err.message);
    }
  }

  async function handleReject(review) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/reviews/${review._id}/reject`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Lỗi khi không duyệt đánh giá");
      const json = await res.json();
      setReviews((prev) => prev.map((r) => (r._id === review._id ? json.data : r)));
    } catch (err) {
      console.error("Reject error:", err);
      alert(err.message);
    }
  }

  async function handleDelete(review) {
    if (!confirm(`Xóa đánh giá "${review.title || "này"}"?`)) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/reviews/${review._id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Lỗi khi xóa đánh giá");
      // Remove from list or refresh? Removing is faster UX
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-100 text-sm mb-2">
          <span>Quản lý đánh giá</span>
          <span>›</span>
          <span className="text-white font-medium">Tất cả</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Quản lý Đánh giá</h1>
        <p className="text-indigo-200 mt-1">Xem và quản lý tất cả đánh giá từ người dùng</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <X className="w-5 h-5" />
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards (Static/Approximate or remove if expensive?) 
          Actually keeping them static based on current page might be confusing.
          Ideally these should come from a separate /stats endpoint or the same API.
          For now, let's just show total from pagination metadata.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Tổng đánh giá" 
          value={totalReviews} 
          icon={MessageSquare}
          gradient="from-indigo-600 to-purple-600"
          iconBg="bg-indigo-100 text-indigo-600"
        />
        {/* These counts are not easily available with simple pagination without aggregation. 
            We can leave them as 0 or remove them, or fetch a stats endpoint.
            Let's disable them effectively or put a placeholder. 
        */}
        <div className="hidden md:block">
             {/* Placeholder or separate stats call needed */}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => { setPage(1); fetchReviews(); }}
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
              placeholder="Tìm kiếm nhà hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="lau">Lẩu</option>
              <option value="nuong">Nướng</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
            >
              <option value="all">Trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900">
                <th className="p-4 text-left text-white font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Star size={16} />
                    Đánh giá
                  </div>
                </th>
                <th className="p-4 text-left text-white font-semibold text-sm">Tiêu đề / Nội dung</th>
                <th className="p-4 text-left text-white font-semibold text-sm">Nhà hàng</th>
                <th className="p-4 text-center text-white font-semibold text-sm">Trạng thái</th>
                <th className="p-4 text-right text-white font-semibold text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && reviews.map((review) => (
                <ReviewRow
                  key={review._id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                />
              ))}
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <MessageSquare className="w-12 h-12 text-slate-300" />
                      <span className="text-slate-500">Không tìm thấy đánh giá nào</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
           <span className="text-sm text-slate-500">
             Trang {page} / {totalPages} (Tổng {totalReviews} đánh giá)
           </span>
           
           <div className="flex gap-2">
             <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border rounded hover:bg-white disabled:opacity-50"
             >
                <ChevronLeft size={20} />
             </button>
             <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border rounded hover:bg-white disabled:opacity-50"
             >
                <ChevronRight size={20} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
