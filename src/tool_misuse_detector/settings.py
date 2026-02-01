"""Application settings loaded from environment / .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore",
  )

  anthropic_api_key: str = ""
  docent_api_key: str = ""
  judge_model: str = "claude-sonnet-4-20250514"
  judge_max_tokens: int = 1024


settings = Settings()
