from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models.transfer import TransferCreate, TransferOut
from app.services import transfer_service

router = APIRouter(prefix="/api/transfers", tags=["transfers"])


@router.get("", response_model=list[TransferOut])
def list_transfers(user_id: str = Depends(get_current_user)):
    return transfer_service.list_transfers(user_id)


@router.post("", response_model=TransferOut, status_code=201)
def create_transfer(data: TransferCreate, user_id: str = Depends(get_current_user)):
    return transfer_service.create_transfer(data, user_id)


@router.delete("/{transfer_id}", status_code=204)
def delete_transfer(transfer_id: str, user_id: str = Depends(get_current_user)):
    transfer_service.delete_transfer(transfer_id, user_id)
