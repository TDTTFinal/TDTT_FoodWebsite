import os
from dotenv import load_dotenv

load_dotenv() # Load biến từ file .env

class Settings:
    MONGO_URI = os.getenv("MONGO_URI")
    DB_NAME = "tdtt"
    COLLECTION_NAME = "test"
    MODEL_NAME = "BAAI/bge-m3"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    def __init__(self):
        if not self.MONGO_URI:
            print("⚠️ WARNING: MONGO_URI is not set in .env file.")

settings = Settings()