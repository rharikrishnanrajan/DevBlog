# ── Step 1: Base Image ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend manifests and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source & config, then compile TypeScript
COPY backend/ ./backend/
RUN cd backend && npm run build

# ── Step 2: Production Image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy compiled backend & production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY frontend/ ./frontend/
COPY database/ ./database/

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
