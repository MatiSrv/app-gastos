from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.config import supabase
from app.models.savings import SavingsMemberCreate, SavingsContributionCreate, SavingsContributionUpdate, SavingsFundMonthCreate


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


def toggle_fund_entry(contribution_id: str, enters_fund: bool) -> dict:
    res = supabase.table("savings_contributions").update({"enters_fund": enters_fund}).eq("id", contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    contribution = res.data[0]
    member_res = supabase.table("savings_members").select("display_name").eq("id", contribution["member_id"]).maybe_single().execute()
    contribution["member_display_name"] = member_res.data["display_name"] if member_res.data else ""
    return contribution


def list_fund_months() -> list:
    res = supabase.table("savings_fund_months").select("*").order("month", desc=True).execute()
    return res.data


def create_fund_month(data: SavingsFundMonthCreate) -> dict:
    payload = {"month": str(data.month), "tna": data.tna}
    try:
        res = supabase.table("savings_fund_months").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        err = str(e)
        if "23505" in err or "unique" in err.lower():
            raise HTTPException(status_code=400, detail="Fund month already exists for this period")
        raise HTTPException(status_code=500, detail="Database error")


def calculate_returns(user_id: str, role: str) -> dict:
    fm_res = supabase.table("savings_fund_months").select("*").order("month").execute()
    fund_months = fm_res.data or []
    if not fund_months:
        return {"members": [], "total_fund": 0.0, "total_return": 0.0}

    members_res = supabase.table("savings_members").select("*").order("display_name").execute()
    members = members_res.data or []

    if role != "admin":
        member_res = supabase.table("savings_members").select("id").eq("user_id", user_id).maybe_single().execute()
        if not member_res.data:
            return {"members": [], "total_fund": 0.0, "total_return": 0.0}
        own_id = member_res.data["id"]
        members = [m for m in members if m["id"] == own_id]

    contrib_res = supabase.table("savings_contributions").select("member_id, amount, month").eq("enters_fund", True).execute()
    contrib_map: dict = {}
    for c in (contrib_res.data or []):
        contrib_map[(c["member_id"], c["month"])] = float(c["amount"])

    member_state: dict = {
        m["id"]: {"accumulated": 0.0, "cumulative_return": 0.0, "details": [], "display_name": m["display_name"]}
        for m in members
    }

    for fm in fund_months:
        month_str = fm["month"]
        monthly_rate = float(fm["tna"]) / 12.0 / 100.0
        for mid, state in member_state.items():
            contrib = contrib_map.get((mid, month_str), 0.0)
            new_acc = state["accumulated"] + contrib
            ret = new_acc * monthly_rate
            prev_cumulative = state["cumulative_return"]
            state["details"].append({
                "month": month_str,
                "contribution_entered": contrib,
                "accumulated": new_acc,
                "monthly_rate": monthly_rate,
                "return_amount": ret,
                "cumulative_return": prev_cumulative + ret,
            })
            state["accumulated"] = new_acc + ret
            state["cumulative_return"] += ret

    result_members = []
    for mid, state in member_state.items():
        result_members.append({
            "member_id": mid,
            "display_name": state["display_name"],
            "monthly_details": state["details"],
            "total_accumulated": state["accumulated"],
            "total_return": state["cumulative_return"],
        })

    total_fund = sum(m["total_accumulated"] for m in result_members)
    total_return = sum(m["total_return"] for m in result_members)
    return {"members": result_members, "total_fund": total_fund, "total_return": total_return}
