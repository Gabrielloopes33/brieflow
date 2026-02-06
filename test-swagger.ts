import express from "express";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = 5002;

// Basic Swagger spec
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
    description: 'Test API documentation',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Development server',
    },
  ],
  paths: {
    '/test': {
      get: {
        tags: ['Test'],
        summary: 'Test endpoint',
        description: 'A simple test endpoint',
        responses: {
          200: {
            description: 'Success response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Swagger UI
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Test API Documentation"
}));

// JSON endpoint para a especificação OpenAPI
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Test endpoint working!" });
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});