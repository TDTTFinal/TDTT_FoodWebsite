# Evaluation & Testing System

> Hệ thống đánh giá toàn diện cho đồ án TDTT_FoodWebsite

Hệ thống này cung cấp các công cụ tự động và hướng dẫn để đo lường performance, chất lượng search, route optimization, và usability của web app.

---

## 📋 Nội dung

- [Cài đặt dependencies](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy tests](#chạy-tests)
  - [Performance Tests (k6)](#1-performance-tests-k6)
  - [Search Quality](#2-search-quality)
  - [Route Improvement](#3-route-improvement)
  - [Database Size](#4-database-size)
- [Tạo báo cáo tổng hợp](#tạo-báo-cáo-tổng-hợp)
- [Cách điền Evaluation Table](#cách-điền-evaluation-table)

---

## 🚀 Cài đặt

### 1. Cài k6 (Windows)

**Option A: Chocolatey**
```powershell
choco install k6
```

**Option B: Download binary**
1. Tải từ: https://github.com/grafana/k6/releases
2. Giải nén và thêm vào PATH

**Verify:**
```powershell
k6 version
```

### 2. Cài Python Dependencies

```powershell
pip install requests pandas pymongo python-dotenv
```

---

## ⚙️ Cấu hình

### 1. Copy file env

```powershell
cd evaluation-tests
copy env.example .env
```

### 2. Chỉnh sửa `.env`

Mở file `.env` và điều chỉnh các giá trị:

```bash
# Backend
BASE_URL=http://localhost:5000

# HuggingFace API
HF_BASE_URL=https://nemo-chewz.hf.space/api/v1/search/

# MongoDB
MONGO_URI=mongodb://localhost:27017/tdtt_food
```

### 3. Đảm bảo hệ thống đang chạy

- ✅ Backend: `http://localhost:5000`
- ✅ Frontend: `http://localhost:3000`
- ✅ MongoDB: `localhost:27017`

---

## 🧪 Chạy Tests

### 1. Performance Tests (k6)

#### Smoke Test (kiểm tra APIs sống)

```powershell
k6 run performance/scripts/smoke.k6.js
```

**Expected output:**
```
✓ Backend: status 200
✓ HuggingFace: has steps or routes
✓ OSRM: has routes
```

---

#### Search API Test

```powershell
k6 run performance/scripts/search.k6.js --summary-export=performance/results/search_summary.json
```

**Metrics:**
- p95 response time < 3s
- Error rate < 5%

**Duration:** ~2.5 phút

---

#### HuggingFace API Test

```powershell
k6 run performance/scripts/hf_search.k6.js --summary-export=performance/results/hf_summary.json
```

**Metrics:**
- p95 response time < 3s
- Error rate < 5%

**Duration:** ~2.5 phút

---

#### OSRM Routing Test

```powershell
k6 run performance/scripts/osrm_routing.k6.js --summary-export=performance/results/osrm_summary.json
```

**Metrics:**
- p95 response time < 5s
- Error rate < 5%

**Duration:** ~2.5 phút

---

### 2. Search Quality

```powershell
python quality/eval_quality.py
```

**Output:**
- `quality/results/quality_metrics.txt` - Báo cáo tổng hợp
- `quality/results/search_results.json` - Raw data

**Metrics:**
- Hit@5: % queries có kết quả relevant
- Precision@5: % kết quả relevant trong top 5

**Optional: Manual scoring**

Xem file `quality/scoring_template.md` để chấm thủ công cho chính xác hơn.

---

### 3. Route Improvement

```powershell
python routing/eval_route_improvement.py
```

**Output:**
- `routing/results/route_improvement.txt` - Báo cáo
- `routing/results/route_comparison.csv` - CSV data

**Metrics:**
- Average improvement %
- Best/Worst case

**Duration:** ~1 phút (tuỳ OSRM API)

---

### 4. Database Size

```powershell
python database/check_db_size.py
```

**Output:**
- `database/results/db_size.txt`

**Metrics:**
- Total restaurants count (target: > 1000)

**Alternative: Screenshot**

Nếu không chạy được script, xem hướng dẫn:
```
database/screenshot_guide.md
```

---

## 📊 Tạo Báo Cáo Tổng Hợp

### Chạy Master Report Generator

Sau khi đã chạy tất cả tests ở trên:

```powershell
python generate_report.py
```

**Output:**
```
EVALUATION_REPORT.txt
```

File này tổng hợp **TẤT CẢ** kết quả thành một báo cáo duy nhất, bao gồm:

✅ Performance metrics (k6)  
✅ Database size  
✅ Search quality  
✅ Route improvement  
⚠️ Usability (manual test required)

---

## 📝 Cách Điền Evaluation Table

Mở file `EVALUATION_REPORT.txt` và tìm section:

```
📋 HOW TO FILL EVALUATION TABLE
```

Sẽ có summary ngắn gọn như:

```
1. Search Response Time:    p95: 1.2s, Error: 2.1%
2. Route Optimization Time: p95: 4.2s, Error: 0.3%
3. Database Size:           1234 restaurants
4. Search Quality:          Hit@5: 85%, Precision@5: 72%
5. Route Improvement:       Avg: 15.3%
6. Usability:               See manual test results
```

Copy các số này vào bảng Evaluation trong báo cáo.

---

## 🧑‍🔬 Usability Testing (Manual)

### 1. Task Completion Test

See: `usability/task_script.md`

**Kịch bản:**
1. User tìm quán ăn sáng
2. Add vào Food Tour
3. Xem map
4. Lưu tour

**Đo:** Thời gian hoàn thành (giây)

### 2. User Survey

See: `usability/survey_form_template.md`

**Metrics:**
- Ease of use (1-5)
- Speed (1-5)
- Satisfaction (1-5)

---

## 📂 Cấu trúc Thư mục

```
evaluation-tests/
├── README.md                    ← Bạn đang ở đây
├── env.example                  ← Template config
├── .env                         ← Config của bạn (gitignored)
├── generate_report.py           ← 🎯 Master script
│
├── performance/
│   ├── scripts/
│   │   ├── smoke.k6.js         ← Health check
│   │   ├── search.k6.js        ← Local search test
│   │   ├── hf_search.k6.js     ← HF API test
│   │   └── osrm_routing.k6.js  ← OSRM test
│   └── results/
│       ├── search_summary.json
│       ├── hf_summary.json
│       └── osrm_summary.json
│
├── quality/
│   ├── queries.csv              ← 30 test queries
│   ├── eval_quality.py          ← Script đo Hit@K
│   ├── scoring_template.md      ← Manual scoring guide
│   └── results/
│       ├── quality_metrics.txt
│       └── search_results.json
│
├── routing/
│   ├── routes_sample.json       ← 8 sample tours
│   ├── eval_route_improvement.py
│   └── results/
│       ├── route_improvement.txt
│       └── route_comparison.csv
│
├── database/
│   ├── check_db_size.py
│   ├── screenshot_guide.md
│   └── results/
│       └── db_size.txt
│
└── usability/
    ├── task_script.md           ← Kịch bản test
    ├── survey_form_template.md  ← Form khảo sát
    └── results/
        └── (lưu kết quả manual test)
```

---

## 🎯 Quick Start (Chạy Tất Cả)

### Windows PowerShell

```powershell
# 1. Setup
cd evaluation-tests
copy env.example .env
# (Edit .env file)

# 2. Run smoke test first
k6 run performance/scripts/smoke.k6.js

# 3. Run all performance tests
k6 run performance/scripts/search.k6.js --summary-export=performance/results/search_summary.json
k6 run performance/scripts/hf_search.k6.js --summary-export=performance/results/hf_summary.json
k6 run performance/scripts/osrm_routing.k6.js --summary-export=performance/results/osrm_summary.json

# 4. Run Python evaluations
python quality/eval_quality.py
python routing/eval_route_improvement.py
python database/check_db_size.py

# 5. Generate master report
python generate_report.py

# 6. Open report
notepad EVALUATION_REPORT.txt
```

**Total time:** ~10-15 phút

---

## ⚠️ Troubleshooting

### k6: command not found

- Cài lại k6
- Kiểm tra PATH

### Python: ModuleNotFoundError

```powershell
pip install requests pandas pymongo python-dotenv
```

### OSRM API timeout

- OSRM public server đôi khi chậm
- Chạy lại script hoặc tăng timeout trong code

### MongoDB connection failed

- Check MongoDB đang chạy:
  ```powershell
  mongosh
  ```
- Verify MONGO_URI trong `.env`

### HuggingFace API error

- HF Space có thể sleeping
- Truy cập URL này để wake up:
  ```
  https://nemo-chewz.hf.space
  ```

---

## 📈 Expected Metrics (Target)

| Metric | Target | Notes |
|--------|--------|-------|
| Search p95 | < 3s | Local backend |
| HF p95 | < 3s | External API |
| OSRM p95 | < 5s | Route optimization |
| Error Rate | < 5% | All APIs |
| Database Size | > 1000 | Restaurants |
| Hit@5 | > 70% | Search quality |
| Precision@5 | > 60% | Search quality |
| Route Improvement | > 10% | vs Greedy |
| Task Time | < 60s | Usability |

---

## 📚 References

- k6 Documentation: https://k6.io/docs/
- OSRM API: https://project-osrm.org/
- HuggingFace Spaces: https://huggingface.co/docs/hub/spaces

---

## 💡 Tips

1. **Chạy smoke test trước** để đảm bảo hệ thống OK
2. **Chạy vào giờ ít traffic** để kết quả ổn định hơn
3. **Chạy nhiều lần** và lấy trung bình nếu cần chính xác
4. **Backup results** trước khi chạy lại
5. **Screenshot tất cả** kết quả cho báo cáo

---

## 🤝 Support

Nếu có vấn đề:
1. Check `.env` configuration
2. Verify hệ thống đang chạy (backend + MongoDB)
3. Xem error logs
4. Check assumptions trong `implementation_plan.md`

---

**Happy Testing! 🚀**
