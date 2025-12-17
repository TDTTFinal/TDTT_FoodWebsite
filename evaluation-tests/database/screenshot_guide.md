# MongoDB Compass Screenshot Guide

## Mục đích

Chụp screenshot MongoDB Compass để minh chứng số lượng restaurants > 1000

---

## Hướng dẫn

### Bước 1: Mở MongoDB Compass

1. Khởi động MongoDB Compass
2. Kết nối đến database local: `mongodb://localhost:27017`

### Bước 2: Chọn Database và Collection

1. Chọn database tên của project (thường là `tdtt_food` hoặc tương tự)
2. Click vào collection `restaurants`

### Bước 3: Xem Document Count

Trong tab **Documents**, phía trên sẽ hiển thị:
```
Documents (1,234)
```

Số này chính là tổng số restaurants trong database.

### Bước 4: Chụp Screenshot

**Cách 1: Full window**
- Chụp toàn bộ cửa sổ MongoDB Compass
- Đảm bảo document count hiển thị rõ ràng

**Cách 2: Chỉ collection info**
- Chụp phần header của collection tab
- Include: Database name, Collection name, Document count

### Bước 5: Lưu Screenshot

Lưu file với tên rõ ràng:
```
database_results/mongodb_compass_restaurants_count.png
```

---

## Alternative: Terminal Command

Nếu không có MongoDB Compass, dùng `mongosh`:

```bash
mongosh "mongodb://localhost:27017/tdtt_food"

# In mongosh shell:
db.restaurants.countDocuments()
```

Chụp screenshot terminal output showing count.

---

## Checklist

- [ ] Database name visible
- [ ] Collection name = "restaurants"
- [ ] Document count clearly shown
- [ ] Screenshot saved to `database/results/`
- [ ] Count > 1000 ✅

---

## Example Screenshot Location

```
evaluation-tests /
└─ database/
   └─ results/
      └─ mongodb_compass_screenshot.png  ← Save here
```
