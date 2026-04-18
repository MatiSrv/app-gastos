from fastapi import HTTPException
from app.config import supabase
from app.models.account import AccountCreate, AccountUpdate


def list_accounts(user_id: str) -> list:
    res = (
        supabase.table("accounts")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("name")
        .execute()
    )
    return res.data


def get_account(account_id: str, user_id: str) -> dict:
    res = (
        supabase.table("accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Account not found")
    return res.data


def create_account(data: AccountCreate, user_id: str) -> dict:
    payload = data.model_dump()
    payload["user_id"] = user_id
    payload["current_balance"] = data.initial_amount
    res = supabase.table("accounts").insert(payload).execute()
    return res.data[0]


def update_account(account_id: str, data: AccountUpdate, user_id: str) -> dict:
    get_account(account_id, user_id)
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    res = (
        supabase.table("accounts")
        .update(payload)
        .eq("id", account_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data[0]


def delete_account(account_id: str, user_id: str) -> None:
    get_account(account_id, user_id)
    txns = (
        supabase.table("transactions")
        .select("id", count="exact")
        .eq("account_id", account_id)
        .execute()
    )
    if txns.count and txns.count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete account with existing transactions. Deactivating instead.",
        )
    supabase.table("accounts").update({"is_active": False}).eq("id", account_id).eq("user_id", user_id).execute()


def adjust_balance(account_id: str, user_id: str, delta: float) -> None:
    account = get_account(account_id, user_id)
    new_balance = account["current_balance"] + delta
    supabase.table("accounts").update({"current_balance": new_balance}).eq("id", account_id).execute()


def get_account_summary(account_id: str, user_id: str) -> dict:
    account = get_account(account_id, user_id)
    res = (
        supabase.table("transactions")
        .select("type,amount")
        .eq("account_id", account_id)
        .eq("user_id", user_id)
        .execute()
    )
    transactions = res.data or []
    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expense = sum(t["amount"] for t in transactions if t["type"] == "expense")
    return {
        "account": account,
        "total_income": total_income,
        "total_expense": total_expense,
        "net": total_income - total_expense,
    }
