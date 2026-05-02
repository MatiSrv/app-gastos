import json
import logging
import urllib.request

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.exceptions import JWKError

from app.config import SUPABASE_URL, supabase

logger = logging.getLogger("uvicorn.error")
bearer_scheme = HTTPBearer()

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_jwks_cache: dict | None = None


def _fetch_jwks() -> dict:
    with urllib.request.urlopen(JWKS_URL, timeout=5) as resp:
        return json.loads(resp.read())


def _get_key(kid: str) -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        _jwks_cache = _fetch_jwks()
    for key in _jwks_cache.get("keys", []):
        if key.get("kid") == kid:
            return key
    _jwks_cache = _fetch_jwks()
    for key in _jwks_cache.get("keys", []):
        if key.get("kid") == kid:
            return key
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown signing key")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    token = credentials.credentials
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        alg = header.get("alg", "ES256")
        if not kid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing kid")
        key = _get_key(kid)
        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            audience="authenticated",
        )
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except (JWTError, JWKError) as e:
        logger.error(f"[AUTH] JWT verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_user_role(user_id: str) -> str:
    result = supabase.table("user_roles").select("role").eq("user_id", user_id).maybe_single().execute()
    if result.data is None:
        return "savings"
    return result.data["role"]


def require_admin(user_id: str = Depends(get_current_user)) -> str:
    role = get_user_role(user_id)
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user_id
