from fastapi import APIRouter, Depends, Query
from app.auth import get_current_user
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/monthly")
def monthly(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    user_id: str = Depends(get_current_user),
):
    return dashboard_service.get_monthly_dashboard(user_id, month)


@router.get("/comparison")
def comparison(
    from_month: str = Query(..., alias="from", pattern=r"^\d{4}-\d{2}$"),
    to_month: str = Query(..., alias="to", pattern=r"^\d{4}-\d{2}$"),
    user_id: str = Depends(get_current_user),
):
    return dashboard_service.get_comparison(user_id, from_month, to_month)


@router.get("/overview")
def overview(user_id: str = Depends(get_current_user)):
    return dashboard_service.get_overview(user_id)
