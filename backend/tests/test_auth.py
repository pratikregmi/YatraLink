from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_user_can_signup_login_and_fetch_profile() -> None:
    email = f"traveler-{uuid4().hex[:8]}@example.com"
    payload = {
        'full_name': 'Aarav Sharma',
        'email': email,
        'password': 'secretpassword123',
    }

    signup_response = client.post('/api/v1/auth/signup', json=payload)

    assert signup_response.status_code == 201, signup_response.text
    body = signup_response.json()
    assert body['email'] == email
    assert body['full_name'] == 'Aarav Sharma'
    assert 'id' in body

    login_response = client.post(
        '/api/v1/auth/login',
        json={'email': email, 'password': 'secretpassword123'},
    )

    assert login_response.status_code == 200, login_response.text
    token = login_response.json()['access_token']
    assert token

    profile_response = client.get(
        '/api/v1/auth/me',
        headers={'Authorization': f'Bearer {token}'},
    )

    assert profile_response.status_code == 200, profile_response.text
    assert profile_response.json()['email'] == email
