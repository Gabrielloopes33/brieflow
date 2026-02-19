FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache postgresql-client

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application inside the container
RUN npm run build

# Prune dev dependencies to keep image smaller (optional but good practice)
RUN npm prune --production

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.cjs"]
