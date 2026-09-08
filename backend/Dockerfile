FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    awscli \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/output/certificates && chmod +x /app/entrypoint.sh

ENV PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
