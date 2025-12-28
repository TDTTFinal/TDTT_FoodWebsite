import React, { useState } from "react";

export default function AddRestaurantForm({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    district: "",
    lat: "",
    lng: "",
    description: "",
    image: "",
    categories: {
      com: false,
      nuoc: false,
      drinks: false,
      snack: false,
      party: false,
      healthy: false,
    },
    mealTypes: { sang: false, trua: false, chieu: false, toi: false },
    amenities: { mayLanh: false, choDoXe: false, wifi: false },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleCheckbox = (section, key) => {
    if (section === "categories") {
        setForm((prev) => ({
            ...prev,
            categories: {
                ...prev.categories,
                [key]: !prev.categories[key]
            }
        }));
    } else {
        setForm((prev) => ({
        ...prev,
        [section]: { ...prev[section], [key]: !prev[section][key] },
        }));
    }
  };

  const handleSave = async () => {
    try {
      // Validate
      if (!form.name || !form.address) {
        alert("Vui lòng nhập tên và địa chỉ nhà hàng!");
        return;
      }

      // Determine primary category
      const primaryCategory = getCategoryFromForm(form.categories);

      // Chuyển đổi dữ liệu form sang format MongoDB
      const payload = {
        name: form.name,
        address: form.address,
        opening_hours: "Đang cập nhật",
        price_range: "Đang cập nhật",
        avatar_url: form.image || uploadedImages[0] || undefined,
        category: primaryCategory,
        tags: getTagsFromForm(form),
        location: {
          type: "Point",
          coordinates:
            form.lng && form.lat
              ? [parseFloat(form.lng), parseFloat(form.lat)]
              : [0, 0],
        },
      };

      console.log("📤 Sending payload to API:", payload);

      if (onSave) {
        const result = await onSave(payload);
        console.log("✅ API response:", result);
      }

      onClose();
    } catch (err) {
      console.error("❌ Error saving restaurant:", err);
      alert("Lỗi khi lưu nhà hàng: " + err.message);
    }
  };

  // Helper để lấy category chính từ checkboxes -> Matches User App Categories
  const getCategoryFromForm = (categories) => {
    if (categories.com) return "Cơm & Món Mặn";
    if (categories.nuoc) return "Món Nước & Sợi";
    if (categories.drinks) return "Cafe & Trà Sữa";
    if (categories.snack) return "Ăn Vặt & Bánh";
    if (categories.party) return "Lẩu - Nướng & Nhậu";
    if (categories.healthy) return "Healthy & Khác";
    return "Khác";
  };

  // Helper để lấy tất cả tags (bao gồm cả các category phụ nếu muốn, hoặc các tiện ích)
  const getTagsFromForm = (formData) => {
    const tags = [];

    // Thêm các category đã chọn vào tags
    if (formData.categories.com) tags.push("Cơm", "Món Mặn");
    if (formData.categories.nuoc) tags.push("Món Nước", "Bún", "Phở");
    if (formData.categories.drinks) tags.push("Cafe", "Trà Sữa", "Đồ uống");
    if (formData.categories.snack) tags.push("Ăn Vặt", "Bánh");
    if (formData.categories.party) tags.push("Lẩu", "Nướng", "Nhậu");
    if (formData.categories.healthy) tags.push("Healthy", "Salad");

    // Thêm meal types
    if (formData.mealTypes?.sang) tags.push("Ăn sáng");
    if (formData.mealTypes?.trua) tags.push("Ăn trưa");
    if (formData.mealTypes?.chieu) tags.push("Ăn chiều");
    if (formData.mealTypes?.toi) tags.push("Ăn tối");

    // Thêm amenities
    if (formData.amenities?.mayLanh) tags.push("Máy lạnh");
    if (formData.amenities?.choDoXe) tags.push("Chỗ đỗ xe");
    if (formData.amenities?.wifi) tags.push("Wifi");

    return tags;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    alert(
      "Chức năng upload ảnh đang được phát triển. Vui lòng nhập URL ảnh trực tiếp."
    );
  };

  const handleMouseDown = (e) => {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.tagName === "BUTTON"
    ) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" onClick={onClose} />
      <div
        className="fixed z-[10000] pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative bg-white w-[40rem] rounded shadow-2xl max-h-[85vh] overflow-y-auto pointer-events-auto border-2 border-gray-200"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Thông tin cơ bản */}
          <section className="p-8 bg-gray-200 border-b-2 border-gray-300">
            <h3 className="font-bold text-base mb-6">Thông tin cơ bản</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <label className="text-sm">Tên nhà hàng</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-400 rounded px-4 py-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <label className="text-sm">Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded px-4 py-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <label className="text-sm">Quận / Huyện</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded px-4 py-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                <label className="text-sm pt-2">Tọa độ</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    placeholder="Lat"
                    className="w-full border border-gray-400 rounded px-4 py-2.5 bg-white"
                  />
                  <input
                    type="text"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    placeholder="Lng"
                    className="w-full border border-gray-400 rounded px-4 py-2.5 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                <label className="text-sm pt-2">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={5}
                  className="w-full border border-gray-400 rounded px-4 py-2.5 bg-white"
                />
              </div>
            </div>
          </section>

          {/* Phân loại - Updated to match User App */}
          <section className="p-8 bg-gray-200 border-b-2 border-gray-300">
            <h3 className="font-bold text-base mb-6">Phân loại</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-[140px_1fr] gap-4">
                <label className="text-sm">Danh mục</label>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ["com", "Cơm & Món Mặn"],
                    ["nuoc", "Món Nước & Sợi"],
                    ["drinks", "Cafe & Trà Sữa"],
                    ["snack", "Ăn Vặt & Bánh"],
                    ["party", "Lẩu - Nướng & Nhậu"],
                    ["healthy", "Healthy & Khác"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.categories[key]}
                        onChange={() => handleCheckbox("categories", key)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4">
                <label className="text-sm">Phù hợp</label>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ["sang", "Sáng"],
                    ["trua", "Trưa"],
                    ["chieu", "Chiều"],
                    ["toi", "Tối"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.mealTypes[key]}
                        onChange={() => handleCheckbox("mealTypes", key)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4">
                <label className="text-sm">Tiện ích</label>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ["mayLanh", "Máy lạnh"],
                    ["choDoXe", "Chỗ đậu xe"],
                    ["wifi", "Wifi"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.amenities[key]}
                        onChange={() => handleCheckbox("amenities", key)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Hình ảnh */}
          <section className="p-8 bg-gray-200">
            <h3 className="font-bold text-base mb-4">Hình ảnh</h3>
            <input
              type="file"
              id="imageUpload"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="imageUpload"
              className="inline-block px-6 py-3 border-2 border-gray-400 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 cursor-pointer"
            >
              + Thêm hình ảnh
            </label>

            {uploadedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border-2 border-gray-300"
                    />
                    <button
                      onClick={() => {
                        setUploadedImages((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                        if (form.image === img) {
                          setForm((prev) => ({
                            ...prev,
                            image: uploadedImages[0] || "",
                          }));
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {form.image === img && (
                      <div className="absolute bottom-1 left-1 bg-sky-500 text-white text-xs px-2 py-1 rounded">
                        Chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Buttons */}
          <div className="p-6 bg-white flex justify-end gap-3 border-t border-gray-300">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-400 rounded font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-sky-500 text-white rounded font-medium hover:bg-sky-600"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
