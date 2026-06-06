# Sheden Organic Portfolio Status

This file is a public, sanitized handoff note for the portfolio copy of the project.

The private production project keeps a more detailed internal status document with exact Google Cloud resource names, deployment revisions, data correction notes, and operational history. Those details are intentionally not included in this public demo copy.

## Public Demo Scope

- This repository copy is intended for GitHub portfolio review.
- Runtime data, uploaded files, backups, imported Excel files, exported workbooks, local `.env` files, and production secrets are excluded.
- `data/`, `uploads/`, and `backups/` contain only `.gitkeep` placeholders.
- `cloudbuild.yaml` is kept as a deployment template and uses placeholder resource names.
- The application can run locally with SQLite by default.

## Architecture Summary

- Frontend: native HTML, CSS, and JavaScript under `docs/`.
- Backend: Python `http.server` API handler in `scripts/server.py`.
- Data layer: SQLite for local development; PostgreSQL-compatible paths for production.
- File storage: local `uploads/` for development; Google Cloud Storage-compatible backend for production.
- Deployment direction: Docker image deployed to Cloud Run, with Cloud SQL, Cloud Storage, and Secret Manager in production.

## Local Development

Default local runtime:

```text
DATABASE_BACKEND=sqlite
APP_DB_PATH=data/app.db
FILE_STORAGE_BACKEND=local
APP_UPLOADS_DIR=uploads
```

Start locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/server.py
```

Expected local URL:

```text
http://127.0.0.1:4174/
```

Useful checks:

```bash
python -m py_compile scripts/*.py
python scripts/check_runtime_config.py
python scripts/smoke_test.py
```

## Engineering Rules Preserved

- Excel is an import/export and reference format only, not a runtime source.
- Web-entered data is saved to the database.
- Code, runtime data, uploaded files, backups, temporary files, and secrets stay separated.
- Production deployments should use external managed persistence instead of Cloud Run container-local files.
- Sensitive values must be injected through environment variables or Secret Manager, never committed.
