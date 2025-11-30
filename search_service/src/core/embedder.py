"""
embedder.py - Clean version without query enhancement
"""

from sentence_transformers import SentenceTransformer
import numpy as np
import pickle
import os

class RestaurantEmbedder:
    def __init__(self, model_name='BAAI/bge-m3'):
        print(f"Loading embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name, trust_remote_code=True)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"✓ Model loaded! Embedding dimension: {self.embedding_dim}")
    
    def extract_cuisine(self, text_input):
        """
        Extract main cuisine from name
        Hàm này sẽ được sử dụng nếu thiếu cột thực đơn (và thiếu quá nhiều data)
        """
        if not text_input: return ""
        text_lower = str(text_input).lower()    

        keywords = {
            'phở': 'Vietnamese Pho Noodle',
            'bún': 'Vietnamese Vermicelli',
            'cơm': 'Vietnamese Rice',
            'bánh mì': 'Vietnamese Sandwich',
            'lẩu': 'Hotpot',
            'nướng': 'BBQ Grill',
            'hải sản': 'Seafood',
            'ốc': 'Snail Seafood',
            'trà sữa': 'Milk Tea',
            'cafe': 'Coffee',
            'cà phê': 'Coffee',
            'pizza': 'Pizza Italian',
            'sushi': 'Japanese Sushi'
        }
        
        for key, val in keywords.items():
            if key in text_lower:
                return val
        return "Vietnamese Food"
    
    def _prepare_text(self, row):
        parts = []
        
        # 1. Thông tin cơ bản (QUAN TRỌNG NHẤT -> ĐỂ ĐẦU TIÊN)
        name = row.get('name', '')
        # Nhấn mạnh tên quán bằng cách lặp lại
        parts.append(f"Restaurant Name: {name}. {name}") 
        
        # 2. Xử lý Menu (TĂNG TRỌNG SỐ Ở ĐÂY)
        menu = row.get('menu_flat', '')
        parts.append(f"Main Menu: {menu}")
        parts.append(f"Signature Dishes: {menu}") 

        # 3. Địa chỉ (Ít quan trọng hơn -> Để sau)
        address = row.get('address', '')
        parts.append(f"Address: {address}")
        
        # 4. Cuisine
        category_guess = self.extract_cuisine(name)
        parts.append(f"Category: {category_guess}")

        # 5. Reviews (Quan trọng nhưng dài, để cuối để không làm loãng Menu)
        review = row.get('reviews_flat', '')
        parts.append(f"Reviews: {review[:2000]}")

        # 6. Xử lý Scores (Tín hiệu chất lượng)
        scores = row.get('scores', {})
        parts.append(f"Address: {address}")
            
        if scores.get('score_service', 0) >= 8.0:
            parts.append("Excellent service")
        if scores.get('score_space', 0) >= 8.0:
            parts.append("Beautiful space nice view")
        if scores.get('score_price', 0) >= 8.0:
            parts.append("Good price reasonable")

        # Nối tất cả lại thành 1 đoạn văn
        final_text = ". ".join(parts)
        return final_text
    
    def embeddings(self, df, cache_path='models/embeddings_cache.pkl'):
        """
        Hàm đồng bộ thông minh: Dùng _id của MongoDB làm khóa chính
        """
        # 1. Load Cache cũ
        cache_data = {}
        if os.path.exists(cache_path):
            with open(cache_path, 'rb') as f:
                cache_data = pickle.load(f)
            print(f"📂 Loaded {len(cache_data)} items from cache.")

        # Lấy danh sách ID hiện tại (Chuyển sang string để làm key)
        # Lưu ý: DataFrame phải có cột '_id'
        current_ids = set(df['_id'].astype(str))
        cached_ids = set(cache_data.keys())
        
        cache_changed = False 

        # --- BƯỚC 1: XÓA (CLEANUP) ---
        ids_to_remove = cached_ids - current_ids
        if ids_to_remove:
            print(f"🗑️ Removing {len(ids_to_remove)} deleted restaurants...")
            for uid in ids_to_remove:
                del cache_data[uid]
            cache_changed = True
        
        # --- BƯỚC 2: THÊM MỚI (ADD NEW) ---
        new_texts = []
        new_ids = []
        
        for _, row in df.iterrows():
            raw_id = row.get('_id')
            if raw_id is None: continue
            
            uid = str(raw_id) # Key phải là string
            
            # Nếu quán này chưa có trong cache -> Thêm vào danh sách cần tính
            if uid not in cache_data:
                new_ids.append(uid)
                new_texts.append(self._prepare_text(row))
        
        if new_texts:
            print(f"🆕 Embedding {len(new_texts)} new restaurants...")
            new_embeddings = self.model.encode(
                new_texts, 
                batch_size=32, 
                show_progress_bar=True, 
                normalize_embeddings=True
            )
            
            for uid, vector in zip(new_ids, new_embeddings):
                cache_data[uid] = vector
            cache_changed = True

        # --- BƯỚC 3: LƯU CACHE ---
        if cache_changed:
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            with open(cache_path, 'wb') as f:
                pickle.dump(cache_data, f)
            print("💾 Cache updated successfully!")
        else:
            print("✨ Cache is already up-to-date.")

        # --- BƯỚC 4: TRẢ VỀ KẾT QUẢ ĐÚNG THỨ TỰ (Sửa đoạn này) ---
        ordered_embeddings = []
        for _, row in df.iterrows():
            raw_id = row.get('_id')
            
            # Chuyển id sang string để tìm trong cache
            uid = str(raw_id) if raw_id is not None else ""
            
            if uid in cache_data:
                ordered_embeddings.append(cache_data[uid])
            else:
                # Fallback (hiếm khi xảy ra)
                ordered_embeddings.append(np.zeros(self.embedding_dim))
                
        return np.array(ordered_embeddings)
    
    def embed_query(self, query: str) -> np.ndarray:
        """
        Tạo embedding cho câu truy vấn (query) của người dùng.
        - Dùng cùng model BGE-M3
        - Normalize để phù hợp với cosine similarity
        """
        if not query or not isinstance(query, str):
            return np.zeros(self.embedding_dim, dtype=np.float32)

        # OPTIONAL: Bạn có thể cải thiện query tại đây (nếu muốn)
        # ví dụ thêm keyword "best restaurant", "good food", ...
        cleaned_query = query.strip()

        # Encode (giống cấu hình bạn dùng cho restaurant embeddings)
        query_emb = self.model.encode(
            cleaned_query,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )

        return query_emb.astype(np.float32)