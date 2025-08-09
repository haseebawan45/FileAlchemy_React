# Use Python 3.9 as base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies including audio processing support
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    libavcodec-extra \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy package files
COPY package*.json ./
COPY backend/requirements.txt ./backend/

# Install dependencies
RUN pip install -r backend/requirements.txt
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE $PORT

# Start command
CMD ["python", "backend/api_server.py"]