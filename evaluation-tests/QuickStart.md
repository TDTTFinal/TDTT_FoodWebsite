cd evaluation-tests
copy env.example .env
# (Sửa .env nếu cần)

# Chạy tất cả tests
k6 run performance/scripts/smoke.k6.js
k6 run performance/scripts/search.k6.js --summary-export=performance/results/search_summary.json
python quality/eval_quality.py
python routing/eval_route_improvement.py
python database/check_db_size.py

# Tạo báo cáo TXTk
python generate_report.py

# Xem kết quả
notepad EVALUATION_REPORT.txt