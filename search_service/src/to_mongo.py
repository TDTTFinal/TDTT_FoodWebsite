import pandas as pd
from pymongo import MongoClient
import certifi
import numpy as np
import re
import os
import sys

from dotenv import load_dotenv

# --- HACK ĐƯỜNG DẪN ĐỂ IMPORT MODULE TỪ SRC ---
# Giúp script tìm thấy folder 'src' nằm ở thư mục cha
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
sys.path.append(root_dir)

# Import Embedder từ code của bạn
from src.core.embedder import RestaurantEmbedder

# 1. CẤU HÌNH
# ---------------------------------------------------------
from src.config import settings

# Sử dụng config từ settings
MONGO_URI = settings.MONGO_URI
DB_NAME = settings.DB_NAME
COLLECTION_NAME = settings.COLLECTION_NAME

if not MONGO_URI:
    print("❌ Lỗi: Chưa cấu hình MONGO_URI trong file .env hoặc config.py")
    sys.exit(1)

PATH_RESTAURANTS = os.path.join(root_dir, "data", "tat_ca_thong_tin_nha_hang.csv")
PATH_REVIEWS = os.path.join(root_dir, "data", "tat_ca_binh_luan_nha_hang.csv")
PATH_MENU_DETAIL = os.path.join(root_dir, "data", "menu_chi_tiet.csv")

# Map tên cột
RES_COL_MAP = {
    'ten_quan': 'name', 'url_goc': 'source_url', 'dia_chi': 'address',
    'gio_mo_cua': 'opening_hours', 'gia_ca': 'price_range',
    'lat': 'lat', 'lon': 'lon', 'diem_trung_binh': 'avg_rating',
    'thuc_don': 'menu_raw', 'hinh_anh': 'image_url',
    'diem_Không gian': 'score_space', 'diem_Vị trí': 'score_position',
    'diem_Chất lượng': 'score_quality', 'diem_Phục vụ': 'score_service',
    'diem_Giá cả': 'score_price',
}
REV_COL_MAP = {'url_goc': 'source_url', 'diem': 'rating', 'noi_dung': 'content', 'user': 'user_name'}

# 2. HÀM XỬ LÝ (Giữ nguyên các hàm clean cũ)
# ---------------------------------------------------------
def clean(val, default=""):
    if pd.isna(val) or str(val).lower() == "nan" or str(val).strip() == "": return default
    return str(val).strip()

def clean_float(val):
    try: return float(val)
    except: return 0.0

def clean_price(val):
    if pd.isna(val) or str(val).strip() == "": return 0
    try:
        # Xóa các ký tự không phải số
        clean_str = re.sub(r'[^\d]', '', str(val))
        return int(clean_str)
    except:
        return 0

def clean_opening_hours(val):
    val = clean(val)
    if not val: return ""
    matches = re.findall(r'(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})', val)
    return " | ".join(matches) if matches else val


def get_menu_price_stats(menu_list):
    prices = [m['price'] for m in menu_list if m.get('price', 0) > 0]
    if not prices: return 0, 0
    return min(prices), max(prices)

