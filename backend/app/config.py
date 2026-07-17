import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", str(50 * 1024 * 1024)))
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
REMOVE_BG_API_KEY = os.getenv("REMOVE_BG_API_KEY", "")

os.makedirs(UPLOAD_DIR, exist_ok=True)
