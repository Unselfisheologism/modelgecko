import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'ModelGecko API',
        description: 'API for AI model rankings, benchmarks, pricing, and capabilities tracking',
        version: '1.0.0',
        contact: {
            name: 'ModelGecko Support',
        },
    },
    servers: [
        {
            url: '/api',
            description: 'Base API endpoint',
        },
    ],
    tags: [
        { name: 'Public', description: 'Public endpoints (no authentication required)' },
        { name: 'Protected', description: 'Protected endpoints (API key required)' },
        { name: 'Admin', description: 'Admin endpoints (admin authentication required)' },
        { name: 'System', description: 'System endpoints' },
    ],
    paths: {
        '/health': {
            get: {
                tags: ['System'],
                summary: 'Health check',
                description: 'Check API health status and service connectivity',
                responses: {
                    '200': {
                        description: 'API is healthy or degraded',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HealthStatus' },
                            },
                        },
                    },
                    '503': {
                        description: 'API is unhealthy',
                    },
                },
            },
        },
        '/models': {
            get: {
                tags: ['Public'],
                summary: 'List all models',
                description: 'Get a paginated list of AI models with optional filtering',
                parameters: [
                    { name: 'provider', in: 'query', schema: { type: 'string' }, description: 'Filter by provider' },
                    { name: 'modality', in: 'query', schema: { type: 'string' }, description: 'Filter by modality' },
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or provider' },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Number of results per page' },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Offset for pagination' },
                    { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'provider', 'releaseDate', 'contextWindow', 'createdAt', 'updatedAt'], default: 'name' } },
                    { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
                    { name: 'minContextWindow', in: 'query', schema: { type: 'integer' } },
                    { name: 'maxContextWindow', in: 'query', schema: { type: 'integer' } },
                    { name: 'releaseDateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'releaseDateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
                ],
                responses: {
                    '200': {
                        description: 'List of models',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Model' } },
                                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/models/{slug}': {
            get: {
                tags: ['Public'],
                summary: 'Get a single model',
                description: 'Retrieve detailed information about a specific model',
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'Model details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Model' },
                            },
                        },
                    },
                    '404': { description: 'Model not found' },
                },
            },
        },
        '/providers': {
            get: {
                tags: ['Public'],
                summary: 'List all providers',
                parameters: [
                    { name: 'includeMetadata', in: 'query', schema: { type: 'boolean', default: false } },
                ],
                responses: {
                    '200': {
                        description: 'List of providers',
                    },
                },
            },
        },
        '/modalities': {
            get: {
                tags: ['Public'],
                summary: 'List all modalities',
                parameters: [
                    { name: 'includeMetadata', in: 'query', schema: { type: 'boolean', default: false } },
                ],
                responses: {
                    '200': {
                        description: 'List of modalities',
                    },
                },
            },
        },
        '/leaderboards/{benchmark}': {
            get: {
                tags: ['Public'],
                summary: 'Get leaderboard for a benchmark',
                parameters: [
                    { name: 'benchmark', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
                    { name: 'provider', in: 'query', schema: { type: 'string' } },
                    { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                ],
                responses: {
                    '200': {
                        description: 'Leaderboard results',
                    },
                },
            },
        },
        '/pricing': {
            get: {
                tags: ['Public'],
                summary: 'Get pricing plans',
                responses: {
                    '200': {
                        description: 'Pricing plans',
                    },
                },
            },
        },
        '/v1/models': {
            get: {
                tags: ['Protected'],
                summary: 'List all models (protected)',
                description: 'Same as /api/models but requires API key',
                security: [{ ApiKeyAuth: [] }],
                parameters: [
                    { name: 'provider', in: 'query', schema: { type: 'string' } },
                    { name: 'modality', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                    { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'name' } },
                    { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
                ],
                responses: {
                    '200': { description: 'List of models' },
                    '401': { description: 'API key required' },
                },
            },
        },
        '/v1/bulk/models': {
            get: {
                tags: ['Protected'],
                summary: 'Bulk export models',
                security: [{ ApiKeyAuth: [] }],
                parameters: [
                    { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv'], default: 'json' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 1000 } },
                    { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
                ],
                responses: {
                    '200': {
                        description: 'Exported models',
                        content: {
                            'application/json': {},
                            'text/csv': {},
                        },
                    },
                },
            },
        },
        '/admin/models': {
            post: {
                tags: ['Admin'],
                summary: 'Create a new model',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ModelInput' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Model created' },
                    '401': { description: 'Admin authentication required' },
                    '409': { description: 'Model with slug already exists' },
                },
            },
        },
        '/admin/models/{slug}': {
            put: {
                tags: ['Admin'],
                summary: 'Update a model',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ModelInput' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Model updated' },
                    '401': { description: 'Admin authentication required' },
                    '404': { description: 'Model not found' },
                },
            },
            delete: {
                tags: ['Admin'],
                summary: 'Delete a model',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Model deleted' },
                    '401': { description: 'Admin authentication required' },
                    '404': { description: 'Model not found' },
                },
            },
        },
    },
    components: {
        schemas: {
            Model: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    slug: { type: 'string' },
                    name: { type: 'string' },
                    provider: { type: 'string' },
                    releaseDate: { type: 'string', format: 'date-time', nullable: true },
                    contextWindow: { type: 'integer', nullable: true },
                    modalities: { type: 'array', items: { type: 'string' } },
                    benchmarkScores: { type: 'object', additionalProperties: { type: 'number' }, nullable: true },
                    pricing: { type: 'object', nullable: true },
                    capabilities: { type: 'array', items: { type: 'string' } },
                    links: { type: 'object', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            ModelInput: {
                type: 'object',
                required: ['slug', 'name', 'provider'],
                properties: {
                    slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
                    name: { type: 'string' },
                    provider: { type: 'string' },
                    releaseDate: { type: 'string', format: 'date-time' },
                    contextWindow: { type: 'integer' },
                    modalities: { type: 'array', items: { type: 'string' } },
                    benchmarkScores: { type: 'object', additionalProperties: { type: 'number' } },
                    pricing: { type: 'object' },
                    capabilities: { type: 'array', items: { type: 'string' } },
                    links: { type: 'object' },
                },
            },
            PaginationMeta: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                },
            },
            HealthStatus: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                    version: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    services: {
                        type: 'object',
                        properties: {
                            database: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['connected', 'disconnected'] },
                                    latencyMs: { type: 'integer' },
                                },
                            },
                            unkey: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['connected', 'disconnected'] },
                                    latencyMs: { type: 'integer' },
                                },
                            },
                        },
                    },
                    metrics: {
                        type: 'object',
                        properties: {
                            totalModels: { type: 'integer' },
                            totalUsers: { type: 'integer' },
                        },
                    },
                },
            },
        },
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-Key',
            },
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
            },
        },
    },
}

export async function GET() {
    return NextResponse.json(openApiSpec, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
        },
    })
}
