#!/usr/bin/env python3
import uvicorn
from app.config import HOST, PORT, LOG_LEVEL

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, log_level=LOG_LEVEL.lower(), reload=True)
