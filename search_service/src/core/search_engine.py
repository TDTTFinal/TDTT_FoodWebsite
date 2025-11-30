# search_engine.py
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from geopy.distance import geodesic

from src.database import get_collection
from src.config import settings
from src.core.embedder import RestaurantEmbedder


class HybridFoodFinder:
    """
    Search engine kết hợp:
    - Dense semantic (BGE-m3)
    - TF-IDF keyword
    - Lọc theo bán kính
    """

    def __init__(self):

        # 1. Load & chuẩn hoá dữ liệu
        self.df = self._load_data_from_mongo()

        if self.df.empty:
            print("⚠️ Warning: Database is empty!")
            return
        # 2. Khởi tạo embedder (BGE-m3)
        self.embedder = RestaurantEmbedder()

        # 3. Tạo semantic embeddings (dense)
        self.semantic_matrix = self.embedder.embeddings(self.df)

        # 4. Tạo TF-IDF model (sparse)
        self.vectorizer, self.tfidf_matrix = self._create_tfidf_model()

    def _load_data_from_mongo(self) -> pd.DataFrame:
        """Lấy dữ liệu từ Mongo và chuyển thành DataFrame"""
        col = get_collection(settings.COLLECTION_NAME)
        # Lấy tất cả, giữ _id để làm khớp cache
        cursor = col.find({})
        data_list = list(cursor)
        if not data_list:
            return pd.DataFrame()
        
        '''
        Flatten DATA
        '''
        flattened_data = []
        for item in data_list:
            # 1. Cơ bản
            row = {
                '_id': str(item.get('_id')),
                'name': item.get('name', ''),
                'address': item.get('address', ''),
                'source_url': item.get('source_url', ''),
                'avg_rating': item.get('avg_rating', 0.0),
            }

            # 2. Xử lý MENU (List -> String)
            # Biến ["Món A", "Món B"] thành "Món A, Món B"
            menu_items = item.get('menu', [])
            if isinstance(menu_items, list):
                row['menu_flat'] = ", ".join(menu_items) 
            else:
                row['menu_flat'] = ""

            # 3. Xử lý REVIEWS (List of Dicts -> String)
            # Gom tất cả nội dung comment lại thành 1 đoạn văn dài
            reviews = item.get('reviews', [])
            if isinstance(reviews, list):
                # Chỉ lấy phần content, bỏ qua user_name hay rating
                comments = [r.get('content', '') for r in reviews if isinstance(r, dict)]
                row['reviews_flat'] = " ".join(comments)
            else:
                row['reviews_flat'] = ""

            # 4. Xử lý SCORES (Dict -> Columns)
            # Tách scores.space thành cột scores_space
            scores = item.get('scores', {})
            if isinstance(scores, dict):
                row['score_space'] = scores.get('space', 0.0)
                row['score_service'] = scores.get('service', 0.0)
                row['score_price'] = scores.get('price', 0.0)
                row['score_position'] = scores.get('position', 0.0)
                row['score_quality'] = scores.get('quality', 0.0)
                
            
            # 5. Xử lý LOCATION (GeoJSON -> Lat/Lon riêng biệt)
            # Mongo lưu: [Lon, Lat] -> Ta tách ra thành 2 cột
            loc = item.get('location', {})
            if isinstance(loc, dict) and 'coordinates' in loc:
                coords = loc['coordinates']
                if isinstance(coords, list) and len(coords) == 2:
                    row['lon'] = coords[0]
                    row['lat'] = coords[1]
                else:
                    row['lon'], row['lat'] = 0.0, 0.0
            else:
                row['lon'], row['lat'] = 0.0, 0.0

            flattened_data.append(row)

        # --- BƯỚC 2: TẠO DATAFRAME ---
        df = pd.DataFrame(flattened_data)
        
        # --- BƯỚC 3: TẠO CỘT SEARCH TEXT (Quan trọng cho AI) ---
        # Bây giờ các cột đã phẳng, ta cộng chuỗi rất dễ dàng
        df['search_text'] = (
            df['name'] + ". " + 
            df['menu_flat'] + ". " + 
            df['reviews_flat'] + ". " +
            df['address']
        ).str.lower() # Chuyển thành chữ thường luôn

        # Xóa các dòng rác (nếu không có tên hoặc lat/lon lỗi)
        df = df.dropna(subset=['lat', 'lon'])
        
        print(f"✅ Loaded & Flattened {len(df)} restaurants.")
        return df

    def _create_tfidf_model(self):
        """
        Chuẩn bị dữ liệu text cho TF-IDF.
        Phải xử lý các trường List/Object thành chuỗi đơn giản.
        """
        search_corpus = self.df['search_text'].fillna("").tolist()

        # Cấu hình TF-IDF (Bắt từ đơn và từ ghép 2 chữ)
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        matrix = vectorizer.fit_transform(search_corpus)
        
        return vectorizer, matrix

    def search(
        self,
        query: str,
        top_k: int = 15,
        alpha: float = 0.6, # Trọng số: 0.6 cho Semantic (AI), 0.4 cho TF-IDF (Từ khóa)
        center: tuple = None, # (lat, lon)
        radius_km: float = 5.0
    ):
        if self.df.empty: return []
        if not query.strip(): return self.df.head(top_k).to_dict('records')

        # ---------------------------------------------------------
        # BƯỚC 1: TÍNH ĐIỂM CHO TOÀN BỘ DATA (Full Matrix)
        # ---------------------------------------------------------
        
        # Tính Semantic Score
        query_emb = self.embedder.embed_query(query)
        sem_scores = np.dot(self.semantic_matrix, query_emb)

        # Tính TF-IDF Score
        query_tfidf = self.vectorizer.transform([query.lower()])
        tfidf_scores = cosine_similarity(query_tfidf, self.tfidf_matrix).flatten()

        # Tính điểm tổng hợp
        final_scores = (alpha * sem_scores) + ((1 - alpha) * tfidf_scores)

        # ---------------------------------------------------------
        # BƯỚC 2: GÁN ĐIỂM VÀO DATAFRAME BẢN SAO
        # ---------------------------------------------------------
        # Tạo bản sao để không ảnh hưởng data gốc
        results = self.df.copy()
        
        # Gán điểm vào (Lúc này độ dài khớp 100% nên không lỗi)
        results['score'] = final_scores
        results['semantic_score'] = sem_scores
        results['tfidf_score'] = tfidf_scores

        # ---------------------------------------------------------
        # BƯỚC 3: LỌC THEO BÁN KÍNH (NẾU CÓ)
        # ---------------------------------------------------------
        if center:
            def fast_distance(row):
                # Vì data đã clean ở bước load, lat/lon đảm bảo là số
                return geodesic(center, (row['lat'], row['lon'])).km <= radius_km

            # Lọc bớt những quán ở xa
            mask = results.apply(fast_distance, axis=1)
            results = results[mask]
            
            if results.empty: return []

        # ---------------------------------------------------------
        # BƯỚC 4: SẮP XẾP & LẤY TOP K
        # ---------------------------------------------------------
        results = results.sort_values('score', ascending=False).head(top_k)
        
        # Chuyển ObjectId sang string để trả về JSON không lỗi
        results['_id'] = results['_id'].astype(str)
        
        return results.to_dict('records')