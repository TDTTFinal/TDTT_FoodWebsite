# 🚀 Hướng Dẫn Chạy Từng Bước

> Hướng dẫn chi tiết để chạy evaluation tests cho TDTT_FoodWebsite

---

## ✅ Bước 0: Kiểm Tra Yêu Cầu

### Đảm bảo đã cài đặt:

```powershell
# Kiểm tra k6
k6 version

# Kiểm tra Python
python --version

# Kiểm tra pip
pip --version
```

**Nếu chưa có k6:**
- Download: https://github.com/grafana/k6/releases
- Hoặc: `choco install k6`

**Nếu chưa có Python packages:**
```powershell
pip install requests pandas pymongo python-dotenv
```

---

## 📝 Bước 1: Setup Configuration

### 1.1. Vào thư mục evaluation-tests

```powershell
cd e:\hcmus\tdtt\TDTT_FoodWebsite\evaluation-tests
```

### 1.2. Tạo file .env từ template

```powershell
copy env.example .env
```

### 1.3. Mở và chỉnh sửa .env (nếu cần)

```powershell
notepad .env
```

**Kiểm tra các giá trị:**
- `BASE_URL=http://localhost:5000` ← Backend của bạn
- `MONGO_URI=mongodb://localhost:27017/tdtt_food` ← MongoDB của bạn
- Các giá trị khác thường không cần đổi

**Lưu và đóng file**

---

## 🏥 Bước 2: Health Check (Smoke Test)

**Mục đích:** Kiểm tra xem tất cả APIs có sống không

### 2.1. Đảm bảo backend đang chạy

```powershell
# Mở terminal khác, vào thư mục backend
cd e:\hcmus\tdtt\TDTT_FoodWebsite\backend
npm run dev
# Hoặc: node server.js
```

**Kiểm tra:** Truy cập http://localhost:5000/api/health

### 2.2. Chạy smoke test

```powershell
cd e:\hcmus\tdtt\TDTT_FoodWebsite\evaluation-tests 
k6 run performance/scripts/smoke.k6.js
```

**Kết quả mong đợi:**
```
✓ Backend: status 200
✓ HuggingFace: has steps or routes
✓ OSRM: has routes

checks.........................: 100.00%
```

**Nếu FAILED:**
- ❌ Backend: Kiểm tra backend có chạy không
- ❌ HuggingFace: Internet có OK không, HF Space có sleeping không
- ❌ OSRM: Kiểm tra internet connection

---

## 📊 Bước 3: Performance Tests

### 3.1. Test Local Search API

**Thời gian:** ~2.5 phút

```powershell
k6 run performance/scripts/search.k6.js --summary-export=performance/results/search_summary.json
```

**Trong khi chạy:**
- Bạn sẽ thấy progress bar
- Các requests đang được gửi với queries tiếng Việt
- VUs (Virtual Users) sẽ tăng từ 1→5→5→1

**Kết quả mong đợi:**
```
http_req_duration..............: avg=1200ms p95=2500ms
http_req_failed................: 2.1%
✓ Thresholds met
```

**Xem kết quả chi tiết:**
```powershell
notepad performance\results\search_summary.json
```

---

### 3.2. Test HuggingFace API

**Thời gian:** ~2.5 phút

```powershell
k6 run performance/scripts/hf_search.k6.js --summary-export=performance/results/hf_summary.json
```

**Lưu ý:** 
- HuggingFace API có thể chậm hơn local
- Nếu timeout, chờ 1 phút rồi chạy lại

**Xem kết quả:**
```powershell
notepad performance\results\hf_summary.json
```

---

### 3.3. Test OSRM Routing API

**Thời gian:** ~2.5 phút

```powershell
k6 run performance/scripts/osrm_routing.k6.js --summary-export=performance/results/osrm_summary.json
```

**Đặc điểm:**
- Test cả `/route` (routing thường) và `/trip` (TSP optimization)
- Sử dụng OSRM public server (có thể chậm)

**Xem kết quả:**
```powershell
notepad performance\results\osrm_summary.json
```

---

## 🔍 Bước 4: Search Quality Test

**Thời gian:** ~30 giây - 1 phút

```powershell
python quality/eval_quality.py
```

**Quá trình:**
1. Đọc 30 queries từ `queries.csv`
2. Gọi API search cho từng query
3. Tính Hit@5 và Precision@5
4. Xuất báo cáo

**Output trong console:**
```
[1/30] Testing: 'cơm tấm sườn'
  ✓ Results: 15, Hit@5: 1, Precision@5: 0.80
[2/30] Testing: 'bún bò huế'
  ✓ Results: 12, Hit@5: 1, Precision@5: 0.60
...
```

**Xem kết quả:**
```powershell
notepad quality\results\quality_metrics.txt
```

**Kết quả mong đợi:**
```
Average Hit@5:       85%
Average Precision@5: 72%
```

---

## 🗺️ Bước 5: Route Improvement Test

**Thời gian:** ~1 phút

```powershell
python routing/eval_route_improvement.py
```

**Quá trình:**
1. Đọc 8 sample tours từ `routes_sample.json`
2. Tính khoảng cách Greedy (thứ tự ban đầu)
3. Gọi OSRM API để optimize
4. Tính % improvement

**Output trong console:**
```
[1/8] Evaluating: Tour Quận 1 - Trung tâm (5 stops)
  📍 Greedy (input order): 8.45 km
  🚀 OSRM Optimized:       7.12 km
  ✅ Improvement:          +15.74%
```

**Xem kết quả:**
```powershell
notepad routing\results\route_improvement.txt
notepad routing\results\route_comparison.csv
```

