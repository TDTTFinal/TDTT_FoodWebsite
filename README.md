# 🍜 **FOOD RECOMMENDATION WEB**

> 🌐 Hệ thống gợi ý món ăn thông minh ứng dụng **Tư Duy Tính Toán (Computational Thinking)** và **AI/ML**

![AI System](https://img.shields.io/badge/AI%2FML-Model-green?style=for-the-badge)
![Web Project](https://img.shields.io/badge/Web%20App-React%20%2B%20Python-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Tr%E1%BA%A1ng%20th%C3%A1i-%C4%90ang%20ph%C3%A1t%20tri%E1%BB%83n-orange?style=for-the-badge)
![License](https://img.shields.io/badge/Gi%E1%BA%A5y%20ph%C3%A9p-MIT-purple?style=for-the-badge)

---

## 🧠 **Mô tả dự án**
**Food Recommendation Web** là một hệ thống web gợi ý nhà hàng/món ăn thông minh,  
dựa trên các đặc trưng như **loại ẩm thực**, **mức giá**, **vị trí**, và **sở thích của người dùng**.

Hệ thống áp dụng **Tư duy Tính Toán (Computational Thinking)** để biểu diễn dữ liệu bằng vector,  
sử dụng **TF-IDF** và **Cosine Similarity** để đo độ tương đồng giữa người dùng và nhà hàng,  
từ đó gợi ý những lựa chọn **phù hợp – nhanh chóng – khách quan**.

---

## 🚀 **Hướng phát triển dự án**

### 🔹 **Hướng 1 – Hệ thống Gợi ý Cơ bản (BASIC)**
- ✅ Biểu diễn dữ liệu bằng TF-IDF / CountVectorizer  
- ✅ Tính toán độ tương đồng bằng Cosine Similarity  
- ✅ Giao diện web đơn giản: lọc theo tag, giá, loại món, vị trí  
- ✅ Chức năng **Admin CRUD**: Quản lý nhà hàng và đặc trưng (tags)  

### 🔸 **Hướng 2 – Hệ thống Gợi ý Tăng cường bằng Phân tích Cảm xúc (ADVANCED)**
- 💬 Phân tích cảm xúc từ đánh giá người dùng bằng **TextBlob** hoặc **VADER**  
- ⚖️ Xếp hạng lai (Hybrid Ranking):  
  `Điểm tổng = α * Độ tương đồng nội dung + (1-α) * Điểm cảm xúc`  
- 🧩 Người dùng có thể điều chỉnh trọng số theo sở thích  
- 🎯 Tăng độ chính xác và tính thực tế khi xếp hạng quán ăn  

---

## 💡 **Lý do chọn đề tài**
- 🔍 Ứng dụng gợi ý món ăn thông minh hiện nay còn ít, trong khi nhu cầu cao  
- 💬 Hầu hết người dùng phải xem review TikTok / Google Maps – thiếu tính khách quan  
- ⚙️ Hệ thống này giúp **lọc thông tin khách quan**, **gợi ý theo sở thích cá nhân**,  
  **thời gian thao tác ngắn** (chỉ 15–20s để có kết quả)  
- 📊 Dễ mở rộng thêm **AI/NLP**, tạo nền tảng cho các nghiên cứu nâng cao  

---

## 🛠️ **Công nghệ sử dụng**
- **Frontend:** React / TailwindCSS  
- **Backend:** Python (Flask / FastAPI)  
- **AI/ML:** Scikit-learn (TF-IDF, Cosine Similarity, NLP)  
- **Database:** SQLite / PostgreSQL  
- **Tools:** VSCode, Git, Kaggle Datasets  

---

## ✨ **Mục tiêu dự án**
> “Xây dựng một hệ thống gợi ý món ăn thông minh, dễ dùng, và khách quan –  
> kết hợp tư duy tính toán với trí tuệ nhân tạo để tối ưu trải nghiệm người dùng.”

---

### 📁 **Tên thư mục / Repository**
`Food_Recommendation_Web_CT`

---

Bạn có muốn mình **thêm phần hình minh họa mô tả sơ đồ logic (ví dụ: TF-IDF → Cosine → Rank)** để chèn vào README cho nổi bật hơn không?  
(Mình có thể giúp bạn vẽ sơ đồ đó bằng Markdown hoặc sơ đồ ảnh minh họa đẹp gọn.)
