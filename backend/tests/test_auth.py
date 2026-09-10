from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def make_email(prefix: str = 'traveler') -> str:
    return f'{prefix}-{uuid4().hex[:8]}@example.com'


def test_tourist_signup_succeeds() -> None:
    email = make_email('signup-success')
    payload = {
        'full_name': 'Aarav Sharma',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }

    response = client.post('/api/v1/auth/tourist/signup', json=payload)

    assert response.status_code == 201, response.text
    body = response.json()
    assert body['email'] == email
    assert body['full_name'] == 'Aarav Sharma'
    assert body['role'] == 'TOURIST'
    assert 'password_hash' not in body
    assert 'password' not in body


def test_tourist_user_receives_tourist_role() -> None:
    email = make_email('role-check')
    payload = {
        'full_name': 'Maya Gurung',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }

    response = client.post('/api/v1/auth/tourist/signup', json=payload)

    assert response.status_code == 201, response.text
    assert response.json()['role'] == 'TOURIST'


def test_duplicate_email_is_rejected() -> None:
    email = make_email('duplicate')
    payload = {
        'full_name': 'Rohan Rai',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }

    first = client.post('/api/v1/auth/tourist/signup', json=payload)
    second = client.post('/api/v1/auth/tourist/signup', json=payload)

    assert first.status_code == 201, first.text
    assert second.status_code == 400, second.text
    assert second.json()['detail'] == 'Email already exists'


def test_admin_credentials_are_required_for_admin_health_route() -> None:
    unauthenticated = client.get('/api/v1/admin/health')
    wrong_credentials = client.get('/api/v1/admin/health', auth=('admin', 'wrong-password'))
    correct_credentials = client.get('/api/v1/admin/health', auth=('admin', 'admin'))

    assert unauthenticated.status_code == 401, unauthenticated.text
    assert wrong_credentials.status_code == 401, wrong_credentials.text
    assert correct_credentials.status_code == 200, correct_credentials.text
    assert correct_credentials.json()['status'] == 'ok'


def test_invalid_email_is_rejected() -> None:
    response = client.post(
        '/api/v1/auth/tourist/signup',
        json={
            'full_name': 'Invalid Email',
            'email': 'not-an-email',
            'password': 'StrongPass123!',
            'password_confirmation': 'StrongPass123!',
        },
    )

    assert response.status_code == 422, response.text


def test_password_confirmation_mismatch_is_rejected() -> None:
    response = client.post(
        '/api/v1/auth/tourist/signup',
        json={
            'full_name': 'Mismatch User',
            'email': make_email('mismatch'),
            'password': 'StrongPass123!',
            'password_confirmation': 'DifferentPass123!',
        },
    )

    assert response.status_code == 400, response.text
    assert 'confirmation' in response.json()['detail'].lower()


def test_tourist_login_succeeds() -> None:
    email = make_email('login-success')
    signup_payload = {
        'full_name': 'Anika Tamang',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }
    client.post('/api/v1/auth/tourist/signup', json=signup_payload)

    response = client.post(
        '/api/v1/auth/tourist/login',
        json={'email': email, 'password': 'StrongPass123!'},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body['token_type'] == 'bearer'
    assert body['access_token']


def test_invalid_password_is_rejected() -> None:
    email = make_email('bad-pass')
    signup_payload = {
        'full_name': 'Rina Karki',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }
    client.post('/api/v1/auth/tourist/signup', json=signup_payload)

    response = client.post(
        '/api/v1/auth/tourist/login',
        json={'email': email, 'password': 'WrongPass123!'},
    )

    assert response.status_code == 401, response.text
    assert 'invalid' in response.json()['detail'].lower()


def test_jwt_is_generated() -> None:
    email = make_email('jwt-check')
    client.post(
        '/api/v1/auth/tourist/signup',
        json={
            'full_name': 'Sanjay KC',
            'email': email,
            'password': 'StrongPass123!',
            'password_confirmation': 'StrongPass123!',
        },
    )

    response = client.post(
        '/api/v1/auth/tourist/login',
        json={'email': email, 'password': 'StrongPass123!'},
    )

    assert response.status_code == 200, response.text
    token = response.json()['access_token']
    assert isinstance(token, str)
    assert token.split('.')[-1]


def test_protected_me_rejects_unauthenticated_requests() -> None:
    response = client.get('/api/v1/auth/me')

    assert response.status_code == 401, response.text


def test_protected_me_accepts_valid_jwt() -> None:
    email = make_email('valid-jwt')
    payload = {
        'full_name': 'Nisha Shrestha',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }
    signup = client.post('/api/v1/auth/tourist/signup', json=payload)
    token = client.post(
        '/api/v1/auth/tourist/login',
        json={'email': email, 'password': 'StrongPass123!'},
    ).json()['access_token']

    assert signup.status_code == 201, signup.text
    response = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})

    assert response.status_code == 200, response.text
    assert response.json()['email'] == email


def test_me_returns_the_authenticated_tourist() -> None:
    email = make_email('profile-check')
    client.post(
        '/api/v1/auth/tourist/signup',
        json={
            'full_name': 'Sundar Bhandari',
            'email': email,
            'password': 'StrongPass123!',
            'password_confirmation': 'StrongPass123!',
        },
    )
    token = client.post(
        '/api/v1/auth/tourist/login',
        json={'email': email, 'password': 'StrongPass123!'},
    ).json()['access_token']

    response = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})

    assert response.status_code == 200, response.text
    body = response.json()
    assert body['full_name'] == 'Sundar Bhandari'
    assert body['email'] == email
    assert body['role'] == 'TOURIST'
    assert body['is_active'] is True


def test_password_hash_is_never_returned_in_api_responses() -> None:
    email = make_email('hash-check')
    payload = {
        'full_name': 'Hari Thapa',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }

    signup_response = client.post('/api/v1/auth/tourist/signup', json=payload)
    profile_response = client.get(
        '/api/v1/auth/me',
        headers={'Authorization': f"Bearer {client.post('/api/v1/auth/tourist/login', json={'email': email, 'password': 'StrongPass123!'}).json()['access_token']}"},
    )

    assert signup_response.status_code == 201, signup_response.text
    assert 'password_hash' not in signup_response.json()
    assert 'password_hash' not in profile_response.json()


def test_local_guide_signup_keeps_guide_role() -> None:
    email = make_email('guide-signup')
    payload = {
        'full_name': 'Sita Rai',
        'email': email,
        'password': 'StrongPass123!',
        'password_confirmation': 'StrongPass123!',
    }

    response = client.post('/api/v1/auth/guide/signup', json=payload)

    assert response.status_code == 201, response.text
    assert response.json()['role'] == 'LOCAL_GUIDE'


def test_local_guide_login_returns_matching_role_profile() -> None:
    email = make_email('guide-login')
    client.post(
        '/api/v1/auth/guide/signup',
        json={
            'full_name': 'Binod Gurung',
            'email': email,
            'password': 'StrongPass123!',
            'password_confirmation': 'StrongPass123!',
        },
    )

    token_response = client.post(
        '/api/v1/auth/guide/login',
        json={'email': email, 'password': 'StrongPass123!'},
    )

    assert token_response.status_code == 200, token_response.text
    token = token_response.json()['access_token']

    profile_response = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert profile_response.status_code == 200, profile_response.text
    assert profile_response.json()['role'] == 'LOCAL_GUIDE'
