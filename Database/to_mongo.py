import pandas as pd
from pymongo import MongoClient
import certifi
import numpy as np

URL = "mongodb+srv://lnqhoc2407_db_user:admin123456@cluster0.zh3u1zk.mongodb.net/?appName=Cluster0"
DB_NAME = "tdtt"
COLLECTION_NAME = "restaurants"

PATH_RESTAURANTS = "tat_ca_thong_tin_nha_hang.csv" # Hoặc tên file chứa thông tin quán
PATH_REVIEWS = "tat_ca_binh_luan_nha_hang.csv"      # Hoặc tên file chứa review

RES_COL_MAP = {
    'ten_quan': 'name',
    'url_goc': 'source_url',
    'dia_chi': 'address',
    'gio_mo_cua': 'opening_hours',
    'gia_ca': 'price_range',
    'lat': 'lat',
    'lon': 'lon',
    'diem_trung_binh': 'avg_rating',
    'thuc_don': 'menu_raw',  # Cột thực đơn thô
    
    # Điểm số thành phần
    'diem_Không gian': 'score_space',
    'diem_Vị trí': 'score_position',
    'diem_Chất lượng': 'score_quality',
    'diem_Phục vụ': 'score_service',
    'diem_Giá cả': 'score_price',
    
    # Optional (Nếu có)
    'avatar_url': 'avatar_url'
}

REV_COL_MAP = {
    'url_goc': 'source_url',
    'diem': 'rating',         # CSV của bạn tên là 'diem'
    'noi_dung': 'content',
    'user': 'user_name'       # CSV của bạn tên là 'user'
}

def clean(val, default=""):
    if pd.isna(val) or val == "nan" or str(val).strip() == "":
        return default
    return str(val).strip()

def clean_float(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0

def process_menu(val):
    """Xử lý menu tách bằng dấu gạch đứng |"""
    if pd.isna(val) or val == "nan" or str(val).strip() == "":
        return []
    items = str(val).split('|')
    return [item.strip() for item in items if item.strip() != ""]

def migrate_data():
    print("⏳ [1/4] Đang đọc file CSV...")
    try:
        df_res = pd.read_csv(PATH_RESTAURANTS, encoding='utf-8-sig')
        df_rev = pd.read_csv(PATH_REVIEWS, encoding='utf-8-sig')
    except Exception as e:
        print(f"❌ Lỗi đọc file: {e}")
        return

    df_res.rename(columns=RES_COL_MAP, inplace=True)
    df_rev.rename(columns=REV_COL_MAP, inplace=True)

    print("⚙️ [2/4] Đang gom nhóm Review...")
    
    def pack_reviews(group):
        reviews_list = []
        for _, row in group.iterrows():
            reviews_list.append({
                "rating": clean_float(row.get('rating')), 
                "content": clean(row.get('content'), ""),
                "user_name": clean(row.get('user_name'), "Anonymous")
            })
        return reviews_list

    # Group theo source_url (tên mới sau khi rename)
    review_map = df_rev.groupby('source_url').apply(pack_reviews).to_dict()

    print("⚙️ [3/4] Đang tạo Document MongoDB...")
    
    documents = []

    for _, row in df_res.iterrows():
        url = row.get('source_url')
        
        # Xử lý tọa độ
        try:
            geo_location = {
                "type": "Point",
                "coordinates": [float(row['lon']), float(row['lat'])]
            }
        except (ValueError, KeyError):
            geo_location = None

        # Xử lý điểm số
        scores_obj = {
            "space": clean_float(row.get('score_space')),
            "position": clean_float(row.get('score_position')),
            "quality": clean_float(row.get('score_quality')),
            "service": clean_float(row.get('score_service')),
            "price": clean_float(row.get('score_price'))
        }

        # Tạo Document (Dùng tên cột chuẩn đã rename)
        doc = {
            "name": clean(row.get('name'), "Không tên"),
            "address": clean(row.get('address')),
            "opening_hours": clean(row.get('opening_hours')),
            "price_range": clean(row.get('price_range')),
            
            # Xử lý Menu từ cột 'menu_raw'
            "menu": process_menu(row.get('menu_raw')),
            
            "source_url": url,
            "avg_rating": clean_float(row.get('avg_rating')),
            "avatar_url": clean(row.get('avatar_url')),

            "location": geo_location,
            "scores": scores_obj,
            "reviews": review_map.get(url, [])
        }
        
        documents.append(doc)

    print(f"🚀 [4/4] Đang đẩy {len(documents)} nhà hàng lên Atlas...")
    
    try:
        client = MongoClient(URL, tlsCAFile=certifi.where())
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        collection.delete_many({}) 
        
        if documents:
            collection.insert_many(documents)
            print(f"✅ THÀNH CÔNG! Đã lưu {len(documents)} nhà hàng.")
            if len(documents) > 0:
                print(f"🔍 Mẫu menu quán đầu tiên: {documents[0]['menu']}")
        else:
            print("⚠️ File CSV rỗng.")
            
    except Exception as e:
        print(f"❌ Lỗi kết nối MongoDB: {e}")

if __name__ == "__main__":
    migrate_data()