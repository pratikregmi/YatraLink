# YatraOne Development Guide

## Project structure

- `frontend/` – React + TypeScript + Vite client
- `backend/` – FastAPI application
- `docs/` – product and engineering documentation
- `.github/` – automation and repository metadata

## Local setup

### After switching branches

Stay on a feature branch and run the setup script from the repository root. It
is safe to rerun: it only recreates the ignored virtual environment when it is
missing, installs the current branch dependencies, installs frontend packages,
and applies Alembic migrations.

```bash
cd /workspaces/YatraLink
git status --short --branch
git pull --ff-only
bash scripts/setup.sh
```

The same commands are kept in the root `cmd` reference file. The script does
not switch branches, push commits, or modify `master`.

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

### Verification before push or PR

Run backend commands from `backend/` so the `app` package is importable:

```bash
cd /workspaces/YatraLink/backend
../.venv/bin/python -m pytest -q
../.venv/bin/ruff check .
```

Run frontend commands from `frontend/`:

```bash
cd /workspaces/YatraLink/frontend
npm run lint
npm run build
```

### Branch and PR workflow

All pull requests target `develop`; `master` is not an integration target.

```bash
cd /workspaces/YatraLink
git checkout develop
git pull --ff-only origin develop
git checkout -b feature/<short-name>
bash scripts/setup.sh
```

After implementation and verification:

```bash
git add <changed-files>
git commit -m "feat: describe the change"
git push -u origin feature/<short-name>
```

Open the pull request with:

```text
base: develop
compare: feature/<short-name>
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
