from fastapi import HTTPException
from app.config import supabase
from app.models.transfer import TransferCreate
from app.services.account_service import adjust_balance, get_account


def list_transfers(user_id: str) -> list:
    res = (
        supabase.table("transfers")
        .select("*, from_account:accounts!from_account_id(id,name,icon,color), to_account:accounts!to_account_id(id,name,icon,color)")
        .eq("user_id", user_id)
        .order("date", desc=True)
        .execute()
    )
    return res.data or []


def get_transfer(transfer_id: str, user_id: str) -> dict:
    res = (
        supabase.table("transfers")
        .select("*")
        .eq("id", transfer_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return res.data


def create_transfer(data: TransferCreate, user_id: str) -> dict:
    if data.from_account_id == data.to_account_id:
        raise HTTPException(status_code=400, detail="Source and destination accounts must differ")
    get_account(data.from_account_id, user_id)
    get_account(data.to_account_id, user_id)

    payload = data.model_dump()
    payload["user_id"] = user_id
    payload["date"] = str(data.date)

    res = supabase.table("transfers").insert(payload).execute()
    transfer = res.data[0]

    adjust_balance(data.from_account_id, user_id, -data.amount)
    adjust_balance(data.to_account_id, user_id, data.amount)

    return transfer


def delete_transfer(transfer_id: str, user_id: str) -> None:
    transfer = get_transfer(transfer_id, user_id)
    supabase.table("transfers").delete().eq("id", transfer_id).eq("user_id", user_id).execute()
    adjust_balance(transfer["from_account_id"], user_id, transfer["amount"])
    adjust_balance(transfer["to_account_id"], user_id, -transfer["amount"])
