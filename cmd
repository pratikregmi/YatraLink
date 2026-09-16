Backend terminal:

cd /workspaces/YatraLink/backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Frontend terminal:

cd /workspaces/YatraLink/frontend
npm run dev -- --host 0.0.0.0 --port 5173

Database terminal:

cd /workspaces/YatraLink/backend

sqlite3 -header -column yatraone.db \
"SELECT id, full_name, email, role, is_active, created_at
 FROM users
 WHERE role = 'TOURIST'
 ORDER BY id DESC;"

 sqlite3 -header -column yatraone.db \
"SELECT id, full_name, email, role, is_active, created_at
 FROM users
 WHERE role = 'LOCAL_GUIDE'
 ORDER BY id DESC;"