from pymongo import MongoClient
import certifi
from src.config import settings

# Tạo client 1 lần duy nhất
client = MongoClient(settings.MONGO_URI, tlsCAFile=certifi.where())
db = client[settings.DB_NAME]

def get_collection(collection_name: str):
    return db[collection_name]