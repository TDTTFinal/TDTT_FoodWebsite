# Usability Test - Task Script

## Mục tiêu

Đo thời gian hoàn thành task "Tìm quán + Tạo Food Tour" và đánh giá trải nghiệm người dùng.

---

## Kịch bản Task

### Task: "Lên kế hoạch tour ẩm thực buổi sáng"

**Yêu cầu:**
1. Tìm 2-3 quán ăn phù hợp cho buổi sáng
2. Thêm các quán vào Food Tour
3. Xem bản đồ route
4. Lưu tour

---

## Hướng dẫn cho Người Test

### Chuẩn bị

1. Mở trình duyệt
2. Điều hướng đến: `http://localhost:3000`
3. Đăng nhập (nếu cần)
4. Chuẩn bị đồng hồ bấm giờ hoặc OBS để record

### Các bước thực hiện

**START TIMER ⏱️**

#### Bước 1: Tìm quán ăn sáng
1. Mở trang **Advanced Search**
2. Nhập query: "bánh mì rồi cà phê"
3. Chọn vị trí (GPS hoặc address)
4. Click "Search"
5. Xem kết quả

#### Bước 2: Thêm vào Food Tour
1. Từ kết quả search, click "Add to Tour" cho 2-3 quán
2. Hoặc: sử dụng tính năng "Apply Route" nếu có suggested routes

#### Bước 3: Xem Food Tour
1. Điều hướng đến trang Food Tour
2. Drag & drop các quán vào slots (Morning, Lunch, etc.)
3. Xem bản đồ route

#### Bước 4: Lưu Tour
1. Nhập tên tour: "Tour Ăn Sáng Quận 1"
2. Click "Save Tour"
3. Xác nhận lưu thành công

**STOP TIMER ⏹️**

---

## Cách Đo Thời Gian

### Option 1: Manual Stopwatch
- Bấm start khi bắt đầu search
- Bấm stop khi tour đã lưu thành công
- Ghi lại thời gian (giây)

### Option 2: Screen Recording (OBS)
1. Record màn hình từ đầu đến cuối
2. Sau đó xem video và note timestamp:
   - Start: Khi user bắt đầu type query
   - End: Khi thông báo "Saved successfully" hiển thị
3. Tính duration = End - Start

---

## Ghi Chép Kết Quả

### Template

```
Participant ID: P001
Date: 2025-12-16
Browser: Chrome/Edge/Firefox

Task Completion Time: _____ seconds

Notes:
- Có vấn đề gì không?
- Có bước nào khó hiểu không?
- User feedback?
```

### Lưu kết quả

Lưu vào: `usability/results/task_completion_times.txt`

Format:
```
P001, 45s, No issues
P002, 52s, Confused about drag-drop
P003, 38s, Very smooth
...
```

---

## Metrics Cần Thu Thập

1. **Task Completion Time (TCT)**
   - Trung bình
   - Min/Max
   - Standard deviation (nếu có nhiều participants)

2. **Success Rate**
   - % users hoàn thành task thành công
   - % users bỏ cuộc hoặc cần help

3. **Usability Issues**
   - Danh sách các vấn đề gặp phải
   - Frequency của mỗi issue

---

## Target Metrics

- **Avg TCT:** < 60s (1 phút)
- **Success Rate:** > 90%
- **Critical Issues:** 0

---

## Follow-up Survey

Sau khi hoàn thành task, yêu cầu user điền survey:
- See: `survey_form_template.md`
