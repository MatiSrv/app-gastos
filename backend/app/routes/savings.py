from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.auth import get_current_user, get_user_role, require_admin
from app.models.savings import (
    SavingsMemberCreate, SavingsMemberOut,
    SavingsContributionCreate, SavingsContributionUpdate, SavingsContributionOut,
    FundEntryUpdate, SavingsFundMonthCreate, SavingsFundMonthOut, SavingsReturnsOut,
)
from app.services import savings_service

router = APIRouter(prefix="/api/savings", tags=["savings"])


@router.get("/members", response_model=list[SavingsMemberOut])
def list_members(user_id: str = Depends(get_current_user)):
    return savings_service.list_members()


@router.post("/members", response_model=SavingsMemberOut, status_code=201)
def create_member(data: SavingsMemberCreate, user_id: str = Depends(require_admin)):
    return savings_service.create_member(data)


@router.get("/contributions", response_model=list[SavingsContributionOut])
def list_contributions(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    user_id: str = Depends(get_current_user),
):
    role = get_user_role(user_id)
    return savings_service.list_contributions(user_id, role, month)


@router.post("/contributions", response_model=SavingsContributionOut, status_code=201)
def create_contribution(data: SavingsContributionCreate, user_id: str = Depends(require_admin)):
    return savings_service.create_contribution(data)


@router.patch("/contributions/{contribution_id}", response_model=SavingsContributionOut)
def update_contribution(contribution_id: str, data: SavingsContributionUpdate, user_id: str = Depends(require_admin)):
    return savings_service.update_contribution(contribution_id, data)


@router.delete("/contributions/{contribution_id}", status_code=204)
def delete_contribution(contribution_id: str, user_id: str = Depends(require_admin)):
    savings_service.delete_contribution(contribution_id)


@router.patch("/contributions/{contribution_id}/fund", response_model=SavingsContributionOut)
def toggle_fund_entry(contribution_id: str, data: FundEntryUpdate, user_id: str = Depends(require_admin)):
    return savings_service.toggle_fund_entry(contribution_id, data.enters_fund)


@router.get("/fund-months", response_model=list[SavingsFundMonthOut])
def list_fund_months(user_id: str = Depends(get_current_user)):
    return savings_service.list_fund_months()


@router.post("/fund-months", response_model=SavingsFundMonthOut, status_code=201)
def create_fund_month(data: SavingsFundMonthCreate, user_id: str = Depends(require_admin)):
    return savings_service.create_fund_month(data)


@router.get("/returns", response_model=SavingsReturnsOut)
def get_returns(user_id: str = Depends(get_current_user)):
    role = get_user_role(user_id)
    return savings_service.calculate_returns(user_id, role)
