import { z } from 'zod';
import { 
  insertClientSchema, 
  insertSourceSchema, 
  insertContentSchema, 
  insertBriefSchema, 
  insertAnalysisConfigSchema,
  clients,
  sources,
  contents,
  briefs,
  analysisConfigs
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  clients: {
    list: {
      method: 'GET' as const,
      path: '/api/clients',
      responses: {
        200: z.array(z.custom<typeof clients.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clients/:id',
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients',
      input: insertClientSchema,
      responses: {
        201: z.custom<typeof clients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/clients/:id',
      input: insertClientSchema.partial(),
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/clients/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  sources: {
    list: {
      method: 'GET' as const,
      path: '/api/clients/:clientId/sources',
      responses: {
        200: z.array(z.custom<typeof sources.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients/:clientId/sources',
      input: insertSourceSchema.omit({ clientId: true }),
      responses: {
        201: z.custom<typeof sources.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sources/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  contents: {
    list: {
      method: 'GET' as const,
      path: '/api/clients/:clientId/contents',
      responses: {
        200: z.array(z.custom<typeof contents.$inferSelect>()),
      },
    },
  },
  briefs: {
    list: {
      method: 'GET' as const,
      path: '/api/clients/:clientId/briefs',
      responses: {
        200: z.array(z.custom<typeof briefs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/briefs/:id',
      responses: {
        200: z.custom<typeof briefs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients/:clientId/briefs',
      input: insertBriefSchema.omit({ clientId: true }),
      responses: {
        201: z.custom<typeof briefs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/briefs/:id',
      input: insertBriefSchema.partial(),
      responses: {
        200: z.custom<typeof briefs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/clients/:clientId/briefs/generate',
      input: z.object({
        contentIds: z.array(z.string().uuid()).optional(),
        topic: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof briefs.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
