# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
ARG CACHEBUST=1
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-build /build/dist ./frontend/dist
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