---

## 💾 Bước 6: Database Size Check

**Thời gian:** ~5 giây

```powershell
python database/check_db_size.py
```

**Yêu cầu:**
- MongoDB đang chạy
- Có database `tdtt_food` (hoặc tên trong MONGO_URI)

**Output:**
```
✅ Connected to MongoDB successfully

📊 Total Restaurants: 1234
Target: > 1000
Status: ✅ PASSED
```

**Xem kết quả:**
```powershell
notepad database\results\db_size.txt
```

**Nếu lỗi kết nối:**
```powershell
# Kiểm tra MongoDB đang chạy
mongosh
# Hoặc mở MongoDB Compass
```

---

## 📊 Bước 7: Tạo Báo Cáo Tổng Hợp

**Thời gian:** ~2 giây

**Điều kiện:** Đã chạy xong tất cả tests ở Bước 3-6

```powershell
python generate_report.py
```

**Quá trình:**
1. Đọc tất cả JSON summaries từ k6
2. Đọc quality metrics
3. Đọc routing improvement
4. Đọc database size
5. Tổng hợp thành 1 file TXT

**Output:**
```
📊 GENERATING MASTER EVALUATION REPORT
========================================
📈 Loading performance test results...
🔍 Loading search quality results...
🗺️  Loading route improvement results...
📊 Loading database size...
✍️  Generating master report...

✅ Master Report saved to: EVALUATION_REPORT.txt
```

---

## 📄 Bước 8: Xem Báo Cáo Cuối Cùng

```powershell
notepad EVALUATION_REPORT.txt
```

**Báo cáo sẽ có:**
1. ✅ Performance Metrics (k6)
   - Search API: p95, error rate
   - HuggingFace: p95, error rate
   - OSRM: p95, error rate
   
2. ✅ Database Size
   - Total restaurants
   - Pass/Fail status

3. ✅ Search Quality
   - Hit@5
   - Precision@5

4. ✅ Route Improvement
   - Average improvement %
   - Best/Worst cases

5. 📋 Quick reference để điền evaluation table

---

## 🎯 Bước 9: Điền Vào Evaluation Table

**Mở báo cáo:**
```powershell
notepad EVALUATION_REPORT.txt
```

**Tìm section:**
```
📋 HOW TO FILL EVALUATION TABLE
```

**Copy các số vào bảng báo cáo của bạn:**

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Search p95 | 1.2s | <3s | ✅ |
| Error Rate | 2.1% | <5% | ✅ |
| Database Size | 1234 | >1000 | ✅ |
| Hit@5 | 85% | >70% | ✅ |
| Route Improvement | 15.3% | >10% | ✅ |

---

## 🧑‍🔬 Bước 10: Usability Test (Thủ công)

### 10.1. Đọc kịch bản

```powershell
notepad usability\task_script.md
```

### 10.2. Chuẩn bị

1. Mở trình duyệt
2. Vào http://localhost:3000
3. Chuẩn bị đồng hồ bấm giờ

### 10.3. Thực hiện task

**START TIMER ⏱️**
1. Tìm quán: "bánh mì rồi cà phê"
2. Add vào Food Tour
3. Xem map
4. Lưu tour
**STOP TIMER ⏹️**

Ghi lại thời gian: _____ giây

### 10.4. Điền survey

```powershell
notepad usability\survey_form_template.md
```

---

## 📸 Bước 11: Screenshot MongoDB (Optional)

**Nếu cần minh chứng bằng ảnh:**

```powershell
notepad database\screenshot_guide.md
```

**Các bước:**
1. Mở MongoDB Compass
2. Connect đến localhost:27017
3. Chọn database → collection `restaurants`
4. Chụp screenshot document count
5. Lưu vào `database/results/`

---

## 🎉 Hoàn Thành!

**Checklist cuối cùng:**
- [x] Smoke test passed
- [x] 3 performance tests done
- [x] Search quality evaluated
- [x] Route improvement calculated
- [x] Database size checked
- [x] Master report generated
- [ ] Usability test done (manual)
- [ ] Screenshots taken (if needed)

**Files output quan trọng:**
```
evaluation-tests/
├── EVALUATION_REPORT.txt        ← 📊 MAIN OUTPUT
├── performance/results/
│   ├── search_summary.json
│   ├── hf_summary.json
│   └── osrm_summary.json
├── quality/results/
│   └── quality_metrics.txt
├── routing/results/
│   └── route_improvement.txt
└── database/results/
    └── db_size.txt
```

---

## ⚠️ Troubleshooting

### k6: command not found
```powershell
# Cài lại k6
choco install k6
# Hoặc download từ GitHub releases
```

### Python: No module named 'requests'
```powershell
pip install requests pandas pymongo python-dotenv
```

### Backend connection refused
```powershell
# Kiểm tra backend đang chạy
cd ..\backend
npm run dev
```

### MongoDB connection failed
```powershell
# Kiểm tra MongoDB
mongosh
# Hoặc
net start MongoDB
```

### OSRM timeout
- Đợi 1 phút rồi chạy lại
- OSRM public server đôi khi chậm

---

## 💡 Tips

1. **Chạy smoke test trước** để đảm bảo mọi thứ OK
2. **Mở 2 terminals:** 1 cho backend, 1 cho tests
3. **Chạy vào giờ ít traffic** để kết quả ổn định
4. **Backup results** trước khi chạy lại
5. **Screenshot mọi thứ** cho báo cáo

---

## 📞 Cần Trợ Giúp?

Xem file README.md để biết thêm chi tiết:
```powershell
notepad README.md
```

**Happy Testing! 🚀**
