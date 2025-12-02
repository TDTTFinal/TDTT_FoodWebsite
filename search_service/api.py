# api.py
from pathlib import Path

import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware

from search_engine import HybridFoodFinder  # class bạn đã tạo

class SearchRequest(BaseModel):
    query: str = Field(..., description="User search")
    alpha: float = Field(0.5, ge=0.0, le=1.0, description="0=TF-IDF, 1=Semantic")
    top_k: int = Field(20, ge=1, le=100, description="Number of output")
    lat: Optional[float] = Field(10.7769, description="latitude")
    lon: Optional[float] = Field(106.7009, description="longtitude")
    radius_km: Optional[float] = Field(
        5, description="Radius of the circle bao quanh User"
    )

class SearchResult(BaseModel):
    name: str
    category: str
    rating: float
    total_reviews: int
    address: str
    lat: float
    lon: float
    semantic_score: float
    tfidf_score: float
    final_score: float

class SearchResponse(BaseModel):
    results: List[SearchResult]

app = FastAPI(
    title="Food Finder Hybrid Search API",
    description="API cho HybridFoodFinder (Semantic + TF-IDF)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi nguồn (React) truy cập
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép POST, GET...
    allow_headers=["*"],
)

CSV_PATH = Path("Data") / "data_end.csv"

def load_data(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    return df

engine = HybridFoodFinder(CSV_PATH)

@app.post("/api/v1/search", response_model=SearchResponse)
def search_food(req: SearchRequest):
    # Chuẩn bị tham số center & radius
    if req.lat is not None and req.lon is not None and req.radius_km is not None:
        center = (req.lat, req.lon)
        radius = req.radius_km
    else:
        center = None
        radius = None

    # Gọi engine.search(...)
    results_df = engine.search(
        query=req.query,
        alpha=req.alpha,
        top_k=req.top_k,
        center=center,
        radius_km=radius,
    )

    # Nếu không có kết quả
    if results_df.empty:
        return SearchResponse(results=[])

    # Chỉ pick các cột cần dùng
    cols = [
        "name",
        "category",
        "rating",
        "total_reviews",
        "address",
        "lat",
        "lon",
        "semantic_score",
        "tfidf_score",
        "final_score",
    ]
    # Nếu df thiếu cột nào (tuỳ data), bạn nhớ xử lý hoặc thêm mặc định
    for c in cols:
        if c not in results_df.columns:
            results_df[c] = 0

    records = results_df[cols].to_dict(orient="records")

    # Map sang SearchResult
    results = [SearchResult(**r) for r in records]
    return SearchResponse(results=results)
