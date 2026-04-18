from fastapi import APIRouter, Depends, Query
from app.auth import get_current_user
from app.models.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.services import category_service

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(user_id: str = Depends(get_current_user)):
    return category_service.list_categories(user_id)


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, user_id: str = Depends(get_current_user)):
    return category_service.create_category(data, user_id)


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: str, data: CategoryUpdate, user_id: str = Depends(get_current_user)):
    return category_service.update_category(category_id, data, user_id)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: str, user_id: str = Depends(get_current_user)):
    category_service.delete_category(category_id, user_id)


@router.get("/{category_id}/summary")
def get_summary(
    category_id: str,
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    user_id: str = Depends(get_current_user),
):
    return category_service.get_category_summary(category_id, user_id, month)
