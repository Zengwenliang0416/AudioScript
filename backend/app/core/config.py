from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AudioScript"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    SUPPORTED_AUDIO_TYPES: List[str] = [
        "audio/mpeg", "audio/wav", "audio/x-wav",
        "audio/mp3", "audio/mp4", "audio/x-m4a",
        "audio/aac", "audio/ogg", "audio/flac"
    ]
    
    # OpenAI 配置
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "whisper-1"
    OPENAI_TIMEOUT: int = 600  # 10分钟超时
    OPENAI_MAX_RETRIES: int = 3
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
    )

settings = Settings() 