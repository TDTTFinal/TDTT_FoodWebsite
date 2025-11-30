import os
from dotenv import load_dotenv

load_dotenv() # Load biến từ file .env

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://lnqhoc2407_db_user:admin123456@cluster0.zh3u1zk.mongodb.net/?appName=Cluster0") # Nên để link thật vào đây hoặc file .env
    DB_NAME = "tdtt"
    COLLECTION_NAME = "restaurants"
    MODEL_NAME = "BAAI/bge-m3"

settings = Settings()