# YatraLink branch setup and local development commands
# Run from /workspaces/YatraLink after switching branches.

# 1. Confirm the branch and update only its configured remote.
cd /workspaces/YatraLink
git status --short --branch
git pull --ff-only

# 2. Create or repair the local Python environment, then install dependencies.
if [ ! -x .venv/bin/python ]; then /usr/local/bin/python3 -m venv --clear --copies .venv; fi
.venv/bin/python -m pip install -r backend/requirements.txt

# 3. Install frontend dependencies and apply database migrations.
cd frontend
npm ci
cd ../backend
../.venv/bin/alembic upgrade head

# 4. Run these in separate terminals.
# Backend:
# cd /workspaces/YatraLink/backend
# source ../.venv/bin/activate
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
#
# Frontend:
# cd /workspaces/YatraLink/frontend
# npm run dev -- --host 0.0.0.0 --port 5173

# 5. Verify before pushing or opening a PR to develop.
# cd /workspaces/YatraLink/backend
# ../.venv/bin/python -m pytest -q
# ../.venv/bin/ruff check .
# cd /workspaces/YatraLink/frontend
# npm run lint && npm run build