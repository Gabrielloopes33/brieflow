import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Definição manual da especificação Swagger
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BriefFlow API',
    version: '1.0.0',
    description: 'API para geração de conteúdo com fontes reais usando Claude API',
    contact: {
      name: 'BriefFlow Team',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-url.com' 
        : `http://localhost:${process.env.PORT || 5001}`,
      description: process.env.NODE_ENV === 'production' 
        ? 'Servidor de Produção' 
        : 'Servidor de Desenvolvimento',
    },
  ],
  components: {
    schemas: {
      Client: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único do cliente',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          name: {
            type: 'string',
            description: 'Nome do cliente',
            example: 'Minha Empresa Ltda'
          },
          description: {
            type: 'string',
            description: 'Descrição do cliente',
            example: 'Empresa de tecnologia especializada em soluções B2B'
          },
          niche: {
            type: 'string',
            description: 'Nicho de mercado',
            example: 'Tecnologia B2B'
          },
          targetAudience: {
            type: 'string',
            description: 'Público-alvo',
            example: 'Empresas de médio porte'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação'
          }
        }
      },
      Source: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único da fonte',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          clientId: {
            type: 'string',
            description: 'ID do cliente proprietário',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          name: {
            type: 'string',
            description: 'Nome da fonte',
            example: 'TechCrunch'
          },
          url: {
            type: 'string',
            description: 'URL da fonte',
            example: 'https://techcrunch.com/feed'
          },
          type: {
            type: 'string',
            enum: ['blog', 'youtube', 'news', 'rss'],
            description: 'Tipo da fonte',
            example: 'rss'
          },
          isActive: {
            type: 'boolean',
            description: 'Se a fonte está ativa',
            example: true
          },
          lastScrapedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Última data de coleta'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação'
          }
        }
      },
      Content: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único do conteúdo'
          },
          sourceId: {
            type: 'string',
            description: 'ID da fonte original'
          },
          clientId: {
            type: 'string',
            description: 'ID do cliente proprietário'
          },
          title: {
            type: 'string',
            description: 'Título do conteúdo',
            example: 'Novas tendências em IA para 2024'
          },
          url: {
            type: 'string',
            description: 'URL do conteúdo original',
            example: 'https://example.com/article'
          },
          contentText: {
            type: 'string',
            description: 'Texto completo do conteúdo'
          },
          summary: {
            type: 'string',
            description: 'Resumo do conteúdo'
          },
          topics: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tópicos identificados no conteúdo',
            example: ['IA', 'Tecnologia', 'Inovação']
          },
          publishedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de publicação original'
          },
          scrapedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de coleta'
          },
          isAnalyzed: {
            type: 'boolean',
            description: 'Se o conteúdo foi analisado pela IA',
            example: false
          }
        }
      },
      Brief: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único da pauta'
          },
          clientId: {
            type: 'string',
            description: 'ID do cliente proprietário'
          },
          contentIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs dos conteúdos base para esta pauta'
          },
          title: {
            type: 'string',
            description: 'Título da pauta',
            example: 'Guia Completo de Marketing Digital para 2024'
          },
          angle: {
            type: 'string',
            description: 'Ângulo abordado na pauta',
            example: 'Foco em pequenas empresas'
          },
          keyPoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Pontos principais da pauta',
            example: ['SEO moderno', 'Mídias sociais', 'E-mail marketing']
          },
          contentType: {
            type: 'string',
            description: 'Tipo de conteúdo sugerido',
            example: 'Artigo de blog'
          },
          suggestedCopy: {
            type: 'string',
            description: 'Texto sugerido para o conteúdo'
          },
          status: {
            type: 'string',
            enum: ['draft', 'approved', 'rejected', 'ready', 'in_progress', 'completed'],
            description: 'Status da pauta',
            example: 'draft'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação'
          },
          generatedBy: {
            type: 'string',
            description: 'Quem gerou a pauta',
            example: 'claude'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensagem de erro',
            example: 'Cliente não encontrado'
          },
          field: {
            type: 'string',
            description: 'Campo com erro (opcional)',
            example: 'id'
          }
        }
      }
    }
  },
  paths: {
    // Health Check
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificar saúde da API',
        description: 'Endpoint para verificar se a API está funcionando corretamente',
        responses: {
          200: {
            description: 'API está saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    
    // Clients endpoints
    '/api/clients': {
      get: {
        tags: ['Clients'],
        summary: 'Listar todos os clientes',
        description: 'Retorna uma lista de todos os clientes cadastrados',
        responses: {
          200: {
            description: 'Lista de clientes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Client' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Clients'],
        summary: 'Criar novo cliente',
        description: 'Cria um novo cliente no sistema',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Client' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cliente criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Client' },
              },
            },
          },
          400: {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    
    '/api/clients/{id}': {
      get: {
        tags: ['Clients'],
        summary: 'Obter cliente por ID',
        description: 'Retorna os detalhes de um cliente específico',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        responses: {
          200: {
            description: 'Dados do cliente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Client' },
              },
            },
          },
          404: {
            description: 'Cliente não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    
    // Sources endpoints
    '/api/clients/{clientId}/sources': {
      get: {
        tags: ['Sources'],
        summary: 'Listar fontes de um cliente',
        description: 'Retorna todas as fontes de conteúdo de um cliente específico',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        responses: {
          200: {
            description: 'Lista de fontes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Source' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Sources'],
        summary: 'Criar nova fonte',
        description: 'Adiciona uma nova fonte de conteúdo para um cliente',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Source' },
            },
          },
        },
        responses: {
          201: {
            description: 'Fonte criada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Source' },
              },
            },
          },
          400: {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    
    // Contents endpoints
    '/api/clients/{clientId}/contents': {
      get: {
        tags: ['Contents'],
        summary: 'Listar conteúdos de um cliente',
        description: 'Retorna todos os conteúdos coletados para um cliente específico',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        responses: {
          200: {
            description: 'Lista de conteúdos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Content' },
                },
              },
            },
          },
        },
      },
    },
    
    // Briefs endpoints
    '/api/clients/{clientId}/briefs': {
      get: {
        tags: ['Briefs'],
        summary: 'Listar pautas de um cliente',
        description: 'Retorna todas as pautas de conteúdo de um cliente específico',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        responses: {
          200: {
            description: 'Lista de pautas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Brief' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Briefs'],
        summary: 'Criar nova pauta',
        description: 'Cria uma nova pauta de conteúdo para um cliente',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Brief' },
            },
          },
        },
        responses: {
          201: {
            description: 'Pauta criada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Brief' },
              },
            },
          },
          400: {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    
    '/api/clients/{clientId}/briefs/generate': {
      post: {
        tags: ['Briefs'],
        summary: 'Gerar pauta com IA',
        description: 'Gera automaticamente uma pauta de conteúdo usando Claude API',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            schema: { type: 'string' },
            description: 'ID do cliente',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  contentIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'IDs dos conteúdos para basear a geração',
                  },
                  topic: {
                    type: 'string',
                    description: 'Tópico específico para a pauta',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Pauta gerada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Brief' },
              },
            },
          },
          500: {
            description: 'Erro na geração da pauta',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};

export { swaggerSpec, swaggerUi };