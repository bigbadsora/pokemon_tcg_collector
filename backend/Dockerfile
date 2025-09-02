FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Bring app (includes seed and entrypoint)
COPY . /app

# Run from /app/app so "main:app" works
WORKDIR /app/app
EXPOSE 8000
CMD ["/app/docker/entrypoint.sh"]
