from fastapi import HTTPException
from app.config import supabase
from app.models.category import CategoryCreate, CategoryUpdate


def list_categories(user_id: str) -> list:
    res = (
        supabase.table("categories")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("name")
        .execute()
    )
    return res.data


def get_category(category_id: str, user_id: str) -> dict:
    res = (
        supabase.table("categories")
        .select("*")
        .eq("id", category_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Category not found")
    return res.data


def create_category(data: CategoryCreate, user_id: str) -> dict:
    payload = data.model_dump()
    payload["user_id"] = user_id
    res = supabase.table("categories").insert(payload).execute()
    return res.data[0]


def update_category(category_id: str, data: CategoryUpdate, user_id: str) -> dict:
    get_category(category_id, user_id)
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    res = (
        supabase.table("categories")
        .update(payload)
        .eq("id", category_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data[0]


def delete_category(category_id: str, user_id: str) -> None:
    get_category(category_id, user_id)
    # Check for associated transactions
    txns = (
        supabase.table("transactions")
        .select("id", count="exact")
        .eq("category_id", category_id)
        .execute()
    )
    if txns.count and txns.count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with existing transactions. Deactivating instead.",
        )
    supabase.table("categories").update({"is_active": False}).eq("id", category_id).eq("user_id", user_id).execute()


def get_category_summary(category_id: str, user_id: str, month: str) -> dict:
    category = get_category(category_id, user_id)
    year, mon = month.split("-")
    start = f"{year}-{mon}-01"
    import calendar
    last_day = calendar.monthrange(int(year), int(mon))[1]
    end = f"{year}-{mon}-{last_day:02d}"

    res = (
        supabase.table("transactions")
        .select("amount")
        .eq("category_id", category_id)
        .eq("user_id", user_id)
        .eq("type", "expense")
        .gte("date", start)
        .lte("date", end)
        .execute()
    )
    spent = sum(t["amount"] for t in (res.data or []))
    budget = category["monthly_budget"]
    return {
        "category": category,
        "month": month,
        "spent": spent,
        "budget": budget,
        "percentage": round((spent / budget * 100) if budget > 0 else 0, 1),
    }
