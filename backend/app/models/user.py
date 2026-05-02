from pydantic import BaseModel


class UserMeOut(BaseModel):
    model_config = {"from_attributes": True}

    user_id: str
    role: str
