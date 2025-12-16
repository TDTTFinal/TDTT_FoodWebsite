# 1. Chọn môi trường Python (3.10 là bản ổn định)
FROM python:3.10-slim

# 2. Thiết lập thư mục làm việc bên trong Container
WORKDIR /app

# 3. Copy file thư viện vào trước (để Docker cache lại, build cho nhanh)
COPY requirements.txt .

# 4. Cài đặt thư viện
# Mẹo: Cài PyTorch bản CPU để giảm dung lượng (Server Free không có GPU)
# Cài bản torch cpu mới nhất (>= 2.6.0)
RUN pip install --no-cache-dir "torch>=2.6.0" torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy toàn bộ Code dự án vào
COPY . .

# 6. Tạo thư mục models và cấp quyền ghi
# (Hugging Face bắt buộc bước này để code có thể tạo file .pkl)
RUN mkdir -p models && chmod 777 models

# 7. Mở cổng 7860 (Đây là cổng mặc định của Hugging Face Spaces)
EXPOSE 7860

# 8. Lệnh khởi động Server
# Host 0.0.0.0 nghĩa là chấp nhận mọi kết nối từ bên ngoài
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]