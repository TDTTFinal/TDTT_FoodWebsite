import React, { useState } from "react";

export default function RestaurantDetail({
  item,
  onClose,
  inline = false,
  isEdit = false,
  onSave = null,
}) {
  if (!item) return null;

  const [formData, setFormData] = useState(isEdit ? item : null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!onSave || !formData) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setSaveError(err.message || "Lỗi khi lưu");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (label, field, required = false) => {
    const value = isEdit ? formData?.[field] || "" : item[field] || "";
    if (isEdit) {
      return (
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">{label}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            required={required}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      );
    }
    return (
      <div className="mb-2 break-words">
        <strong>{label}:</strong> {value}
      </div>
    );
  };

  const content = (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-extrabold text-center flex-1">
          {isEdit ? "Chỉnh sửa nhà hàng" : "Chi tiết nhà hàng"}
        </h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
          ✕
        </button>
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {saveError}
        </div>
      )}

      <div className="border-t" />

      {isEdit ? (
        <section className="mt-4 space-y-4">
          {renderField("Tên nhà hàng", "name", true)}
          {renderField("Địa chỉ", "address")}
          {renderField("Các danh mục", "tags")}
          {renderField("Mô tả", "description")}
          {renderField("Hình ảnh URL", "image")}
          {renderField("Giờ mở cửa", "opening")}
          {renderField("Điểm đánh giá", "rating")}
          {renderField("Quán dành cho", "for")}
          {renderField("Khoảng giá", "priceRange")}

          <div className="mt-6 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-sky-200 rounded hover:bg-sky-300 disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-4 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
          <div className="flex-shrink-0 w-full md:w-[120px]">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-28 md:h-32 rounded-lg object-cover block"
              style={{ maxWidth: 480 }}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-2 break-words">
              <strong>Tên sản phẩm:</strong> {item.name}
            </div>
            <div className="mb-2 break-words">
              <strong>Địa chỉ:</strong>{" "}
              {item.address || "Số 888, đường Lạc Long Quân, Quận 11, TP HCM"}
            </div>
            <div className="mb-2 break-words">
              <strong>Các danh mục:</strong>{" "}
              {item.tags || "buffet, món nướng, món lẩu"}
            </div>
            <div className="mb-2 break-words">
              <strong>Mô tả:</strong> {item.description || "Mô tả nhà hàng"}
            </div>
          </div>
        </section>
      )}

      {!isEdit && (
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Thông tin chi tiết</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Giờ mở cửa:</strong> {item.opening || "7:00 - 17:00"}
            </li>
            <li>
              <strong>Điểm đánh giá:</strong> {item.rating ?? "9.5"}
            </li>
            <li>
              <strong>Quán dành cho:</strong> {item.for || "1 - 10 người ăn"}
            </li>
            <li>
              <strong>Khoảng giá:</strong>{" "}
              {item.priceRange || "100.000 - 400.000"}
            </li>
          </ul>
        </section>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="w-full flex justify-center mb-4">
        <div className="bg-white w-full max-w-3xl rounded shadow-lg p-6">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-[90%] max-w-3xl rounded shadow-lg p-6 max-h-[90vh] overflow-auto">
        {content}
      </div>
    </div>
  );
}
