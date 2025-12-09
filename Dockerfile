# Multi-stage Dockerfile for Hugging Face Spaces deployment
# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Python backend with frontend static files
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for file processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend static files from builder stage
COPY --from=frontend-builder /app/frontend/dist ./static

# Create directory for ChromaDB persistence
RUN mkdir -p ./chroma_db

# Expose port (Hugging Face Spaces uses 7860)
EXPOSE 7860

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Run the application
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]

