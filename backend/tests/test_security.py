from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
PATH = "/api/admin/security-check"

def test_no_credentials():
    assert client.get(PATH).status_code == 401

def test_invalid_credentials(monkeypatch):
    monkeypatch.setenv("DEV_ADMIN_TOKEN", "admin-test-token")
    assert client.get(PATH, headers={"Authorization": "Bearer invalid"}).status_code == 401

def test_ranger_forbidden(monkeypatch):
    monkeypatch.setenv("DEV_RANGER_TOKEN", "ranger-test-token")
    assert client.get(PATH, headers={"Authorization": "Bearer ranger-test-token"}).status_code == 403

def test_admin_allowed(monkeypatch):
    monkeypatch.setenv("DEV_ADMIN_TOKEN", "admin-test-token")
    r = client.get(PATH, headers={"Authorization": "Bearer admin-test-token"})
    assert r.status_code == 200
    assert r.json()["role"] == "ADMIN"
