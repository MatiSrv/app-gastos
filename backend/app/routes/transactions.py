from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.auth import get_current_user
from app.models.transaction import TransactionCreate, TransactionUpdate, TransactionOut, PaginatedTransactions
from app.services import transaction_service

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=PaginatedTransactions)
def list_transactions(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    category_id: Optional[str] = None,
    account_id: Optional[str] = None,
    type: Optional[str] = Query(None, pattern="^(expense|income)$"),
    sort: str = Query("date_desc", pattern="^(date_asc|date_desc|amount_asc|amount_desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    return transaction_service.list_transactions(user_id, month, category_id, account_id, type, sort, page, limit)


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionCreate, user_id: str = Depends(get_current_user)):
    return transaction_service.create_transaction(data, user_id)


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: str, data: TransactionUpdate, user_id: str = Depends(get_current_user)):
    return transaction_service.update_transaction(transaction_id, data, user_id)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: str, user_id: str = Depends(get_current_user)):
    transaction_service.delete_transaction(transaction_id, user_id)
