FROM node:20-slim

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

# Apply pending migrations (write env from container secrets first) then start
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then printf 'DATABASE_URL=\"%s\"\\nJWT_SECRET=\"%s\"\\nJWT_EXPIRES_IN=\"%s\"\\nPORT=7860\\n' \"$DATABASE_URL\" \"$JWT_SECRET\" \"$JWT_EXPIRES_IN\" > .env && npx prisma migrate deploy && echo 'Migrations applied successfully' || echo 'Migration failed, starting anyway'; fi; npm run start:prod"]
