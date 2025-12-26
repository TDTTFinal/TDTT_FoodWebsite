import React, { useState, useEffect } from "react";

const StatCard = ({ title, value }) => (
  <div className="w-48 h-32 bg-sky-100 rounded-lg border border-sky-300 flex flex-col items-center justify-center">
    <div className="text-base font-semibold mb-2">{title}</div>
    <div className="text-4xl font-extrabold">{value}</div>
  </div>
);

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewRow = ({ review, onApprove, onReject, onDelete }) => {
  const status =
    review.status === "active"
      ? { text: "Đã duyệt", color: "bg-emerald-200 text-emerald-800" }
      : review.status === "hidden"
      ? { text: "Đã ẩn", color: "bg-orange-200 text-orange-800" }
      : { text: "Chưa duyệt", color: "bg-gray-300 text-gray-700" };

  return (
    <tr className="border-t hover:bg-slate-50">
      <td className="p-4">
        <StarRating rating={review.rating} />
      </td>
      <td className="p-4 font-bold">{review.title || "(Không có tiêu đề)"}</td>
      <td className="p-4">{review.restaurant?.name || "N/A"}</td>
      <td className="p-4 text-center">
        <span className={`px-3 py-1 rounded-full text-sm ${status.color}`}>
          {status.text}
        </span>
      </td>
      <td className="p-4 text-right space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove(review);
          }}
          className="px-3 py-1 bg-white border border-gray-400 rounded hover:bg-gray-50"
        >
          Duyệt
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReject(review);
          }}
          className="px-3 py-1 bg-amber-200 rounded hover:bg-amber-300"
        >
          Không duyệt
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(review);
          }}
          className="px-3 py-1 bg-pink-400 text-white rounded hover:bg-pink-500"
        >
          Xóa
        </button>
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

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/admin/reviews");
      if (!res.ok) throw new Error("Lỗi khi tải đánh giá");
      const json = await res.json();
      setReviews(json.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(review) {
    console.log("Approving review:", review._id);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/reviews/${review._id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Approve response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Approve error response:", errorText);
        throw new Error("Lỗi khi duyệt đánh giá");
      }
      const json = await res.json();
      console.log("Review approved:", json);
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? json.data : r))
      );
    } catch (err) {
      console.error("Approve error:", err);
      alert(err.message);
    }
  }

  async function handleReject(review) {
    console.log("Rejecting review:", review._id);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/reviews/${review._id}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Reject response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Reject error response:", errorText);
        throw new Error("Lỗi khi không duyệt đánh giá");
      }
      const json = await res.json();
      console.log("Review rejected:", json);
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? json.data : r))
      );
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
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Lỗi khi xóa đánh giá");
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  }

  const filteredReviews = reviews.filter((r) => {
    // Loại bỏ các review đã xóa
    if (r.status === "deleted") return false;

    const matchSearch = (r.restaurant?.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === "all" ||
      r.restaurant?.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && r.status === "active") ||
      (statusFilter === "pending" && r.status !== "active");
    return matchSearch && matchCategory && matchStatus;
  });

  const pendingCount = reviews.filter((r) => r.status !== "active").length;

  return (
    <div>
      <div className="px-6 py-4 border-b bg-sky-200 text-slate-800">
        Quản lý đánh giá &nbsp; &gt; &nbsp; Tất cả
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-6 mb-6 justify-center">
          <StatCard title="Tổng đánh giá" value={reviews.length} />
          <StatCard title="Chờ duyệt" value={pendingCount} />
        </div>

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={fetchReviews}
            className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg flex-1"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="lau">Lẩu</option>
            <option value="nuong">Nướng</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">Trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>

        <div className="overflow-hidden border rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-200 text-slate-800">
                <th className="p-4">★ Đánh giá</th>
                <th className="p-4">Nhà hàng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading &&
                filteredReviews.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                  />
                ))}
              {!loading && filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    Không tìm thấy đánh giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
