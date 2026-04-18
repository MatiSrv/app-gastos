from pydantic import BaseModel, Field
from typing import Optional
from datetime import date as Date, datetime 


class TransactionBase(BaseModel):
    type: str = Field(..., pattern="^(expense|income)$")
    amount: float = Field(..., gt=0)
    description: str = Field(..., max_length=255)
    date: Date
    category_id: str
    account_id: str
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: Optional[str] = Field(None, pattern="^(expense|income)$")
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=255)
    date: Optional[Date] = None
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    notes: Optional[str] = None


class TransactionOut(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: Optional[dict] = None
    account: Optional[dict] = None

    model_config = {"from_attributes": True}


class PaginatedTransactions(BaseModel):
    data: list[TransactionOut]
    total: int
    page: int
    limit: int
