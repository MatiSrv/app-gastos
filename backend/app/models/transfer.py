from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class TransferCreate(BaseModel):
    from_account_id: str
    to_account_id: str
    amount: float = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=255)
    date: date


class TransferOut(BaseModel):
    id: str
    user_id: str
    from_account_id: str
    to_account_id: str
    amount: float
    description: Optional[str]
    date: date
    created_at: datetime
    from_account: Optional[dict] = None
    to_account: Optional[dict] = None

    model_config = {"from_attributes": True}
