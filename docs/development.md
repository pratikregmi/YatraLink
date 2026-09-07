# YatraOne Development Guide

## Project structure

- `frontend/` – React + TypeScript + Vite client
- `backend/` – FastAPI application
- `docs/` – product and engineering documentation
- `.github/` – automation and repository metadata

## Local setup

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API contract

The backend exposes versioned APIs at `/api/v1`.

### Health check

```http
GET /api/v1/health
```

Response:

```json
{
  "status": "ok",
  "service": "yatraone-api"
}
```

## Tooling

- Frontend lint: `npm run lint`
- Frontend build: `npm run build`
- Backend tests: `pytest`
- Backend lint: `ruff check .`

## Notes

This branch is intentionally limited to project foundation and API plumbing. Authentication, guide search, maps, bookings, payments, messaging, reviews, dashboards, and AI features are not included.
