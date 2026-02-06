#!/usr/bin/env node

import express from "express";
import { createServer } from "http";
import { swaggerUi, swaggerSpec } from "./swagger-simple";

const app = express();
const httpServer = createServer(app);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger UI
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "BriefFlow API Documentation"
}));

// JSON endpoint para a especificação OpenAPI
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Simple health check
app.get("/", (req, res) => {
  res.json({
    message: "Content-Generator API is running!",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// API status
app.get("/api/health", (req, res) => {
  res.json({
    service: "Content-Generator API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Simple mock data
app.get("/api/clients", (req, res) => {
  res.json([
    {
      id: "1",
      name: "Cliente Exemplo",
      description: "Um cliente de exemplo",
      niche: "Marketing Digital",
      targetAudience: "Empresas B2B",
      createdAt: new Date().toISOString()
    }
  ]);
});

// Log middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Error handling
app.use((err: any, _req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Internal Server Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(status).json({ message });
});

// Start server
const port = parseInt(process.env.PORT || "5001", 10);

httpServer.listen(port, () => {
  log(`Server running on port ${port}`);
  console.log(`\n🚀 Content-Generator está rodando!`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔌 API: http://localhost:${port}/api`);
  console.log(`🏠 Health: http://localhost:${port}`);
  console.log(`\n📚 Próximos passos:`);
  console.log(`1. Configure sua API key do Claude no .env`);
  console.log(`2. Configure o banco de dados se quiser persistência`);
  console.log(`3. Acesse o frontend no navegador`);
});