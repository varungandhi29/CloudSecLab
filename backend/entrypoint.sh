#!/bin/sh
set -e

echo 'Running database initialization and startup seeding...'
python seed.py

echo 'Starting Uvicorn production server...'
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
