import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')

if ENVIRONMENT == 'production':
    model_config = SettingsConfigDict(env_file=None)
else:
    env_path = Path(__file__).parent.parent / '.env'
    model_config = SettingsConfigDict(env_file=str(env_path))


class Settings(BaseSettings):
    ENVIRONMENT: Optional[str] = ENVIRONMENT
    DATABASE_URL: str = ''
    model_config = model_config
