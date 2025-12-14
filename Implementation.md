# Kế hoạch Triển khai Homepage (Fullstack Revamp) - Updated

## Mục Tiêu
Xây dựng Homepage chuyên nghiệp, tối ưu UX, hỗ trợ Geo-location và Context-aware content, tận dụng API Hugging Face có sẵn.

## User Review Required
> [!NOTE]
> Tôi đã cập nhật plan dựa trên JSON bạn cung cấp.
> - **Field Mapping**: Dùng `avatar_url` thay vì `image_url`. Dùng `opening_hours` dạng string và parse thủ công để filter giờ mở cửa.
> - **Strategy**:
>    - **Nearby**: Dùng trực tiếp MongoDB `$near` vì data đã chuẩn GeoJSON (nhanh hơn gọi HF).
>    - **Search**: Dùng Hugging Face API như code mẫu bạn có.
>    - **Context Data**: Dùng tag/keyword mapping với danh mục có sẵn trong DB (vì HF API tập trung vào search text).

## 1. Database & Helper (MongoDB)
### [MODIFY] [Restaurant.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/backend/models/Restaurant.js)
-   **Geo-location**: Field `location` (`2dsphere`) đã có sẵn -> **Giữ nguyên**.
-   **Time Attributes**: Field `opening_hours` ("08:30 - 17:00") -> **Viết helper function** để parse giờ và so sánh với `Date.now()`.
-   **Metadata**: Thêm `tags` (Array String) nếu cần map context "Sáng/Trưa/Tối" chi tiết hơn (hoặc dùng tạm `category`).

## 2. Backend (Node.js/Express)
### [MODIFY] [restaurantController.js](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/backend/controllers/restaurantController.js)
-   `getNearbyRestaurants`: Query trực tiếp MongoDB:
    ```javascript
    Restaurant.find({
      location: {
        $near: { $geometry: { type: "Point", coordinates: [lon, lat] }, $maxDistance: 3000 }
      }
    })
    ```
-   `getContextualRestaurants`:
    -   Lấy giờ hiện tại (Server time).
    -   Map giờ -> Category/Keyword (Sáng: "Phở", "Bún", "Cafe"; Trưa: "Cơm", "Bento"; Tối: "Lẩu", "BBQ").
    -   Query MongoDB theo `category` hoặc `name` ($regex).
-   `getCollections`: Hardcode một vài list chủ đề (Trending, Giảm giá) hoặc query theo `avg_rating` > 4.5.

## 3. Frontend (React + Tailwind)
> Standardize data field: `img` (UI) = `avatar_url` (API).

### [NEW] Components
-   `src/components/home/QuickActions.jsx`: Menu icon tròn (dùng Lucide React).
-   `src/components/home/NearMeSection.jsx`: Horizontal Scroll List. Gọi API `/api/restaurants/nearby` với `navigator.geolocation`.
-   `src/components/home/ContextAwareSection.jsx`: Section "Sáng/Trưa/Tối nay ăn gì?".
-   `src/components/home/CollectionBanner.jsx`.
-   `src/components/RestaurantCard.jsx`: Hiển thị `avatar_url`, badge `avg_rating`.
-   `src/components/home/CommunityReviews.jsx`: Hiển thị review ngang (Social Proof).
-   `src/components/home/FeatureRankSection.jsx`: Hiển thị Top Space hoặc Budget.

### [MODIFY] [HomePage.jsx](file:///e:/hcmus/tdtt/TDTT_FoodWebsite/frontend/src/pages/HomePage.jsx)
-   Compose các section.
-   State Management: Fetch dữ liệu song song để tối ưu TTV (Time to View).
-   **Search Integration**: Form submit -> redirect to `/search-advanced?q=...`.

## Phase 2: Homepage Enhancements (Make it Richer)

### Implemented Logic & Criteria (Chi tiết thuật toán)

#### 1. Khu vực "Gần bạn nhất" (Near Me)
*   **Công nghệ**: MongoDB GeoJSON `$near`.
*   **Tiêu chí**:
    *   Khoảng cách: Tìm kiếm trong bán kính **3,000m (3km)** tính từ tọa độ người dùng.
    *   Sắp xếp: Gần nhất xếp trước.

#### 2. Khu vực "Gợi ý theo ngữ cảnh" (Context Aware)
*   **Logic**: Dựa trên giờ hiện tại của Server (Vietnam Time UTC+7).
*   **Khung giờ**:
    *   **05:00 - 10:00 (Sáng)**: Ưu tiên Category "Phở", "Bún", "Bánh mì", "Cafe".
    *   **10:00 - 14:00 (Trưa)**: Ưu tiên Category "Cơm", "Bento", "Sushi", "Healthy".
    *   **14:00 - 17:00 (Chiều)**: Ưu tiên "Trà sữa", "Bánh ngọt", "Ăn vặt".
    *   **17:00 trở đi (Tối)**: Ưu tiên "Lẩu", "BBQ", "Hải sản", "Buffet".

#### 3. Bộ Sưu Tập (Collections)
*   **🔥 Nổi bật (Trending)**:
    *   Tiêu chí: `avg_rating` >= **8.5**.
*   **📸 Top Không gian (Best Space)**:
    *   Tiêu chí: `scores.space` >= **8.0** (Điểm không gian).
*   **💸 Hôm nay ăn rẻ (Budget Friendly)**:
    *   Tiêu chí: `scores.price` >= **8.0** (Điểm đánh giá về giá cả/chất lượng).
    *   *Lưu ý*: Điểm này phản ánh "Đáng tiền" (Value for money) theo đánh giá của người dùng.

#### 4. Cộng đồng bàn tán (Community Reviews)
*   **Logic**: Lấy 10 review mới nhất từ toàn bộ hệ thống.
*   **Sắp xếp**: Thời gian (`date`) giảm dần.

#### 5. Tích hợp Tìm kiếm (Search Integration)
*   **Chiến lược**: Tận dụng trang "Tìm kiếm nâng cao" (Advanced Search) đã có.
*   **Luồng xử lý (Flow)**:
    1.  Người dùng nhập từ khóa tại **Homepage**.
    2.  Hệ thống chuyển hướng (`navigate`) đến `/search-advanced?q={keyword}`.
    3.  Trang Advanced Search tự động gọi API AI (Hugging Face / Hybrid Search) để hiển thị kết quả.
