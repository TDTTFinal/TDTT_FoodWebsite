# Search Quality Manual Scoring Template

## Hướng dẫn

Template này dùng để chấm thủ công chất lượng kết quả tìm kiếm.

**Cách sử dụng:**
1. Chạy script `eval_quality.py` để lấy top-5 results cho mỗi query
2. Đánh giá từng kết quả: Relevant (Y) hoặc Not Relevant (N)
3. Tính Hit@5 và Precision@5 dựa trên đánh giá

**Định nghĩa Relevant:**
- Kết quả khớp với ý định query
- Category phù hợp
- Món ăn/loại quán đúng yêu cầu

---

## Scoring Table

| Query ID | Query | Result #1 | Result #2 | Result #3 | Result #4 | Result #5 | Hit@5 | Precision@5 | Notes |
|----------|-------|-----------|-----------|-----------|-----------|-----------|-------|-------------|-------|
| 1 | cơm tấm sườn | Y/N | Y/N | Y/N | Y/N | Y/N | 0/1 | 0.0-1.0 | |
| 2 | bún bò huế | Y/N | Y/N | Y/N | Y/N | Y/N | 0/1 | 0.0-1.0 | |
| 3 | phở bò tái | Y/N | Y/N | Y/N | Y/N | Y/N | 0/1 | 0.0-1.0 | |

*(Thêm rows cho các queries còn lại)*

---

## Calculation Formula

**Hit@5:**
- `1` nếu có ít nhất 1 kết quả Relevant trong top 5
- `0` nếu không có kết quả Relevant nào

**Precision@5:**
```
Precision@5 = (Số kết quả Relevant) / 5
```

**Overall Metrics:**
```
Avg Hit@5 = (Tổng Hit@5) / (Số queries)
Avg Precision@5 = Trung bình Precision@5 của tất cả queries
```

---

## Example

**Query:** "cơm tấm sườn"

**Top-5 Results:**
1. Cơm Tấm ABC - **Y** (Relevant)
2. Cơm Tấm XYZ - **Y** (Relevant)
3. Quán Cafe 123 - **N** (Not Relevant, sai category)
4. Cơm Văn Phòng - **Y** (Relevant, cùng category)
5. Pizza Hut - **N** (Not Relevant)

**Scores:**
- Hit@5 = `1` (có kết quả relevant)
- Precision@5 = `3/5 = 0.6` (60%)

---

## Tips

- Đánh giá khách quan
- Xem xét cả tên và category
- Ghi chú cho các trường hợp biên (borderline cases)
- So sánh với ground truth nếu có
