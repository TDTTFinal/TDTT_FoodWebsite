import React, { useState } from 'react';
import { X, AlertTriangle, Sparkles, Plus, Zap } from 'lucide-react';

const ApplyRouteModal = ({ route, onConfirm, onCancel }) => {
  const [mergeMode, setMergeMode] = useState('smart');

  if (!route) return null;

  const mergeModes = [
    {
      id: 'smart',
      name: 'Smart Fill',
      icon: <Zap size={20} className="text-purple-600" />,
      description: 'AI tự động phân bổ vào các slot Sáng/Trưa/Chiều/Tối',
      recommended: true,
      color: 'purple'
    },
    {
      id: 'append',
      name: 'Thêm vào',
      icon: <Plus size={20} className="text-blue-600" />,
      description: 'Thêm tất cả vào slot "Chưa sắp xếp"',
      recommended: false,
      color: 'blue'
    },
    {
      id: 'replace',
      name: 'Thay thế',
      icon: <AlertTriangle size={20} className="text-red-600" />,
      description: 'Xóa tour hiện tại và thay bằng route này',
      recommended: false,
      color: 'red',
      danger: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 text-white">
            <Sparkles size={28} />
            <div>
              <h2 className="font-bold text-xl">Áp dụng Route gợi ý</h2>
              <p className="text-sm opacity-90">{route.stops.length} điểm dừng</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Chọn cách bạn muốn thêm route này vào Food Tour:
          </p>

          {/* Merge Mode Options */}
          <div className="space-y-3 mb-6">
            {mergeModes.map((mode) => (
              <label
                key={mode.id}
                className={"flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all " + (
                  mergeMode === mode.id
                    ? "border-" + mode.color + "-500 bg-" + mode.color + "-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <input
                  type="radio"
                  name="mergeMode"
                  value={mode.id}
                  checked={mergeMode === mode.id}
                  onChange={(e) => setMergeMode(e.target.value)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {mode.icon}
                    <span className="font-bold text-gray-800">{mode.name}</span>
                    {mode.recommended && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Đề xuất
                      </span>
                    )}
                    {mode.danger && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Nguy hiểm
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Warning for Replace */}
          {mergeMode === 'replace' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold">Cảnh báo!</p>
                <p>Hành động này sẽ xóa toàn bộ tour hiện tại. Không thể hoàn tác.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => onConfirm(route, mergeMode)}
              className={"flex-1 py-2.5 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all " + (
                mergeMode === 'replace'
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              )}
            >
              Xác nhận áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyRouteModal;
