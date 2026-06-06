FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8080 \
    DATABASE_BACKEND=sqlite \
    APP_DB_PATH=/app/data/app.db \
    FILE_STORAGE_BACKEND=local \
    APP_UPLOADS_DIR=/app/uploads

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY AGENTS.md PROJECT_ASSESSMENT.md ./
COPY docs ./docs
COPY scripts ./scripts
COPY icon.jpg ./icon.jpg

RUN mkdir -p /app/data /app/uploads

EXPOSE 8080

CMD ["python", "scripts/server.py"]
