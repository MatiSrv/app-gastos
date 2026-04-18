from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AccountBase(BaseModel):
    name: str = Field(..., max_length=100)
    initial_amount: float = Field(default=0, ge=0)
    currency: str = Field(default="ARS", max_length=3)
    icon: str = Field(default="wallet", max_length=50)
    color: str = Field(default="#10b981", pattern=r"^#[0-9A-Fa-f]{6}$")


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    currency: Optional[str] = Field(None, max_length=3)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class AccountOut(AccountBase):
    id: str
    user_id: str
    current_balance: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
