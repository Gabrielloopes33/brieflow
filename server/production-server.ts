#!/usr/bin/env node

import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from dist/public
const distPath = path.resolve(__dirname, "..", "dist", "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  log(`Serving static files from ${distPath}`);
} else {
  log(`Warning: Build directory not found at ${distPath}`);
}

// Simple health check
app.get("/", (req, res) => {
  // Try to serve index.html first, fallback to API response
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: "Content-Generator API is running!",
      status: "healthy",
      timestamp: new Date().toISOString(),
      note: "Frontend not built - run 'npm run build' first"
    });
  }
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

// Mock sources endpoint
app.get("/api/clients/:id/sources", (req, res) => {
  res.json([]);
});

// Mock contents endpoint
app.get("/api/clients/:id/contents", (req, res) => {
  res.json([]);
});

// Mock briefs endpoint
app.get("/api/clients/:id/briefs", (req, res) => {
  res.json([]);
});

// Mock auth endpoints
app.post("/api/logout", (req, res) => {
  res.json({ success: true });
});

app.get("/api/logout", (req, res) => {
  // Clear session cookie
  res.clearCookie("auth");
  res.redirect("/");
});

app.get("/api/login", (req, res) => {
  // Simulate login by setting a simple session cookie
  res.cookie("auth", "demo-session", { 
    httpOnly: true, 
    secure: false, // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Redirect to frontend
  res.redirect("/?login=success");
});

app.post("/api/logout", (req, res) => {
  res.json({ success: true });
});

app.get("/api/auth/user", (req, res) => {
  // Check for session cookie (try both cookie-parser and headers)
  const hasSession = req.cookies?.auth || req.headers.cookie?.includes('auth=demo-session');
  
  if (!hasSession) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  res.json({
    id: "1",
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com"
  });
});

app.get("/api/user", (req, res) => {
  res.json({
    id: "1",
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com"
  });
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
const port = parseInt(process.env.PORT || "5004", 10);

httpServer.listen(port, () => {
  log(`Server running on port ${port}`);
  console.log(`\n🚀 Content-Generator está rodando!`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔌 API: http://localhost:${port}/api`);
  console.log(`🏠 Health: http://localhost:${port}/api/health`);
  console.log(`\n✨ Frontend servido do build em production mode!`);
  console.log(`🚀 Perfeito para deploy em VPS!`);
  console.log(`\n📝 Para desenvolvimento com hot-reload:`);
  console.log(`   set NODE_ENV=development && npx tsx server/index.ts`);
});