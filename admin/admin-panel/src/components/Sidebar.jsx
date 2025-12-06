import React, { useState } from "react";

function Section({ title, items }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between font-bold text-sky-900"
      >
        <span>{title}</span>
        <span
          className={`transform transition-transform ${
            open ? "rotate-0" : "rotate-90"
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <ul className="mt-2 space-y-1 text-sm ml-2 text-slate-800">
          {items.map((it) => (
            <li key={it} className="py-0.5 hover:text-sky-700 cursor-pointer">
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-72 bg-sky-100 min-h-[calc(100vh-4rem)] p-6">
      <Section
        title="QUẢN LÝ NHÀ HÀNG"
        items={[
          <a className="block" key="all" href="#/restaurants">
            Tất cả
          </a>,
          <a className="block" key="cats" href="#/categories">
            Danh mục
          </a>,
        ]}
      />
      <Section
        title="QUẢN LÝ ĐÁNH GIÁ"
        items={[
          <a className="block" key="all-r" href="#/reviews">
            Tất cả
          </a>,
          <a className="block" key="violate" href="#/reviews/violations">
            Đánh giá vi phạm
          </a>,
          <a className="block" key="deleted" href="#/reviews/deleted">
            Đánh giá đã xóa
          </a>,
        ]}
      />
    </aside>
  );
}
