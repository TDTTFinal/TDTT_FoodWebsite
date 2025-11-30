from fastapi import APIRouter, Query
from typing import Optional, List

# Import bộ não xử lý
from src.core.search_engine import HybridFoodFinder
from src.schemas import RestaurantResult

# Tạo Router
router = APIRouter(prefix="/api/v1/search", tags=["Search"])

# --- KHỞI TẠO ENGINE (SINGLETON) ---
# Load 1 lần duy nhất khi server chạy
print("⏳ Đang khởi động Search Engine...")
try:
    engine = HybridFoodFinder() # Tự động load từ MongoDB
    # planner = RoutePlanner(engine)
except Exception as e:
    print(f"❌ Lỗi khởi tạo Search Engine: {e}")
    engine = None
    planner = None

# ==========================================
# API 1: TÌM KIẾM THƯỜNG (Hybrid Search)
# ==========================================
@router.get("/", response_model=List[RestaurantResult])
def search_restaurants(
    q: str = Query(..., description="Từ khóa tìm kiếm (VD: Cơm tấm)"),
    lat: Optional[float] = Query(10.7769, description="Vĩ độ hiện tại của User"),
    lon: Optional[float] = Query(106.7009, description="Kinh độ hiện tại của User"),
    radius: float = Query(5.0, description="Bán kính tìm kiếm (km)"),
    alpha: float = Query(0.6, description="Trọng số AI (0.0 -> 1.0)"),
    top_k: int = 20
):
    """
    Tìm kiếm quán ăn kết hợp ngữ nghĩa (AI) và từ khóa (TF-IDF).
    Có lọc theo bán kính nếu truyền lat/lon.
    """
    if not engine:
        return []

    # Xử lý tọa độ center
    center = (lat, lon)

    # Gọi engine xử lý (Hàm search trong core/search_engine.py)
    results = engine.search(
        query=q,
        alpha=alpha,
        top_k=top_k,
        center=center,
        radius_km=radius
    )
    
    return results
