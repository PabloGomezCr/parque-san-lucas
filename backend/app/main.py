import os
import secrets
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Parque San Lucas API")

# Provisional test-only credentials; never use these as production user login.
def identity(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    token = authorization.removeprefix("Bearer ").strip()
    for role, env in (("PARK_RANGER", "DEV_RANGER_TOKEN"), ("ADMIN", "DEV_ADMIN_TOKEN")):
        expected = os.getenv(env)
        if expected and secrets.compare_digest(token, expected):
            return role
    raise HTTPException(401, "Invalid credentials", headers={"WWW-Authenticate": "Bearer"})

def admin_only(role: str = Depends(identity)) -> str:
    if role != "ADMIN":
        raise HTTPException(403, "Insufficient permissions")
    return role

class UpdateRequest(BaseModel):
    description: str

# In-memory demonstration state; no real data or database is modified.
DEMO_RECORD = {"description": "original"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/admin/security-check")
def admin_security_check(role: str = Depends(admin_only)):
    return {"access": "granted", "role": role}

@app.get("/api/demo-record")
def read_demo_record(role: str = Depends(identity)):
    return DEMO_RECORD.copy()

@app.patch("/api/admin/demo-record")
def update_demo_record(payload: UpdateRequest, role: str = Depends(admin_only)):
    DEMO_RECORD["description"] = payload.description
    return DEMO_RECORD.copy()
