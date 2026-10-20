import os
import secrets
from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI(title="Parque San Lucas API")

def identity(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    token = authorization.removeprefix("Bearer ").strip()
    for role, env in (("PARK_RANGER", "DEV_RANGER_TOKEN"), ("ADMIN", "DEV_ADMIN_TOKEN")):
        expected = os.getenv(env)
        if expected and secrets.compare_digest(token, expected):
            return role
    raise HTTPException(401, "Invalid credentials", headers={"WWW-Authenticate": "Bearer"})

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/admin/security-check")
def admin_security_check(role: str = Depends(identity)):
    if role != "ADMIN":
        raise HTTPException(403, "Insufficient permissions")
    return {"access": "granted", "role": role}
