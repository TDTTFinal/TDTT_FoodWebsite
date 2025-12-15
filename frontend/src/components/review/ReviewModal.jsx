import React, { useState, useRef } from "react";
import { X, Star, Upload, Calendar, ImagePlus, Loader2 } from "lucide-react";
import api from "../../config/api";

const QUICK_TAGS = [
  "Món ngon",
  "Phục vụ tốt",
  "Giá ổn",
  "Không gian đẹp",
  "Sạch sẽ",
  "Đông khách",
  "Giao hàng nhanh",
];

import { useAuth } from "../../context/AuthContext";

const ReviewModal = ({ isOpen, onClose, restaurantId, restaurantName, onSuccess }) => {
  const { user } = useAuth(); // Get user from context
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(7);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [visitDate, setVisitDate] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError("Tối đa 5 ảnh");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    // Use configured API URL if possible, otherwise assume port 5000 or relative path
    // Better to use the configured api instance or relative path if proxy is set up
    // But since we are using fetch here, let's keep it robust
    const formData = new FormData();
    imageFiles.forEach(file => formData.append("images", file));

    // Fix: Use API_URL from config or relative path
    const response = await fetch(`${api.defaults.baseURL.replace('/api', '')}/api/reviews/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) return data.urls;
    throw new Error(data.error || "Upload failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (content.trim().length < 10) {
      setError("Nội dung đánh giá phải có ít nhất 10 ký tự");
      return;
    }

    try {
      setSubmitting(true);

      // Upload images first
      let imageUrls = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages();
        setUploading(false);
      }

      // Create review
      const reviewData = {
        restaurant: restaurantId,
        userId: user?._id || user?.id || null, // Handle both _id (Google) and id (Normal)
        title: title.trim() || null,
        rating,
        content: content.trim(),
        images: imageUrls,
        tags: selectedTags,
        visitDate: visitDate || null,
        isAnonymous,
      };

      const response = await api.post("/reviews", reviewData);
      
      if (response.success) {
        // Reset form
        setTitle("");
        setRating(7);
        setContent("");
        setSelectedTags([]);
        setVisitDate("");
        setIsAnonymous(false);
        setImages([]);
        setImageFiles([]);
        
        onSuccess?.(response.data);
        onClose();
      } else {
        throw new Error(response.error || "Lỗi khi gửi đánh giá");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div>
            <h2 className="text-xl font-bold">Viết đánh giá</h2>
            <p className="text-sm text-white/80 truncate max-w-xs">{restaurantName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề đánh giá (tùy chọn)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Trải nghiệm tuyệt vời!"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              maxLength={100}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá: <span className="text-orange-600 font-bold text-lg">{rating}/10</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-sm text-gray-500">10</span>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Rất tệ</span>
              <span>Xuất sắc</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung đánh giá *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về nhà hàng này..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
              maxLength={2000}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {content.length}/2000
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags nhanh
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thêm ảnh (tối đa 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20">
                  <img 
                    src={img} 
                    alt={`Preview ${idx}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs mt-1">Thêm</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày đi ăn (tùy chọn)
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-600">
              Đăng ẩn danh
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang tải ảnh...
              </>
            ) : submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Star size={20} />
                Gửi đánh giá
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
