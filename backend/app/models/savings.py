from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class SavingsMemberCreate(BaseModel):
    user_id: str
    display_name: str = Field(..., max_length=100)
    joined_at: date


class SavingsMemberOut(BaseModel):
    id: str
    user_id: str
    display_name: str
    joined_at: date
    created_at: datetime

    model_config = {"from_attributes": True}


class SavingsContributionCreate(BaseModel):
    member_id: str
    amount: float = Field(..., gt=0)
    month: date
    notes: Optional[str] = None


class SavingsContributionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None


class SavingsContributionOut(BaseModel):
    id: str
    member_id: str
    member_display_name: str
    amount: float
    month: date
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
