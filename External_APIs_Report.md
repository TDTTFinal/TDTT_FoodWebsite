# 📋 Báo Cáo Các Công Nghệ API Bên Ngoài

> **Dự án:** TDTT Food Website - Hệ thống gợi ý nhà hàng thông minh
> 
> **Ngày tạo:** 15/12/2024

---

## 📊 Tổng Quan

Dự án sử dụng **5 API/Service bên ngoài** để cung cấp các tính năng như: xác thực người dùng, lưu trữ hình ảnh, hiển thị bản đồ, tính toán lộ trình, và dự báo thời tiết.

| # | API/Service | Mục đích | Phí |
|---|-------------|----------|-----|
| 1 | Firebase Authentication | Đăng nhập Google OAuth | Miễn phí (quota giới hạn) |
| 2 | Cloudinary | Lưu trữ & quản lý hình ảnh | Miễn phí (25GB) |
| 3 | OpenStreetMap + Leaflet | Hiển thị bản đồ | Miễn phí |
| 4 | OSRM | Tính toán lộ trình đường đi | Miễn phí |
| 5 | Open-Meteo | Dự báo thời tiết | Miễn phí |

---

## 1️⃣ Firebase Authentication

### Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| **Provider** | Google Firebase |
| **SDK Version** | `firebase@^12.6.0` |
| **Tính năng** | Google OAuth Sign-In |
| **Vị trí sử dụng** | Frontend |

### Cấu hình
```javascript
// frontend/src/firebaseConfig.js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tdtt-food-website.firebaseapp.com",
  projectId: "tdtt-food-website",
  storageBucket: "tdtt-food-website.firebasestorage.app",
  messagingSenderId: "1037452134820",
  appId: "1:1037452134820:web:11d7ccb86a0dbb4f321931"
};
```

### Chức năng sử dụng
- **`signInWithPopup`**: Đăng nhập bằng popup Google
- **`GoogleAuthProvider`**: Xác thực qua tài khoản Google

### Files liên quan
- [firebaseConfig.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/firebaseConfig.js)
- [SignInPage.jsx](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/pages/auth/SignInPage.jsx)

---

## 2️⃣ Cloudinary

### Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| **Provider** | Cloudinary |
| **SDK Version** | `cloudinary@^2.8.0` |
| **Tính năng** | Upload và lưu trữ hình ảnh |
| **Vị trí sử dụng** | Backend |

### Cấu hình
```javascript
// backend/config/cloudinary.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

### Biến môi trường cần thiết
```env
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

### Chức năng sử dụng
| Chức năng | Mô tả |
|-----------|-------|
| Upload ảnh đánh giá | Người dùng upload ảnh khi viết review |
| Upload avatar | Người dùng thay đổi ảnh đại diện |

### Files liên quan
- [cloudinary.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/backend/config/cloudinary.js)
- [reviewRoutes.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/backend/routes/reviewRoutes.js)
- [userRoutes.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/backend/routes/userRoutes.js)

---

## 3️⃣ OpenStreetMap + Leaflet

### Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| **Provider** | OpenStreetMap Foundation |
| **Library Version** | `leaflet@^1.9.4`, `react-leaflet@^5.0.0` |
| **Tính năng** | Hiển thị bản đồ tương tác |
| **Vị trí sử dụng** | Frontend |

### Endpoint
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Chức năng sử dụng
| Chức năng | Mô tả |
|-----------|-------|
| Hiển thị vị trí nhà hàng | Bản đồ trên trang chi tiết nhà hàng |
| Food Tour Map | Bản đồ lộ trình food tour với các điểm dừng |
| Polyline Routing | Hiển thị đường đi giữa các điểm |

### Files liên quan
- [TourMap.jsx](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/components/foodtour/TourMap.jsx)
- [RestaurantDetailPage.jsx](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/pages/RestaurantDetailPage.jsx)
- [leafletFix.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/map/leafletFix.js)

---

## 4️⃣ OSRM (Open Source Routing Machine)

### Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| **Provider** | Project OSRM (OpenStreetMap-based) |
| **Tính năng** | Tính toán lộ trình đường đi thực tế |
| **Vị trí sử dụng** | Frontend |

### Endpoint
```
https://router.project-osrm.org
```

### API Endpoints sử dụng
| Endpoint | Mô tả |
|----------|-------|
| `/route/v1/driving/{coords}` | Tính lộ trình giữa các điểm |
| `/table/v1/driving/{coords}` | Tính ma trận khoảng cách (distance matrix) |
| `/trip/v1/driving/{coords}` | Tối ưu hóa lộ trình (Traveling Salesman) |

### Chức năng sử dụng
| Chức năng | Mô tả |
|-----------|-------|
| `getRoute()` | Lấy lộ trình giữa các điểm |
| `getRouteDistance()` | Tính khoảng cách đường đi giữa 2 điểm |
| `getDistanceMatrix()` | Tính khoảng cách từ 1 điểm đến nhiều điểm |
| `getOptimizedRoute()` | Tối ưu hóa thứ tự các điểm dừng |

### Files liên quan
- [osrmService.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/services/osrmService.js)

---

## 5️⃣ Open-Meteo

### Thông tin chung
| Thuộc tính | Giá trị |
|------------|---------|
| **Provider** | Open-Meteo |
| **Tính năng** | Dự báo thời tiết theo giờ |
| **Vị trí sử dụng** | Backend |
| **Yêu cầu API Key** | ❌ Không cần |

### Endpoint
```
https://api.open-meteo.com/v1/forecast
```

### Parameters sử dụng
```javascript
{
  latitude: <vĩ độ>,
  longitude: <kinh độ>,
  hourly: "precipitation_probability,temperature_2m,weathercode",
  timezone: "Asia/Ho_Chi_Minh",
  forecast_days: 1
}
```

### Chức năng sử dụng
| Chức năng | Endpoint | Mô tả |
|-----------|----------|-------|
| Dự báo thời tiết | `/api/weather/forecast` | Lấy dự báo thời tiết theo giờ |
| Kiểm tra khung giờ | `/api/weather/check-slot` | Cảnh báo mưa cho từng buổi |

### Time Slots
| Slot | Khung giờ |
|------|-----------|
| `morning` | 06:00 - 10:00 |
| `lunch` | 10:00 - 14:00 |
| `afternoon` | 14:00 - 18:00 |
| `dinner` | 18:00 - 22:00 |

### Files liên quan
- [weatherRoutes.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/backend/routes/weatherRoutes.js)
- [weatherService.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/services/weatherService.js)

---

## 📁 Tổng Hợp Dependencies

### Frontend (`package.json`)
```json
{
  "firebase": "^12.6.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0"
}
```

### Backend (`package.json`)
```json
{
  "cloudinary": "^2.8.0",
  "axios": "^1.x.x"
}
```

---

## 🔐 Biến Môi Trường Cần Thiết

```env
# Cloudinary (Backend)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Firebase config được cấu hình trực tiếp trong firebaseConfig.js
```

---

## 📝 Ghi Chú

> [!NOTE]
> - **OSRM** và **Open-Meteo** là các API miễn phí, không yêu cầu API key
> - **OpenStreetMap** tiles sử dụng public server, nên tuân thủ [usage policy](https://operations.osmfoundation.org/policies/tiles/)
> - **Firebase** và **Cloudinary** có free tier với quota giới hạn phù hợp cho development

> [!TIP]
> Đối với production, nên cân nhắc:
> - Self-host OSRM server để tránh rate limiting
> - Sử dụng CDN cho Cloudinary images
> - Monitor Firebase usage để tránh vượt quota
