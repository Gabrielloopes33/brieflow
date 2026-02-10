import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Catch-all para rotas não-API (serve SPA)
  // Rotas /api/* são registradas em registerRoutes() ANTES deste middleware
  app.use((req, res, next) => {
    // Se for rota de API ou docs, deixa passar para handler 404 do Express
    if (req.path.startsWith('/api/') || req.path.startsWith('/api-docs')) {
      return next();
    }

     // Caso contrário, serve o SPA (index.html)
     const url = req.originalUrl;

     try {
       const clientTemplate = path.resolve(
         import.meta.dirname,
         "..",
         "client",
         "index.html",
       );

       // always reload the index.html file from disk in case it changes
       fs.readFile(clientTemplate, "utf-8", (err, template) => {
         if (err) {
           console.error('Error reading index.html:', err);
           return next();
         }

         template = template.replace(
           `src="/src/main.tsx"`,
           `src="/src/main.tsx?v=${nanoid()}"`,
         );

         vite.transformIndexHtml(url, template).then((page) => {
           res.status(200).set({ "Content-Type": "text/html" }).end(page);
         }).catch((transformErr) => {
           console.error('Error transforming HTML:', transformErr);
           return next();
         });
       });
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