# 3. HÀM MIGRATE CHÍNH
# ---------------------------------------------------------
def migrate_data():
    print("⏳ [1/6] Đang đọc file CSV...")
    try:
        df_res = pd.read_csv(PATH_RESTAURANTS, encoding='utf-8-sig')
        df_rev = pd.read_csv(PATH_REVIEWS, encoding='utf-8-sig')
        df_menu = pd.read_csv(PATH_MENU_DETAIL, encoding='utf-8-sig')
    except Exception as e:
        print(f"❌ Lỗi đọc file: {e}")
        return

    df_res.rename(columns=RES_COL_MAP, inplace=True)
    df_rev.rename(columns=REV_COL_MAP, inplace=True)
    # Map cột cho menu
    # url_goc,ten_mon,gia,anh_mon
    MENU_COL_MAP = {'url_goc': 'source_url', 'ten_mon': 'dish_name', 'gia': 'price', 'anh_mon': 'image_url'}
    df_menu.rename(columns=MENU_COL_MAP, inplace=True)

    # --- KHỞI TẠO AI EMBEDDER ---
    print("🤖 [2/6] Khởi tạo AI Model (Sẽ mất chút thời gian tải model)...")
    embedder = RestaurantEmbedder() # Load model BGE-M3

    print("⚙️ [3/6] Xử lý Reviews & Menus...")
    def pack_reviews(group):
        reviews = []
        for _, row in group.iterrows():
            reviews.append({
                "user_name": clean(row.get('user_name'), "Anonymous"),
                "rating": clean_float(row.get('rating')),
                "content": clean(row.get('content'))
            })
        return reviews
    review_map = df_rev.groupby('source_url').apply(pack_reviews).to_dict()

    def pack_menu(group):
        menu_items = []
        for _, row in group.iterrows():
            raw_name = clean(row.get('dish_name'))
            # Filter trash data
            if not raw_name or len(raw_name) < 2: continue
            if "[]" in raw_name or raw_name.startswith("'") or raw_name.startswith('"'): continue
            
            menu_items.append({
                "name": raw_name,
                "price": clean_price(row.get('price')),
                "image_url": clean(row.get('image_url'))
            })
        return menu_items
    
    # Gom menu theo nhà hàng
    menu_map = df_menu.groupby('source_url').apply(pack_menu).to_dict()

    print("⚙️ [4/6] Tạo Document & Tính Vector (Bước này lâu nhất)...")
    documents = []
    
    total = len(df_res)
    for idx, row in df_res.iterrows():
        url = row.get('source_url')
        
        # Xử lý dữ liệu
        
        # Lay menu tu chi tiet
        menu_objs = menu_map.get(url, [])



        min_p, max_p = get_menu_price_stats(menu_objs)
        reviews_list = review_map.get(url, [])
        
        try:
            geo_location = {
                "type": "Point",
                "coordinates": [float(row['lon']), float(row['lat'])]
            }
        except: geo_location = None

        scores_obj = {
            "space": clean_float(row.get('score_space')),
            "position": clean_float(row.get('score_position')),
            "quality": clean_float(row.get('score_quality')),
            "service": clean_float(row.get('score_service')),
            "price": clean_float(row.get('score_price'))
        }

        doc = {
            "name": clean(row.get('name'), "Không tên"),
            "address": clean(row.get('address')),
            "opening_hours": clean_opening_hours(row.get('opening_hours')),
            "price_range": clean(row.get('price_range')),
            "avatar_url": clean(row.get('image_url')),
            "source_url": url,
            "avg_rating": clean_float(row.get('avg_rating')),
            "location": geo_location,
            "menu": menu_objs,
            "menu_min_price": min_p,
            "menu_max_price": max_p,
            "scores": scores_obj,
            "reviews": reviews_list
        }
        
        # 👇 TÍNH TOÁN VECTOR NGAY TẠI ĐÂY
        # Dùng hàm _prepare_text của embedder để tạo chuỗi văn bản đại diện
        text_for_ai = embedder._prepare_text(doc) 
        
        # Mã hóa thành vector
        vector = embedder.model.encode(text_for_ai).tolist()
        
        # Lưu vào trường embedding
        doc['embedding'] = vector

        documents.append(doc)
        
        # In tiến độ cho đỡ sốt ruột
        if idx % 50 == 0:
            print(f"   -> Đã xử lý {idx}/{total} quán...")

    print(f"🚀 [5/6] Đang đẩy {len(documents)} nhà hàng lên MongoDB Atlas...")
    
    try:
        client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        collection.delete_many({})
        
        # Batch insert
        batch_size = 500
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            collection.insert_many(batch)
            print(f"   -> Đã upload lô {i} - {i + len(batch)}")
            
        print("✅ [6/6] HOÀN TẤT TOÀN BỘ! Database đã sẵn sàng Vector Search.")
        
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")

if __name__ == "__main__":
    migrate_data()