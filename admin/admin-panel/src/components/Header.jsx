import React from "react";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-sky-400 h-16 px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
          <img src={logo} alt="logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-wider">
          TRANG QUẢN LÝ
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-sky-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.633 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="font-semibold text-sm">TRUONG SON</span>
        </div>
        <button className="text-sm font-semibold text-sky-900">
          ĐĂNG XUẤT
        </button>
      </div>
    </header>
  );
}
