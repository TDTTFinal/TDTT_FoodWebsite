"""
embedder.py - Clean version without query enhancement
"""

from sentence_transformers import SentenceTransformer
import numpy as np
import pickle
import os
import re

class RestaurantEmbedder:
    def __init__(self, model_name='BAAI/bge-m3'):
        print(f"Loading embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name, trust_remote_code=True)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"✓ Model loaded! Embedding dimension: {self.embedding_dim}")
    
    def extract_cuisine_from_category(self, category):
        """
        Extract main cuisine from category
        """
        category_lower = category.lower()
        
        vietnamese_dishes = {
            'phở': 'Phở (Vietnamese noodle soup)',
            'bún': 'Bún (Vietnamese vermicelli)',
            'bánh mì': 'Bánh mì (Vietnamese sandwich)',
            'cơm': 'Cơm (Vietnamese rice dish)',
            'bún chả': 'Bún chả (Grilled pork with noodles)',
            'bánh xèo': 'Bánh xèo (Vietnamese pancake)',
            'gỏi cuốn': 'Gỏi cuốn (Spring rolls)',
            'chè': 'Chè (Vietnamese dessert)',
            'cafe': 'Vietnamese coffee',
            'cà phê': 'Vietnamese coffee',
            'lẩu': 'Lẩu (Vietnamese hotpot)'
        }
        
        for dish, description in vietnamese_dishes.items():
            if dish in category_lower:
                return description
        
        if 'pizza' in category_lower or 'pasta' in category_lower:
            return 'Italian'
        if 'sushi' in category_lower or 'ramen' in category_lower:
            return 'Japanese'
        if 'thai' in category_lower:
            return 'Thai'
        
        return 'Vietnamese'
    
    def prepare_restaurant_text(self, restaurant):
        """
        Prepare text for embedding - NO REPETITION
        Just structured, clean text
        """
        parts = []
        
        cuisine_info = self.extract_cuisine_from_category(restaurant['category'])
        
        # 1. Main name
        parts.append(f"Name: {restaurant['name']} {restaurant['name']}")
        
        # 2. Category
        parts.append(f"Category: {restaurant['category']}")
        
        # 3. Cuisine
        parts.append(f"Cuisine: {cuisine_info}")
        
        # 4. Description from name
        parts.append(f"Review: {restaurant['review']}")

        # 8. Rating signals
        try:
            rating = float(restaurant['rating'])
            num_reviews = int(restaurant['total_reviews'])
            
            if rating >= 4.5:
                parts.append("highly rated excellent")
            elif rating >= 4.0:
                parts.append("well rated good")
            
            if num_reviews > 500:
                parts.append("very popular")
            elif num_reviews < 50:
                parts.append("hidden gem")
        except:
            pass
        

        # Combine
        text = '. '.join([p for p in parts if p and p.strip()])
        text = ' '.join(text.split())
        
        return text
    
    def embed_restaurants(self, restaurants_df, cache_path='models/embeddings_cache.pkl'):
        """
        Batch embed all restaurants
        """
        print(f"\nPreparing to embed {len(restaurants_df)} restaurants...")
        
        # Check cache
        if os.path.exists(cache_path):
            print(f"Loading cached embeddings from {cache_path}...")
            with open(cache_path, 'rb') as f:
                cache = pickle.load(f)
            
            if len(cache['embeddings']) == len(restaurants_df):
                print("✓ Cache valid!")
                return cache['embeddings'], cache['texts']
            else:
                print("⚠️ Cache size mismatch, re-embedding...")
        
        # Prepare texts
        texts = []
        print("\nPreparing text representations...")
        for idx, row in restaurants_df.iterrows():
            text = self.prepare_restaurant_text(row)
            texts.append(text)
            
            if idx < 2:
                print(f"\n{'─'*60}")
                print(f"Restaurant: {row['name'][:50]}...")
                print(f"{'─'*60}")
                print(f"Text: {text[:200]}...")
                print(f"{'─'*60}")
        
        # Batch embed
        print("\nEmbedding restaurants...")
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        
        print(f"✓ Created embeddings: {embeddings.shape}")
        
        # Cache
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        with open(cache_path, 'wb') as f:
            pickle.dump({
                'embeddings': embeddings,
                'texts': texts,
                'version': '1.0'
            }, f)
        print(f"✓ Cached to {cache_path}")
        
        return embeddings, texts
    
    def embed_query(self, query):
        """Embed search query"""
        return self.model.encode(
        query,
        convert_to_numpy=True,
        normalize_embeddings=True 
        )
    
    @staticmethod
    def cosine_similarity(vec1, vec2):
        return float(np.dot(vec1, vec2))