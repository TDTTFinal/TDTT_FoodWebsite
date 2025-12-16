from fastapi import APIRouter, Query
from typing import Optional, List
import traceback    

# Import bộ não xử lý
from src.core.search_engine import HybridFoodFinder
from src.core.nlp_parser import IntentParser
from src.core.route_optimizer import RouteOptimizer
from src.core.location_resolver import LocationResolver
from src.schemas import RestaurantResult, RouteStep, MultiStepSearchResponse

# Tạo Router
router_v1 = APIRouter(prefix="/api/v1/search", tags=["Search"])
router_v2 = APIRouter(prefix="/api/v2/search", tags=["Search V2"])


# --- KHỞI TẠO ENGINE (SINGLETON) ---
# Load 1 lần duy nhất khi server chạy
print("⏳ Đang khởi động Search Engine...")
try:
    engine = HybridFoodFinder() # Tự động load từ MongoDB
    nlp = IntentParser()
    optimizer = RouteOptimizer()
    resolver = LocationResolver()  # Geocoding cho location_query
except Exception as e:
    print(f"❌ Lỗi khởi tạo Search Engine: {e}")
    traceback.print_exc()
    engine = None
    nlp = None
    planner = None

# ==========================================
# API 1: TÌM KIẾM THƯỜNG (Hybrid Search)
# ==========================================
@router_v1.get("/", response_model=List[RestaurantResult])
def search_restaurants(
    q: str = Query(..., description="Từ khóa tìm kiếm (VD: Cơm tấm)"),
    district: Optional[str] = Query(None, description="Lọc theo quận"),
    lat: Optional[float] = Query(10.7769, description="Vĩ độ hiện tại của User"),
    lon: Optional[float] = Query(106.7009, description="Kinh độ hiện tại của User"),
    radius: float = Query(0, description="Bán kính tìm kiếm (km)"),
    # alpha: float = Query(0.6, description="Trọng số AI (0.0 -> 1.0)"),
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
        district=district,
        # alpha=alpha,
        top_k=top_k,
        center=center,
        radius_km=radius
    )
    
    return results

# ==========================================
# API 2: TEST PARSER + TÌM KIẾM
# ==========================================
@router_v2.get("/", response_model=MultiStepSearchResponse)
def search_restaurants_v2(
    q: str = Query(..., description="Từ khóa tìm kiếm (VD: Cơm tấm rồi cafe)"),
    lat: float = 10.7769, # Bỏ Optional, để mặc định HCM
    lon: float = 106.7009,
    radius: float = 5.0,
    alpha: float = 0.6,
    top_k: int = 5 
):
    # 1. Kiểm tra Engine
    if not engine or not nlp:
        return {"original_query": q, "steps": [], "suggested_routes": []}
    
    # 2. NLP Parse
    intents = nlp.parse(q)
    
    steps_result = []

    # 3. Tìm Candidates cho từng bước
    for idx, intent in enumerate(intents):
        keyword = intent.get("keyword", "")
        district = intent.get("district")
        
        # --- XỬ LÝ ĐỊA ĐIỂM ĐỘNG (DYNAMIC GEOCODING) ---
        step_center = (lat, lon)  # Mặc định là vị trí user
        step_radius = radius

        location_query = intent.get("location_query")
        if location_query:
            print(f"📍 Đang tìm tọa độ cho: {location_query}...")
            resolved_loc = resolver.resolve(location_query)
            if resolved_loc:
                step_center = resolved_loc
                step_radius = 2.0  # Tìm trong 2km quanh landmark
                print(f"   -> Tìm thấy: {step_center}")
            else:
                print(f"   -> Không tìm thấy '{location_query}', dùng vị trí user.")

        candidates = engine.search(
            query=keyword,
            district=district,
            top_k=top_k, 
            center=step_center,
            radius_km=step_radius,
            alpha=alpha
        )

        step_data = RouteStep(
            step_index=idx + 1,
            intent=intent,
            candidates=candidates
        )
        steps_result.append(step_data)
    
    # 4. TỐI ƯU LỘ TRÌNH (Ghép các candidates lại)
    suggested_routes = optimizer.optimize(
        steps_data=steps_result, 
        user_location=(lat, lon) # Truyền vị trí user để tính đường đi từ điểm xuất phát
    )

    # 5. Trả về kết quả
    return {
        "original_query": q,
        "steps": steps_result,          # Danh sách ứng viên (để hiện từng tab)
        "suggested_routes": suggested_routes # Lộ trình tối ưu (để hiện map)
    }