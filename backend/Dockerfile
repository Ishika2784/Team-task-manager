# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
COPY --from=frontend-build /frontend/dist ./frontend/dist
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
