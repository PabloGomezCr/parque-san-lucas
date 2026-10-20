from fastapi.testclient import TestClient
from app.main import app, DEMO_RECORD

client = TestClient(app)
PATH = "/api/admin/security-check"
EDIT = "/api/admin/demo-record"

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

def test_unauthenticated_edit_does_not_mutate():
    DEMO_RECORD["description"] = "original"
    assert client.patch(EDIT, json={"description": "attacker"}).status_code == 401
    assert DEMO_RECORD["description"] == "original"

def test_ranger_edit_does_not_mutate(monkeypatch):
    monkeypatch.setenv("DEV_RANGER_TOKEN", "ranger-test-token")
    DEMO_RECORD["description"] = "original"
    response = client.patch(EDIT, headers={"Authorization": "Bearer ranger-test-token"}, json={"description": "attacker"})
    assert response.status_code == 403
    assert DEMO_RECORD["description"] == "original"

def test_admin_edit_succeeds(monkeypatch):
    monkeypatch.setenv("DEV_ADMIN_TOKEN", "admin-test-token")
    DEMO_RECORD["description"] = "original"
    response = client.patch(EDIT, headers={"Authorization": "Bearer admin-test-token"}, json={"description": "approved"})
    assert response.status_code == 200
    assert DEMO_RECORD["description"] == "approved"
