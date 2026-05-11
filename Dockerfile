FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app/backend
ENV PORT=8000

CMD ["sh", "-c", "gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT}"]
