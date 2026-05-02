from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.config import supabase
from app.models.savings import SavingsMemberCreate, SavingsContributionCreate, SavingsContributionUpdate


def list_members() -> list:
    res = supabase.table("savings_members").select("*").order("display_name").execute()
    return res.data


def create_member(data: SavingsMemberCreate) -> dict:
    payload = data.model_dump()
    payload["joined_at"] = str(data.joined_at)
    try:
        res = supabase.table("savings_members").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        err = str(e)
        if "23505" in err or "unique" in err.lower():
            raise HTTPException(status_code=400, detail="User is already a member")
        raise HTTPException(status_code=500, detail="Database error")


def list_contributions(user_id: str, role: str, month: Optional[str] = None) -> list:
    query = supabase.table("savings_contributions").select("*, savings_members(display_name)")

    if month:
        month_date = datetime.strptime(month, "%Y-%m").date()
        query = query.eq("month", str(month_date))

    if role != "admin":
        member_res = supabase.table("savings_members").select("id").eq("user_id", user_id).maybe_single().execute()
        if member_res.data is None:
            return []
        query = query.eq("member_id", member_res.data["id"])

    res = query.order("month", desc=True).order("created_at", desc=True).execute()

    rows = []
    for row in (res.data or []):
        member_info = row.pop("savings_members", None)
        row["member_display_name"] = member_info["display_name"] if member_info else ""
        rows.append(row)
    return rows


def create_contribution(data: SavingsContributionCreate) -> dict:
    payload = data.model_dump()
    payload["month"] = str(data.month)
    try:
        res = supabase.table("savings_contributions").insert(payload).execute()
        contribution = res.data[0]
    except Exception as e:
        err = str(e)
        if "23505" in err or "unique" in err.lower():
            raise HTTPException(status_code=400, detail="Contribution already exists for this member and month")
        if "23503" in err or "foreign key" in err.lower():
            raise HTTPException(status_code=400, detail="Member not found")
        raise HTTPException(status_code=500, detail="Database error")
    member_res = supabase.table("savings_members").select("display_name").eq("id", data.member_id).maybe_single().execute()
    contribution["member_display_name"] = member_res.data["display_name"] if member_res.data else ""
    return contribution


def update_contribution(contribution_id: str, data: SavingsContributionUpdate) -> dict:
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase.table("savings_contributions").update(payload).eq("id", contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    contribution = res.data[0]
    member_res = supabase.table("savings_members").select("display_name").eq("id", contribution["member_id"]).maybe_single().execute()
    contribution["member_display_name"] = member_res.data["display_name"] if member_res.data else ""
    return contribution


def delete_contribution(contribution_id: str) -> None:
    res = supabase.table("savings_contributions").delete().eq("id", contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
