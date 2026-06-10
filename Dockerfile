FROM node:20-slim
# Build: 2026-06-10 with Groq AI module

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy backend package files
COPY apps/backend/package.json apps/backend/

# Install dependencies (ignoring frontend)
RUN npm install --workspace=backend --include-workspace-root

# Copy backend source code
COPY apps/backend apps/backend/

# Set working directory to backend
WORKDIR /app/apps/backend

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Expose Hugging Face required port
EXPOSE 7860
ENV PORT=7860

# Start application (migrations run programmatically inside NestJS startup)
CMD ["npm", "run", "start:prod"]
