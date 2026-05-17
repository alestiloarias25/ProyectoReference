FROM python:3.11-slim

# Establecemos el directorio raíz
WORKDIR /app

# Copiamos dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el proyecto
COPY . .

# Agregamos la carpeta backend al PATH de Python
ENV PYTHONPATH=/app/backend:/app
ENV PORT=8000

# Arrancamos Gunicorn apuntando al archivo wsgi
# Nota: Si tu archivo está en backend/backend/wsgi.py, el camino es backend.wsgi
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--chdir", "/app/backend", "backend.wsgi:application"]
