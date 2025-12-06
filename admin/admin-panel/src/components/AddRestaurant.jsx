import React, { useState } from "react";

export default function AddRestaurant({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    image: "",
    address: "",
    tags: "",
    description: "",
    opening: "",
    rating: "",
    for: "",
    priceRange: "",
  });

  function change(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    // call parent
    setError(null);
    setLoading(true);
    try {
      await onCreate({
        ...form,
        rating: form.rating ? Number(form.rating) : undefined,
      });
    } catch (err) {
      console.error("Create error", err);
      setError(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-lg w-full max-w-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold mb-4">Thêm nhà hàng mới</h3>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Tên nhà hàng"
            className="border px-3 py-2 rounded"
            required
          />
          <input
            name="image"
            value={form.image}
            onChange={change}
            placeholder="Đường dẫn ảnh (optional)"
            className="border px-3 py-2 rounded"
          />
          <input
            name="address"
            value={form.address}
            onChange={change}
            placeholder="Địa chỉ"
            className="border px-3 py-2 rounded"
          />
          <input
            name="tags"
            value={form.tags}
            onChange={change}
            placeholder="Danh mục (comma separated)"
            className="border px-3 py-2 rounded"
          />
          <input
            name="opening"
            value={form.opening}
            onChange={change}
            placeholder="Giờ mở cửa"
            className="border px-3 py-2 rounded"
          />
          <input
            name="priceRange"
            value={form.priceRange}
            onChange={change}
            placeholder="Khoảng giá"
            className="border px-3 py-2 rounded"
          />
        </div>

        <textarea
          name="description"
          value={form.description}
          onChange={change}
          placeholder="Mô tả"
          className="w-full border px-3 py-2 rounded mt-3"
        />

        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 text-white rounded"
          >
            {loading ? "Đang lưu..." : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
}
