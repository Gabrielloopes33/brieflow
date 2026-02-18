FROM node:18-alpine
<<<<<<< HEAD
WORKDIR /app
RUN apk add --no-cache postgresql-client
COPY package*.json ./
RUN npm ci --only=production
# NOVO: Copiar código fonte necessário
COPY server ./server
COPY shared ./shared
# Manter dist/ para assets do frontend
COPY dist ./dist
=======

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./

RUN npm ci --only=production

COPY dist ./dist

COPY package.json ./

COPY db ./db

COPY shared ./shared

>>>>>>> 9baf7ea (feat: Implement Firecrawl design system and Chat Dashboard)
ENV NODE_ENV=production
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
<<<<<<< HEAD
=======

>>>>>>> 9baf7ea (feat: Implement Firecrawl design system and Chat Dashboard)
CMD ["node", "dist/index.cjs"]