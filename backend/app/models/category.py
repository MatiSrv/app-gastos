from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    icon: str = Field(default="tag", max_length=50)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9A-Fa-f]{6}$")
    monthly_budget: float = Field(default=0, ge=0)
    type: str = Field(..., pattern="^(expense|income)$")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    monthly_budget: Optional[float] = Field(None, ge=0)
    type: Optional[str] = Field(None, pattern="^(expense|income)$")


class CategoryOut(CategoryBase):
    id: str
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
