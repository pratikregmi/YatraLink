#!/usr/bin/env bash
set -euo pipefail

workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$workspace_root"

if [[ ! -x .venv/bin/python ]] || ! .venv/bin/python -c 'import sys' >/dev/null 2>&1; then
  rm -rf .venv
  python -m venv .venv
fi

.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r backend/requirements.txt

if [[ ! -d frontend/node_modules ]]; then
  npm --prefix frontend install
fi

if [[ ! -f backend/.env && -f backend/.env.example ]]; then
  cp backend/.env.example backend/.env
fi

if [[ ! -f frontend/.env && -f frontend/.env.example ]]; then
  cp frontend/.env.example frontend/.env
fi