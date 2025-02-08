# Dockerfile.test
FROM python:3.12

# Set working directory to /app (your project root inside the container)
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

# Set PYTHONPATH so absolute imports resolve correctly
ENV PYTHONPATH=/app

# Default command (overridden by docker-compose) is to run tests
CMD ["pytest", "tests"]