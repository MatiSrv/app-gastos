import calendar
from fastapi import HTTPException
from app.config import supabase
from app.models.transaction import TransactionCreate, TransactionUpdate
from app.services.account_service import adjust_balance, get_account


def _balance_delta(tx_type: str, amount: float) -> float:
    return amount if tx_type == "income" else -amount


def list_transactions(
    user_id: str,
    month: str | None,
    category_id: str | None,
    account_id: str | None,
    tx_type: str | None,
    sort: str,
    page: int,
    limit: int,
) -> dict:
    query = (
        supabase.table("transactions")
        .select("*, category:categories(id,name,icon,color), account:accounts(id,name,icon,color)", count="exact")
        .eq("user_id", user_id)
    )

    if month:
        year, mon = month.split("-")
        start = f"{year}-{mon}-01"
        last_day = calendar.monthrange(int(year), int(mon))[1]
        end = f"{year}-{mon}-{last_day:02d}"
        query = query.gte("date", start).lte("date", end)

    if category_id:
        query = query.eq("category_id", category_id)
    if account_id:
        query = query.eq("account_id", account_id)
    if tx_type:
        query = query.eq("type", tx_type)

    sort_map = {
        "date_desc": ("date", {"desc": True}),
        "date_asc": ("date", {"desc": False}),
        "amount_desc": ("amount", {"desc": True}),
        "amount_asc": ("amount", {"desc": False}),
    }
    col, opts = sort_map.get(sort, ("date", {"desc": True}))
    query = query.order(col, **opts)

    offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    res = query.execute()
    return {
        "data": res.data or [],
        "total": res.count or 0,
        "page": page,
        "limit": limit,
    }


def get_transaction(transaction_id: str, user_id: str) -> dict:
    res = (
        supabase.table("transactions")
        .select("*")
        .eq("id", transaction_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return res.data


def create_transaction(data: TransactionCreate, user_id: str) -> dict:
    # Validate foreign keys belong to user
    get_account(data.account_id, user_id)
    payload = data.model_dump()
    payload["user_id"] = user_id
    payload["date"] = str(data.date)
    res = supabase.table("transactions").insert(payload).execute()
    tx = res.data[0]
    adjust_balance(data.account_id, user_id, _balance_delta(data.type, data.amount))
    return tx


def update_transaction(transaction_id: str, data: TransactionUpdate, user_id: str) -> dict:
    old = get_transaction(transaction_id, user_id)

    # Revert old effect
    adjust_balance(old["account_id"], user_id, -_balance_delta(old["type"], old["amount"]))

    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    if "date" in payload:
        payload["date"] = str(payload["date"])

    res = (
        supabase.table("transactions")
        .update(payload)
        .eq("id", transaction_id)
        .eq("user_id", user_id)
        .execute()
    )
    updated = res.data[0]

    # Apply new effect
    adjust_balance(updated["account_id"], user_id, _balance_delta(updated["type"], updated["amount"]))

    return updated


def delete_transaction(transaction_id: str, user_id: str) -> None:
    tx = get_transaction(transaction_id, user_id)
    supabase.table("transactions").delete().eq("id", transaction_id).eq("user_id", user_id).execute()
    adjust_balance(tx["account_id"], user_id, -_balance_delta(tx["type"], tx["amount"]))
