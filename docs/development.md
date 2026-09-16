# YatraOne Development Guide

## Project structure

- `frontend/` – React + TypeScript + Vite client
- `backend/` – FastAPI application
- `docs/` – product and engineering documentation
- `.github/` – automation and repository metadata

## Local setup

### GitHub Codespaces

The repository includes `.devcontainer/setup.sh`. Codespaces runs it when a
container is created. It creates the root `.venv`, installs backend packages,
and installs frontend packages only when `frontend/node_modules` is missing.
Switching branches in the same Codespace keeps both environments; repeat the
setup command only when a branch changes `requirements.txt` or `package.json`.

```bash
bash .devcontainer/setup.sh
```

### Frontend

```bash
cd /workspaces/YatraLink/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

### Backend

```bash
cd /workspaces/YatraLink/backend
source ../.venv/bin/activate
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

The current branch includes tourist and local-guide authentication, JWT-protected
profiles, account/logout flow, and the initial users migration. Marketplace
features such as guide search, maps, bookings, payments, messaging, reviews,
dashboards, and AI features are not included yet.
