from geopy.geocoders import Nominatim
from functools import lru_cache

class LocationResolver:
    def __init__(self):
        # user_agent là bắt buộc với Nominatim để tránh bị block
        self.geolocator = Nominatim(user_agent="tdtt_food_search_v1")
        
    @lru_cache(maxsize=100) # Cache lại kết quả để đỡ gọi API nhiều lần
    def resolve(self, query: str):
        """
        Tìm tọa độ từ tên địa điểm (VD: 'chợ Bến Thành')
        Trả về: (lat, lon) hoặc None
        """
        if not query:
            return None
            
        try:
            # Thêm ngữ cảnh Vietnam để tìm chính xác hơn
            search_query = f"{query}, Ho Chi Minh City, Vietnam"
            location = self.geolocator.geocode(search_query, timeout=5)
            
            if location:
                return (location.latitude, location.longitude)
            
            # Nếu không tìm thấy, trả về None
            return None
            
        except Exception as e:
            print(f"⚠️ Geocoding Error '{query}': {e}")
            return None
