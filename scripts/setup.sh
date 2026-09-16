#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ ! -x .venv/bin/python ]]; then
  python3 -m venv --clear --copies .venv
fi

.venv/bin/python -m pip install -r backend/requirements.txt

if [[ -f frontend/package-lock.json ]]; then
  (cd frontend && npm ci)
else
  (cd frontend && npm install)
fi

(cd backend && ../.venv/bin/alembic upgrade head)

printf '\nSetup complete on branch: '
git branch --show-current
printf '\nStart the backend in one terminal:\n'
printf '  cd %s/backend && source ../.venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000\n' "$repo_root"
printf '\nStart the frontend in another terminal:\n'
printf '  cd %s/frontend && npm run dev -- --host 0.0.0.0 --port 5173\n' "$repo_root"