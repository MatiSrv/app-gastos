from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models.account import AccountCreate, AccountUpdate, AccountOut
from app.services import account_service

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountOut])
def list_accounts(user_id: str = Depends(get_current_user)):
    return account_service.list_accounts(user_id)


@router.post("", response_model=AccountOut, status_code=201)
def create_account(data: AccountCreate, user_id: str = Depends(get_current_user)):
    return account_service.create_account(data, user_id)


@router.put("/{account_id}", response_model=AccountOut)
def update_account(account_id: str, data: AccountUpdate, user_id: str = Depends(get_current_user)):
    return account_service.update_account(account_id, data, user_id)


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: str, user_id: str = Depends(get_current_user)):
    account_service.delete_account(account_id, user_id)


@router.get("/{account_id}/summary")
def get_summary(account_id: str, user_id: str = Depends(get_current_user)):
    return account_service.get_account_summary(account_id, user_id)
