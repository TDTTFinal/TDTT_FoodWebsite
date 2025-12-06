import React from "react";

export default function CategoryDetail({ category, onClose }) {
  if (!category) return null;

  // sample dishes for demonstration
  const dishes = [
    { id: 1, name: "Lẩu hải sản" },
    { id: 2, name: "Lẩu Thái" },
    { id: 3, name: "Lẩu bò" },
    { id: 4, name: "Lẩu chay" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-6">
      <div className="bg-white rounded-lg w-full max-w-3xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-sky-100">
          <div className="font-bold text-slate-800">
            Danh sách món: {category.name}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border rounded"
          >
            Đóng
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-50 text-slate-800">
                  <th className="p-4 w-16">STT</th>
                  <th className="p-4">Tên món</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((d, idx) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-4">{idx + 1}</td>
                    <td className="p-4">{d.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
