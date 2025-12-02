# search_engine.py
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from geopy.distance import geodesic

from embedder import RestaurantEmbedder


class HybridFoodFinder:
    """
    Search engine kết hợp:
    - Dense semantic (BGE-m3)
    - TF-IDF keyword
    - Lọc theo bán kính
    """

    def __init__(self, csv_path: Path):
        self.csv_path = Path(csv_path)

        # 1. Load & chuẩn hoá dữ liệu
        self.df = self.load_data(self.csv_path)

        # 2. Khởi tạo embedder (BGE-m3)
        self.embedder = RestaurantEmbedder()

        # 3. Tạo semantic embeddings (dense)
        self.semantic_matrix, self.embedded_texts = self.embed_restaurants(self.df)

        # 4. Tạo TF-IDF model (sparse)
        self.vectorizer, self.tfidf_matrix = self.create_tfidf_model(
            self.df["_tfidf_text"].tolist()
        )

    # =========================
    # DATA LOADING & CLEANING
    # =========================
    def load_data(self, csv_path: Path) -> pd.DataFrame:
        try:
            df = pd.read_csv(csv_path)
        except Exception:
            df = pd.read_csv(csv_path, encoding="utf-8-sig")
        

        # 4. Text cho TF-IDF
        df["_tfidf_text"] = (
            df["name"] + " " + df["category"] + " " + df["review"]
        ).fillna("").astype(str).str.lower()

        return df.reset_index(drop=True)

    # =========================
    # MODELS (SEMANTIC + TF-IDF)
    # =========================
    def embed_restaurants(self, restaurants_df: pd.DataFrame):
        """
        Gọi lại hàm embed_restaurants của RestaurantEmbedder.
        Trả về: (embeddings_matrix, texts_list)
        """
        embeddings, texts = self.embedder.embed_restaurants(restaurants_df)
        return embeddings, texts

    def create_tfidf_model(self, corpus_list):
        """Tạo model TF-IDF và ma trận sparse."""
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),  # Bắt cụm từ: "bún chả", "cơm tấm"
            min_df=2,            # Bỏ từ quá hiếm
            max_df=0.9           # Bỏ từ quá phổ biến
        )
        tfidf_matrix = vectorizer.fit_transform(corpus_list)
        return vectorizer, tfidf_matrix

    # =========================
    # SCORING HELPERS
    # =========================
    def _get_semantic_scores(self, query: str, row_indices=None):
        """Tính điểm semantic (dense) với BGE-m3."""
        query_vec = self.embedder.embed_query(query)
        if row_indices is None:
            matrix = self.semantic_matrix
        else:
            matrix = self.semantic_matrix[row_indices]

        # Dot product vì đã normalize
        scores = np.dot(matrix, query_vec)
        return scores

    def _get_tfidf_scores(self, query: str, row_indices=None):
        """Tính điểm keyword (TF-IDF cosine similarity)."""
        query_vec = self.vectorizer.transform([query.lower()])
        if row_indices is None:
            matrix = self.tfidf_matrix
        else:
            matrix = self.tfidf_matrix[row_indices]

        scores = cosine_similarity(query_vec, matrix).flatten()
        return scores

    # =========================
    # PUBLIC API: SEARCH
    # =========================
    def search(
        self,
        query: str,
        alpha: float = 0.5,
        top_k: int = 20,
        center: tuple | None = None,    # (lat, lon)
        radius_km: float | None = None,
    ) -> pd.DataFrame:
        """
        Hàm chính:
        - Input: query (text), alpha, top_k, center, radius_km
        - Output: DataFrame có các cột:
            ['name', 'category', 'rating', 'total_reviews', 'price_level',
             'semantic_score', 'tfidf_score', 'final_score', 'lat', 'lon', ...]
        """

        if not query.strip():
            return self.df.head(top_k)

        df_source = self.df

        # 1. Lọc theo bán kính (nếu có)
        if center is not None and radius_km is not None:
            lat0, lon0 = center
            mask = df_source.apply(
                lambda row: geodesic((row["lat"], row["lon"]), (lat0, lon0)).km <= radius_km,
                axis=1,
            )
            df_filtered = df_source[mask]
            if df_filtered.empty:
                return pd.DataFrame()
            valid_indices = df_filtered.index
        else:
            df_filtered = df_source
            valid_indices = df_filtered.index

        # 2. Tính điểm semantic & tfidf trên tập đã lọc
        sem_scores = self._get_semantic_scores(query, row_indices=valid_indices)
        tfidf_scores = self._get_tfidf_scores(query, row_indices=valid_indices)

        # 3. Kết hợp điểm (Hybrid)
        final_scores = alpha * sem_scores + (1 - alpha) * tfidf_scores

        # 4. Gắn vào DataFrame kết quả
        results = df_filtered.copy()
        results["semantic_score"] = sem_scores
        results["tfidf_score"] = tfidf_scores
        results["final_score"] = final_scores

        # 5. Sort & lấy top_k
        results = results.sort_values("final_score", ascending=False).head(top_k)
        return results
