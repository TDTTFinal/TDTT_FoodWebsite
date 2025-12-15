# API Contract - TDTT_FoodWebsite

> **Base URL**: `http://localhost:5000/api`  
> **Ngày cập nhật**: 15/12/2024

---

## Mục lục
1. [Authentication](#1-authentication-apiauth)
2. [Users](#2-users-apiusers)
3. [Restaurants](#3-restaurants-apirestaurants)
4. [Reviews](#4-reviews-apireviews)
5. [Food Tours](#5-food-tours-apifood-tours)
6. [Search](#6-search-apisearch)
7. [Weather](#7-weather-apiweather)
8. [Contact](#8-contact-api)
9. [System](#9-system)

---

## 1. Authentication (`/api/auth`)

### 1.1 Đăng ký tài khoản
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
**Response:** `{ token, user }`

---

### 1.2 Đăng nhập
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:** `{ token, user }`

---

### 1.3 Quên mật khẩu
```
POST /api/auth/forgot-password
```
**Request Body:**
```json
{
  "email": "string"
}
```
**Response:** `{ message }`

---

### 1.4 Đặt lại mật khẩu
```
POST /api/auth/reset-password
```
**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```
**Response:** `{ message }`

---

### 1.5 Đăng nhập bằng Google
```
POST /api/auth/google
```
**Request Body:**
```json
{
  "idToken": "string"
}
```
**Response:** `{ token, user }`

---

## 2. Users (`/api/users`)

> ⚠️ **Tất cả endpoints yêu cầu**: `Authorization: Bearer <token>`

### 2.1 Upload avatar
```
POST /api/users/upload-avatar
```
**Request:** `multipart/form-data`
- `avatar`: File ảnh (max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Upload ảnh thành công!",
  "url": "https://...",
  "user": { ... }
}
```

---

### 2.2 Lấy thông tin profile
```
GET /api/users/profile
```
**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "phone": "string",
    "address": "string"
  }
}
```

---

### 2.3 Cập nhật profile
```
PUT /api/users/profile
```
**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "address": "string"
}
```
**Response:** `{ success, message, user }`

---

### 2.4 Đổi mật khẩu
```
POST /api/users/change-password
```
**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
**Response:** `{ success, message }`

---

## 3. Restaurants (`/api/restaurants`)

### 3.1 Lấy danh sách nhà hàng
```
GET /api/restaurants
```
**Query Params:** `?page=1&limit=10&category=...`

**Response:** `[{ _id, name, address, images, avg_rating, ... }]`

---

### 3.2 Lấy nhà hàng nổi bật
```
GET /api/restaurants/featured
```
**Response:** `[{ restaurant objects }]`

---

### 3.3 Lấy reviews mới nhất
```
GET /api/restaurants/reviews/latest
```
**Response:** `[{ review objects }]`

---

### 3.4 Lấy nhà hàng gần đây
```
GET /api/restaurants/nearby
```
**Query Params:** `?lat=10.7769&lon=106.7009&radius=5`

**Response:** `[{ restaurant objects }]`

---

### 3.5 Lấy nhà hàng theo ngữ cảnh (thời gian)
```
GET /api/restaurants/contextual
```
**Response:** `[{ restaurant objects }]`

---

### 3.6 Lấy bộ sưu tập nhà hàng
```
GET /api/restaurants/collections
```
**Response:** `[{ collection objects }]`

---

### 3.7 Lấy thống kê danh mục
```
GET /api/restaurants/categories/stats
```
**Response:**
```json
[
  { "category": "Quán ăn", "count": 50 },
  { "category": "Cafe", "count": 30 }
]
```

---

### 3.8 Lấy chi tiết nhà hàng
```
GET /api/restaurants/:id
```
**Params:** `id` - Restaurant ID

**Response:** `{ restaurant object }`

---

### 3.9 Tạo nhà hàng (Admin)
```
POST /api/restaurants
```
**Request Body:**
```json
{
  "name": "string",
  "address": "string",
  "location": { "lat": number, "lng": number },
  "category": "string",
  "price_range": "string",
  "images": ["url1", "url2"],
  "menu": [{ "name": "string", "price": number }]
}
```

---

### 3.10 Cập nhật nhà hàng (Admin)
```
PUT /api/restaurants/:id
```
**Request Body:** Tương tự POST

---

### 3.11 Xóa nhà hàng (Admin)
```
DELETE /api/restaurants/:id
```
**Response:** `{ message }`

---

## 4. Reviews (`/api/reviews`)

### 4.1 Lấy reviews của nhà hàng
```
GET /api/reviews/restaurant/:id
```
**Query Params:** 
- `page` (default: 1)
- `limit` (default: 10)  
- `sort`: `newest` | `highest` | `lowest` | `helpful`

**Response:**
```json
{
  "success": true,
  "data": [{ review objects }],
  "stats": {
    "avgRating": 8.5,
    "totalReviews": 50,
    "rating10": 20,
    "rating8": 15,
    "rating6": 10,
    "rating4": 3,
    "rating2": 2
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 4.2 Upload ảnh review
```
POST /api/reviews/upload
```
**Request:** `multipart/form-data`
- `images`: File[] (max 5 files, 5MB each)

**Response:**
```json
{
  "success": true,
  "urls": ["https://cloudinary...", "..."]
}
```

---

### 4.3 Tạo review mới
```
POST /api/reviews
```
**Request Body:**
```json
{
  "restaurant": "restaurantId",
  "userId": "userId (optional)",
  "title": "string",
  "rating": 8,
  "content": "string",
  "images": ["url1", "url2"],
  "tags": ["Ngon", "Sạch sẽ"],
  "visitDate": "2024-12-15",
  "isAnonymous": false
}
```

---

### 4.4 Cập nhật review
```
PUT /api/reviews/:id
```
**Request Body:**
```json
{
  "title": "string",
  "rating": number,
  "content": "string",
  "images": [],
  "tags": [],
  "visitDate": "string"
}
```

---

### 4.5 Xóa review (Soft delete)
```
DELETE /api/reviews/:id
```
**Response:** `{ success, message }`

---

### 4.6 Like/Unlike review
```
POST /api/reviews/:id/like
```
**Request Body:**
```json
{
  "userId": "string"
}
```
**Response:**
```json
{
  "success": true,
  "liked": true,
  "likesCount": 15
}
```

---

### 4.7 Báo cáo review
```
POST /api/reviews/:id/report
```
**Request Body:**
```json
{
  "userId": "string",
  "reason": "Nội dung không phù hợp"
}
```
**Response:** `{ success, message }`

---

## 5. Food Tours (`/api/food-tours`)

> ⚠️ **Tất cả endpoints yêu cầu**: `Authorization: Bearer <token>`

### 5.1 Tạo Food Tour mới
```
POST /api/food-tours
```
**Request Body:**
```json
{
  "name": "Tour ẩm thực Q1",
  "description": "Khám phá ẩm thực Quận 1",
  "tourItems": [
    {
      "restaurant": "restaurantId",
      "order": 1,
      "timeSlot": "morning",
      "notes": "Ăn sáng"
    }
  ],
  "totalRestaurants": 3
}
```

---

### 5.2 Lấy danh sách Food Tours của user
```
GET /api/food-tours
```
**Response:**
```json
{
  "success": true,
  "tours": [{ tour objects }]
}
```

---

### 5.3 Lấy chi tiết Food Tour
```
GET /api/food-tours/:id
```
**Response:** `{ success, tour }`

---

### 5.4 Cập nhật Food Tour
```
PUT /api/food-tours/:id
```
**Request Body:** Tương tự POST

---

### 5.5 Xóa Food Tour
```
DELETE /api/food-tours/:id
```
**Response:** `{ success, message }`

---

## 6. Search (`/api/search`)

### 6.1 Tìm kiếm nâng cao
```
GET /api/search/advanced
```
**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | **required** | Từ khóa tìm kiếm |
| `top_k` | number | 9999 | Số kết quả tối đa |
| `lat` | number | 10.7769 | Vĩ độ |
| `lon` | number | 106.7009 | Kinh độ |
| `radius` | number | 0 | Bán kính (km) |
| `alpha` | number | 0.6 | Trọng số semantic vs TF-IDF |
| `min_score` | number | 0.35 | Điểm tối thiểu |

**Response:**
```json
{
  "success": true,
  "total": 25,
  "data": [{ enriched restaurant objects }],
  "metadata": {
    "query": "bún bò",
    "min_score_applied": 0.35,
    "alpha_applied": 0.6,
    "original_total": 100,
    "filtered_total": 25
  }
}
```

---

## 7. Weather (`/api/weather`)

### 7.1 Lấy dự báo thời tiết
```
GET /api/weather/forecast
```
**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `lat` | number | 10.7769 | Vĩ độ |
| `lon` | number | 106.7009 | Kinh độ |
| `slot` | string | - | Khung giờ: `morning`, `lunch`, `afternoon`, `dinner` |

**Response:**
```json
{
  "success": true,
  "location": { "latitude": 10.7769, "longitude": 106.7009 },
  "forecast": [
    {
      "time": "2024-12-15T06:00",
      "hour": 6,
      "precipitation_probability": 30,
      "temperature": 28,
      "weathercode": 2
    }
  ],
  "slotWarning": {
    "slot": "lunch",
    "timeRange": "10:00 - 14:00",
    "avgPrecipitation": 45,
    "maxPrecipitation": 60,
    "shouldWarn": true,
    "message": "Dự báo có mưa (60%) trong khung giờ này..."
  }
}
```

---

### 7.2 Kiểm tra thời tiết theo khung giờ
```
GET /api/weather/check-slot
```
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | number | No | Vĩ độ (default: HCMC) |
| `lon` | number | No | Kinh độ (default: HCMC) |
| `slot` | string | **Yes** | `morning`, `lunch`, `afternoon`, `dinner` |

**Response:**
```json
{
  "success": true,
  "slot": "lunch",
  "weather": {
    "temperature": 32,
    "precipitation": 45,
    "condition": "partly_cloudy",
    "description": "Có mây",
    "icon": "⛅",
    "isRainy": false
  },
  "shouldWarn": false,
  "message": "Thời tiết: Có mây, 32°C"
}
```

**Time Slots:**
| Slot | Giờ |
|------|-----|
| `morning` | 06:00 - 10:00 |
| `lunch` | 10:00 - 14:00 |
| `afternoon` | 14:00 - 18:00 |
| `dinner` | 18:00 - 22:00 |

---

## 8. Contact (`/api`)

### 8.1 Gửi liên hệ từ trang About
```
POST /api/about/contact
```
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```
**Response:** `{ success, message }`

---

### 8.2 Lấy danh sách liên hệ (Admin)
```
GET /api/admin/about/contact
```
> ⚠️ **Yêu cầu**: Admin authentication

**Response:** `[{ contact objects }]`

---

## 9. System

### 9.1 Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok"
}
```

---

## Mã lỗi chung

| Code | Description |
|------|-------------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Request không hợp lệ |
| 401 | Chưa xác thực / Token hết hạn |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi server |

---

## Authentication Header

Đối với các endpoints yêu cầu xác thực:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## External APIs Sử dụng

| Service | URL | Mô tả |
|---------|-----|-------|
| HuggingFace Search | `https://nemo-chewz.hf.space/api/v1/search/` | Semantic search |
| Open-Meteo | `https://api.open-meteo.com/v1/forecast` | Dự báo thời tiết |
| Cloudinary | (configured) | Lưu trữ ảnh |
| Firebase Admin | (configured) | Google OAuth |