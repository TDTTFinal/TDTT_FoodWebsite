# 🍽️ TDTT Food Website - Nền Tảng Khám Phá & Food Tour Ẩm Thực

> **Dự án Thực tập Doanh nghiệp** - Xây dựng hệ thống web toàn diện cho phép người dùng khám phá nhà hàng, tạo lịch trình Food Tour cá nhân hóa và quản lý nội dung ẩm thực.

![Project Status](https://img.shields.io/badge/Status-In%20Development-blue) ![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)

---

## 📖 Giới thiệu (Overview)

**TDTT Food Website** là một giải pháp Digital Map chuyên sâu về ẩm thực, không chỉ dừng lại ở việc tìm kiếm địa điểm ăn uống mà còn tập trung vào trải nghiệm **Food Tour**. Người dùng có thể tìm kiếm nhà hàng nâng cao, xem đánh giá, và đặc biệt là **kéo-thả (drag & drop) để tự thiết kế tour ăn uống** cho riêng mình hoặc nhóm bạn bè, tích hợp bản đồ trực quan.

Dự án được xây dựng với kiến trúc **Monorepo**, tách biệt rõ ràng giữa Client (Người dùng), Server (Backend API) và Admin Panel (Quản trị viên).

---

## 🚀 Tính năng nổi bật (Key Features)

### 👤 User Application (Frontend)
- **Authentication**: Đăng nhập/Đăng ký bảo mật qua **Firebase Auth** (Google/Email), hỗ trợ Quên mật khẩu.
- **Advanced Search**: Tìm kiếm nhà hàng theo đa tiêu chí (Vị trí, Giá cả, Đánh giá, Category) với giao diện trực quan.
- **Interactive Map**: Tích hợp **Leaflet Connect** để hiển thị vị trí nhà hàng và dẫn đường.
- **Food Tour Planner**: Tính năng độc đáo cho phép người dùng **Kéo & Thả (DnD Kit)** để sắp xếp thứ tự các địa điểm trong chuyến đi ăn uống của mình.
- **User Profile**: Quản lý lịch sử hoạt động, chỉnh sửa thông tin cá nhân.
- **Real-time**: Thông báo và cập nhật trạng thái thời gian thực với **Socket.io**.

### 🛠 Admin Dashboard
- **Dashboard Overview**: Thống kê tổng quan hệ thống.
- **Content Management**: Quản lý Nhà hàng, Món ăn, Danh mục (Categories) với đầy đủ CRUD.
- **User Management**: Quản lý người dùng hệ thống.
- **Media Management**: Tích hợp upload ảnh lên **Cloudinary**.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

### Client (Frontend)
- **Core**: React 19, Vite (Super fast build tool).
- **Styling**: Tailwind CSS (Utility-first), Lucide React (Icons).
- **State/Logic**: Axios (API), Date-fns, Dnd-kit (Drag & Drop UI).
- **Maps**: React Leaflet, Leaflet.
- **Real-time**: Socket.io Client.

### Server (Backend)
- **Runtime**: Node.js.
- **Framework**: Express.js.
- **Database**: MongoDB (Mongoose ORM) - Thiết kế Aggregation mạnh mẽ.
- **Authentication**: Firebase Admin SDK & JWT (JSON Web Tokens).
- **Services**: 
    - **Cloudinary**: Lưu trữ và tối ưu hóa hình ảnh.
    - **Nodemailer**: Gửi email thông báo/reset password.
    - **Socket.io**: Xử lý kết nối thời gian thực.

### Admin Panel
- **Framework**: React 18 + Vite.
- **Styling**: Tailwind CSS.

---

## ⚙️ Cài đặt & Chạy dự án (Installation)

### Yêu cầu tiên quyết
- Node.js (v18 trở lên)
- MongoDB (Local hoặc Atlas)
- Tài khoản Cloudinary & Firebase

### Các bước cài đặt

Clone dự án về máy:
```bash
git clone https://github.com/your-username/TDTT_FoodWebsite.git
cd TDTT_FoodWebsite
```

#### 1. Backend Setup
```bash
cd backend
npm install
# Cấu hình biến môi trường .env và thêm serviceAccountKey.json vào config/
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 3. Admin Setup
```bash
cd admin/admin-panel
npm install
npm run dev
```

---

## 📂 Cấu trúc dự án (Directory Structure)

```
TDTT_FoodWebsite/
├── backend/                # Express Server & API logic
│   ├── config/             # DB & Service configurations
│   ├── controllers/        # Business logic for Users, Restaurants, FoodTours
│   ├── models/             # Mongoose Schemas
│   └── server.js           # App Entry point
├── frontend/               # User React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application Views (FoodTour, Profile, etc.)
│   │   └── context/        # Global State Management
├── admin/                  # Admin Dashboard Application
└── Instruction.md          # Ghi chú cài đặt nhanh
```

---

## 📞 Liên hệ

Học viên thực hiện: **[Tên Của Bạn]**
Email: [email@example.com]
GitHub: [github.com/your-username]
