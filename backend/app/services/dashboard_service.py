import calendar
from app.config import supabase


def _month_range(month: str) -> tuple[str, str]:
    year, mon = month.split("-")
    last_day = calendar.monthrange(int(year), int(mon))[1]
    return f"{year}-{mon}-01", f"{year}-{mon}-{last_day:02d}"


def _aggregate_month(user_id: str, month: str) -> dict:
    start, end = _month_range(month)
    res = (
        supabase.table("transactions")
        .select("type,amount,category_id,category:categories(id,name,icon,color,monthly_budget)")
        .eq("user_id", user_id)
        .gte("date", start)
        .lte("date", end)
        .execute()
    )
    rows = res.data or []

    total_income = sum(r["amount"] for r in rows if r["type"] == "income")
    total_expense = sum(r["amount"] for r in rows if r["type"] == "expense")

    # Group expenses by category
    cat_map: dict[str, dict] = {}
    for r in rows:
        if r["type"] != "expense":
            continue
        cat = r.get("category") or {}
        cid = r["category_id"]
        if cid not in cat_map:
            cat_map[cid] = {
                "category_id": cid,
                "name": cat.get("name", ""),
                "icon": cat.get("icon", "tag"),
                "color": cat.get("color", "#6366f1"),
                "budget": cat.get("monthly_budget", 0),
                "spent": 0,
            }
        cat_map[cid]["spent"] += r["amount"]

    categories = []
    for c in cat_map.values():
        budget = c["budget"]
        spent = c["spent"]
        c["percentage"] = round((spent / budget * 100) if budget > 0 else 0, 1)
        categories.append(c)

    categories.sort(key=lambda x: x["spent"], reverse=True)

    return {
        "month": month,
        "total_income": total_income,
        "total_expense": total_expense,
        "net": total_income - total_expense,
        "categories": categories,
    }


def get_monthly_dashboard(user_id: str, month: str) -> dict:
    data = _aggregate_month(user_id, month)
    start, end = _month_range(month)

    # Top 5 expenses
    top5_res = (
        supabase.table("transactions")
        .select("id,description,amount,date,category:categories(name,icon,color),account:accounts(name)")
        .eq("user_id", user_id)
        .eq("type", "expense")
        .gte("date", start)
        .lte("date", end)
        .order("amount", desc=True)
        .limit(5)
        .execute()
    )
    data["top_expenses"] = top5_res.data or []
    return data


def get_comparison(user_id: str, from_month: str, to_month: str) -> dict:
    from_data = _aggregate_month(user_id, from_month)
    to_data = _aggregate_month(user_id, to_month)

    # Build per-category comparison
    from_cats = {c["category_id"]: c for c in from_data["categories"]}
    to_cats = {c["category_id"]: c for c in to_data["categories"]}
    all_ids = set(from_cats) | set(to_cats)

    comparison = []
    for cid in all_ids:
        fc = from_cats.get(cid, {})
        tc = to_cats.get(cid, {})
        from_spent = fc.get("spent", 0)
        to_spent = tc.get("spent", 0)
        diff = to_spent - from_spent
        pct = round((diff / from_spent * 100) if from_spent > 0 else 0, 1)
        comparison.append({
            "category_id": cid,
            "name": fc.get("name") or tc.get("name", ""),
            "icon": fc.get("icon") or tc.get("icon", "tag"),
            "color": fc.get("color") or tc.get("color", "#6366f1"),
            "from_spent": from_spent,
            "to_spent": to_spent,
            "difference": diff,
            "percentage_change": pct,
        })

    comparison.sort(key=lambda x: abs(x["difference"]), reverse=True)

    expense_diff = to_data["total_expense"] - from_data["total_expense"]
    trend = "stable"
    if expense_diff > 0.05 * from_data["total_expense"]:
        trend = "up"
    elif expense_diff < -0.05 * from_data["total_expense"]:
        trend = "down"

    return {
        "from_month": from_month,
        "to_month": to_month,
        "from": {"income": from_data["total_income"], "expense": from_data["total_expense"]},
        "to": {"income": to_data["total_income"], "expense": to_data["total_expense"]},
        "expense_trend": trend,
        "categories": comparison,
    }


def get_overview(user_id: str) -> dict:
    from datetime import date

    # All account balances
    accs = (
        supabase.table("accounts")
        .select("id,name,icon,color,current_balance,currency")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )
    accounts = accs.data or []
    total_balance = sum(a["current_balance"] for a in accounts)

    # Current month budget status
    now = date.today()
    current_month = f"{now.year}-{now.month:02d}"
    monthly = _aggregate_month(user_id, current_month)

    # Last 7 days transactions
    from datetime import timedelta
    week_ago = (now - timedelta(days=6)).isoformat()
    recent_res = (
        supabase.table("transactions")
        .select("id,type,amount,description,date,category:categories(name,icon,color),account:accounts(name)")
        .eq("user_id", user_id)
        .gte("date", week_ago)
        .order("date", desc=True)
        .execute()
    )

    return {
        "total_balance": total_balance,
        "accounts": accounts,
        "current_month": monthly,
        "recent_transactions": recent_res.data or [],
    }
