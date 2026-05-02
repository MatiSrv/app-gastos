from fastapi import APIRouter, Depends

from app.auth import get_current_user, get_user_role
from app.models.user import UserMeOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserMeOut)
def get_me(user_id: str = Depends(get_current_user)) -> UserMeOut:
    role = get_user_role(user_id)
    return UserMeOut(user_id=user_id, role=role)
