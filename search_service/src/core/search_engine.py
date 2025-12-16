from geopy.distance import geodesic
from src.database import get_collection
from src.config import settings
from src.core.embedder import RestaurantEmbedder

class HybridFoodFinder:
    def __init__(self):
        print("🚀 Initializing Hybrid Search (BM25 + Vector)...")
        self.embedder = RestaurantEmbedder()
        print("✅ Ready!")

    def _normalize_scores(self, docs, score_field='score'):
        """Chuẩn hóa điểm số về thang 0-1 (Max Scaling)"""
        if not docs:
            return docs
        
        scores = [doc.get(score_field, 0) for doc in docs]
        max_score = max(scores) if scores else 1.0
        
        # Tránh chia cho 0
        if max_score == 0:
            max_score = 1.0

        for doc in docs:
            original = doc.get(score_field, 0)
            # Max scaling: Giữ nguyên tỷ lệ, không ép min về 0
            doc[f'{score_field}_normalized'] = original / max_score
        
        return docs

    def _merge_by_scores(self, vector_results, keyword_results, alpha=0.7):
        """
        Trộn kết quả dựa trên điểm số thực (không dùng RRF)
        alpha: trọng số cho semantic (0-1), keyword sẽ là (1-alpha)
        """
        # Chuẩn hóa điểm số về cùng thang 0-1
        vector_results = self._normalize_scores(vector_results, 'score')
        keyword_results = self._normalize_scores(keyword_results, 'score')
        
        # Ghép kết quả
        merged = {}
        
        # Thêm kết quả vector
        for doc in vector_results:
            doc_id = str(doc['_id'])
            merged[doc_id] = doc.copy()
            merged[doc_id]['semantic_score'] = doc.get('score_normalized', 0)
            merged[doc_id]['keyword_score'] = 0.0
        
        # Thêm/cập nhật kết quả keyword
        for doc in keyword_results:
            doc_id = str(doc['_id'])
            if doc_id in merged:
                merged[doc_id]['keyword_score'] = doc.get('score_normalized', 0)
            else:
                merged[doc_id] = doc.copy()
                merged[doc_id]['semantic_score'] = 0.0
                merged[doc_id]['keyword_score'] = doc.get('score_normalized', 0)
        
        # Tính điểm tổng hợp
        results = []
        for doc in merged.values():
            # Điểm hybrid = alpha * semantic + (1-alpha) * keyword
            doc['hybrid_score'] = (
                alpha * doc['semantic_score'] + 
                (1 - alpha) * doc['keyword_score']
            )
            results.append(doc)
        
        # Sắp xếp theo điểm hybrid
        results.sort(key=lambda x: x['hybrid_score'], reverse=True)
        return results

    def search(
        self,
        query: str,
        district: str = None,
        top_k: int = 15,
        center: tuple = None,
        radius_km: float = 5.0,
        alpha: float = 0.7,  # Trọng số semantic (0.7 = 70% semantic, 30% keyword)
        weight_dist_pref: float = 0.2,  # Trọng số khoảng cách
        max_price_filter: float = None
    ):
        col = get_collection(settings.COLLECTION_NAME)
        if not query.strip(): 
            return []

        # --- LUỒNG 1: VECTOR SEARCH (Semantic) ---
        query_vector = self.embedder.embed_query(query).tolist()
        vector_pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": top_k * 5,
                    "limit": top_k * 3
                }
            },
            {
                "$addFields": {
                    "score": {"$meta": "vectorSearchScore"}
                }
            },
            {"$project": {"embedding": 0}}
        ]
        
        # --- LUỒNG 2: KEYWORD SEARCH (Đã sửa - Bỏ minimumShouldMatch) ---
        keyword_pipeline = [
            {
                "$search": {
                    "index": "default",
                    "compound": {
                        "should": [
                            # 1. Match chính xác trong name và menu
                            {
                                "text": {
                                    "query": query,
                                    "path": ["name", "menu.name"],
                                    "score": {"boost": {"value": 3}}
                                }
                            },
                            # 2. Match với fuzzy (chấp nhận lỗi chính tả)
                            {
                                "text": {
                                    "query": query,
                                    "path": ["name", "menu.name", "address"],
                                    "fuzzy": {
                                        "maxEdits": 2,
                                        "prefixLength": 0
                                    },
                                    "score": {"boost": {"value": 1.5}}
                                }
                            }
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "score": {"$meta": "searchScore"}
                }
            },
            {"$limit": top_k * 3},
            {"$project": {"embedding": 0}}
        ]

        # --- THỰC THI TÌM KIẾM ---
        try:
            vector_results = list(col.aggregate(vector_pipeline))
            keyword_results = list(col.aggregate(keyword_pipeline))
            
            print(f"📊 Vector: {len(vector_results)} | Keyword: {len(keyword_results)}")
            
        except Exception as e:
            print(f"❌ Search Error: {e}")
            return []

        # --- TRỘN KẾT QUẢ THEO ĐIỂM SỐ ---
        merged_results = self._merge_by_scores(vector_results, keyword_results, alpha)

        # --- POST-PROCESSING: Lọc và tính điểm cuối cùng ---
        final_results = []
        
        for doc in merged_results:
            # 1. Lọc Quận
            if district:
                if district.lower() not in str(doc.get('address', '')).lower():
                    continue

            # 2. Lọc Giá
            if max_price_filter:
                if doc.get('menu_min_price', 0) > max_price_filter:
                    continue

            # 3. Tính Khoảng cách
            dist_km = 0.0
            dist_score = 0.0
            
            if center:
                loc = doc.get('location')
                if loc and 'coordinates' in loc:
                    coord = (loc['coordinates'][1], loc['coordinates'][0])
                    dist_km = geodesic(center, coord).km
                    doc['lat'] = loc['coordinates'][1]
                    doc['lon'] = loc['coordinates'][0]
                
                # Lọc bán kính
                if radius_km > 0 and dist_km > radius_km:
                    continue

                # Tính điểm khoảng cách (gần hơn = điểm cao hơn)
                if radius_km > 0:
                    dist_score = max(0, 1 - (dist_km / radius_km))

            # 4. Tính điểm cuối cùng
            # Công thức: Final = Hybrid_Score + (Distance_Weight * Distance_Score)
            final_score = doc['hybrid_score'] + (weight_dist_pref * dist_score)
            
            # Chuẩn bị output
            doc['final_score'] = round(final_score, 4)
            doc['distance_km'] = round(dist_km, 2)
            doc['distance_score'] = round(dist_score, 4)
            doc['semantic_score'] = round(doc['semantic_score'], 4)
            doc['keyword_score'] = round(doc['keyword_score'], 4)
            doc['hybird_score'] = round(doc['hybrid_score'], 4)
            doc['_id'] = str(doc['_id'])
            
            # Xóa các field tạm
            doc.pop('score_normalized', None)
            
            final_results.append(doc)

        # Sort theo điểm cuối cùng
        final_results.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Thêm thông tin debug
        for i, doc in enumerate(final_results[:top_k], 1):
            doc['rank'] = i
            print(f"#{i} {doc.get('name', 'N/A')[:40]:<40} | "
                  f"Final: {doc['final_score']:.3f} | "
                  f"Sem: {doc['semantic_score']:.3f} | "
                  f"Key: {doc['keyword_score']:.3f} | "
                  f"Dist: {doc['distance_km']:.1f}km")
        
        return final_results[:top_k]