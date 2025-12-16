import itertools
from geopy.distance import geodesic
from src.schemas import RouteStep, RoutePlan, RestaurantResult

class RouteOptimizer:
    def __init__(self):
        pass

    def optimize(self, steps_data: list[RouteStep], user_location: tuple = None) -> list[RoutePlan]:
        """
        Input: Danh sách các bước, mỗi bước có top 5-10 quán ứng viên.
        Output: Top 3 lộ trình (kết hợp) tốt nhất.
        """
        if not steps_data:
            return []

        # Nếu chỉ có 1 bước (Ăn phở), không cần tính đường đi, trả về top quán theo điểm cao nhất
        if len(steps_data) == 1:
            top_candidates = sorted(steps_data[0].candidates, key=lambda x: x.final_score, reverse=True)[:3]
            return [
                RoutePlan(
                    route_id=f"opt_{i}",
                    total_score=c.final_score,
                    total_distance=0.0,
                    stops=[c]
                ) for i, c in enumerate(top_candidates)
            ]

        # --- THUẬT TOÁN VÉT CẠN (BRUTE FORCE) ---
        # 1. Tạo tất cả các tổ hợp có thể (Cartesian Product)
        # VD: Step1 có [A, B], Step2 có [C, D] -> [A,C], [A,D], [B,C], [B,D]
        
        # Trích xuất list quán của mỗi bước
        candidate_lists = [step.candidates for step in steps_data]
        
        # itertools.product tạo ra mọi tổ hợp
        all_combinations = list(itertools.product(*candidate_lists))
        
        valid_routes = []

        for combo in all_combinations:
            # combo là 1 tuple gồm (Quán_Step1, Quán_Step2, ...)
            
            # 1. Kiểm tra trùng lặp (Không được ăn 2 lần cùng 1 quán)
            ids = [p.id for p in combo]
            if len(set(ids)) != len(ids):
                continue

            total_dist = 0.0
            total_score = 0.0
            
            # 2. Tính tổng điểm và khoảng cách
            # Điểm cơ bản = Trung bình cộng điểm AI của các quán
            avg_rating_score = sum([p.final_score for p in combo]) / len(combo)

            # Tính khoảng cách tuần tự: User -> Quán 1 -> Quán 2 ...
            current_loc = user_location
            
            for i, place in enumerate(combo):
                # Lấy tọa độ quán hiện tại
                place_loc = (place.lat, place.lon)
                
                if current_loc:
                    dist = geodesic(current_loc, place_loc).km
                    total_dist += dist
                
                # Cập nhật vị trí hiện tại để tính cho bước sau
                current_loc = place_loc

            # 3. Hàm mục tiêu (Scoring Function)
            # Score = Chất lượng - (Phạt khoảng cách)
            # Cứ mỗi 1km di chuyển sẽ bị trừ 0.1 điểm (Ví dụ)
            final_score = avg_rating_score - (total_dist * 0.1)

            # Lọc cứng: Nếu tổng đường đi quá xa (> 15km) thì bỏ
            if total_dist > 15.0: continue

            valid_routes.append(
                RoutePlan(
                    route_id="temp", # Sẽ gán lại sau khi sort
                    total_score=round(final_score, 4),
                    total_distance=round(total_dist, 2),
                    stops=list(combo)
                )
            )

        # 4. Sắp xếp và lấy Top 3
        valid_routes.sort(key=lambda x: x.total_score, reverse=True)
        top_routes = valid_routes[:3]
        
        # Gán lại ID cho đẹp
        for i, r in enumerate(top_routes):
            r.route_id = f"route_{i+1}"

        return top_routes