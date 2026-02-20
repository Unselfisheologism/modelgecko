# n8n Database Setup Guide for ModelGecko

This guide explains how to set up n8n workflows to automatically update the ModelGecko database with AI model data.

## Table of Contents

1. [Database Connection](#database-connection)
2. [API Endpoint for n8n](#api-endpoint-for-n8n)
3. [Workflow Templates](#workflow-templates)
4. [Data Source Configurations](#data-source-configurations)
5. [Troubleshooting](#troubleshooting)

---

## Database Connection

### Connection Details

Use these credentials to connect n8n to the ModelGecko PostgreSQL database:

```
Host: db.wyxasmtlyrtvhvmggicy.supabase.co
Port: 5432
Database: postgres
Username: postgres.wyxasmtlyrtvhvmggicy
Password: [extract from DIRECT_URL environment variable]
SSL: Enabled (required)
```

### Setting up PostgreSQL Node in n8n

1. Add a **PostgreSQL** node to your workflow
2. Configure the connection:
   - **Host**: `db.wyxasmtlyrtvhvmggicy.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `postgres.wyxasmtlyrtvhvmggicy`
   - **Password**: `[your-password]`
   - **SSL**: Enable SSL connection

### Database Schema Reference

#### Models Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | String | URL-friendly identifier (unique) |
| name | String | Model display name |
| provider | String | Provider name (e.g., "OpenAI") |
| releaseDate | DateTime | Release date |
| contextWindow | Integer | Context window in tokens |
| modalities | String[] | Array of modalities (text, image, etc.) |
| benchmarkScores | JSON | Benchmark scores object |
| pricing | JSON | Pricing information |
| capabilities | String[] | Array of capabilities |
| tags | String[] | Array of tags/categories |
| links | JSON | External links (website, docs, api) |
| changelog | JSON | Version history |
| lastUpdated | DateTime | Last update timestamp |

#### Price History Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| modelId | String | Foreign key to Model (slug) |
| inputPrice | Float | Input price per million tokens |
| outputPrice | Float | Output price per million tokens |
| recordedAt | DateTime | Price recording timestamp |

---

## API Endpoint for n8n

### Bulk Update Endpoint

```
POST /api/admin/models/bulk-update
```

This endpoint allows bulk updates to the models table.

#### Authentication

Include an admin bearer token in the request header:

```
Authorization: Bearer [admin_token]
```

#### Request Body

```json
{
  "models": [
    {
      "slug": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "contextWindow": 128000,
      "modalities": ["text", "vision", "audio"],
      "benchmarkScores": {
        "mmlu": 88.7,
        "gpqa": 53.6,
        "hellaswag": 95.3
      },
      "pricing": {
        "inputPrice": 0.005,
        "outputPrice": 0.015
      },
      "capabilities": ["chat", "completion", "vision"],
      "links": {
        "website": "https://openai.com/gpt-4",
        "docs": "https://platform.openai.com/docs/models/gpt-4",
        "api": "https://api.openai.com/v1"
      }
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "updated": 1,
  "created": 0,
  "errors": []
}
```

---

## Workflow Templates

### Template 1: Scheduled Model Data Update

This workflow runs every 3 hours to fetch and update model data.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Cron Trigger│───▶│HTTP Request │───▶│  Function   │───▶│ PostgreSQL  │
│ (every 3h)  │    │(Provider API)│   │(Normalize)  │    │   Upsert    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                       ┌─────────────┐
                                                       │  Slack/Email│
                                                       │ Notification│
                                                       └─────────────┘
```

#### n8n Workflow JSON

```json
{
  "name": "ModelGecko - Scheduled Update",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 3
            }
          ]
        }
      },
      "name": "Cron Trigger",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://openai.com/api/models",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {}
      },
      "name": "Fetch OpenAI Models",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// Normalize data\nconst models = [];\n\nfor (const item of $input.all()) {\n  models.push({\n    slug: item.json.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),\n    name: item.json.name,\n    provider: 'OpenAI',\n    contextWindow: item.json.context_window,\n    modalities: item.json.modalities || ['text'],\n    benchmarkScores: item.json.benchmarks || {},\n    pricing: {\n      inputPrice: item.json.pricing?.input || 0,\n      outputPrice: item.json.pricing?.output || 0\n    },\n    capabilities: item.json.capabilities || [],\n    lastUpdated: new Date().toISOString()\n  });\n}\n\nreturn models.map(m => ({ json: m }));"
      },
      "name": "Normalize Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "operation": "upsert",
        "schema": "public",
        "table": "Model",
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {}
        },
        "options": {
          "conflictColumns": ["slug"]
        }
      },
      "name": "Upsert to Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.3,
      "position": [850, 300]
    }
  ]
}
```

### Template 2: Price History Tracking

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Cron Trigger│───▶│PostgreSQL   │───▶│  Function   │───▶│ PostgreSQL  │
│  (daily)    │    │Get Models   │    │Get Prices   │    │Insert Price │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Price History Insert Query

```sql
INSERT INTO "PriceHistory" (id, "modelId", "inputPrice", "outputPrice", "recordedAt")
SELECT 
  gen_random_uuid(),
  slug,
  (pricing->>'inputPrice')::float,
  (pricing->>'outputPrice')::float,
  NOW()
FROM "Model"
WHERE pricing IS NOT NULL;
```

### Template 3: Benchmark Score Updates

Fetch benchmark results from various sources and update model scores.

```json
{
  "name": "ModelGecko - Benchmark Update",
  "nodes": [
    {
      "parameters": {
        "url": "https://leaderboard.onprompt.ai/api/results",
        "options": {}
      },
      "name": "Fetch Benchmarks",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "const results = {};\n\nfor (const item of $input.all()) {\n  const modelName = item.json.model_name;\n  if (!results[modelName]) {\n    results[modelName] = {};\n  }\n  results[modelName][item.json.benchmark] = item.json.score;\n}\n\nreturn Object.entries(results).map(([name, scores]) => ({\n  json: { name, benchmarkScores: scores }\n}));"
      },
      "name": "Process Benchmarks",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE \"Model\" SET \"benchmarkScores\" = {{ JSON.stringify($json.benchmarkScores) }}, \"lastUpdated\" = NOW() WHERE name = '{{ $json.name }}'"
      },
      "name": "Update Scores",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.3,
      "position": [650, 300]
    }
  ]
}
```

---

## Data Source Configurations

### OpenAI

```javascript
// API Endpoint
const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';

// Headers
{
  'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
}

// Data mapping
{
  slug: model.id,
  name: model.id.toUpperCase(),
  provider: 'OpenAI',
  contextWindow: model.context_window || 4096,
  modalities: ['text'],
  // Additional data from OpenAI docs
}
```

### Anthropic

```javascript
// Anthropic doesn't have a public models API
// Use static configuration with manual updates
const ANTHROPIC_MODELS = [
  {
    slug: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    modalities: ['text', 'vision'],
    pricing: { inputPrice: 0.003, outputPrice: 0.015 }
  },
  // ... other models
];
```

### Google AI

```javascript
// API Endpoint
const GOOGLE_MODELS_URL = 'https://generativelanguage.googleapis.com/v1/models';

// Headers
{
  'x-goog-api-key': 'YOUR_GOOGLE_API_KEY'
}

// Data mapping
{
  slug: model.name.replace('models/', ''),
  name: model.displayName,
  provider: 'Google',
  contextWindow: model.inputTokenLimit,
  modalities: ['text'],
}
```

### Hugging Face Open LLM Leaderboard

```javascript
// API Endpoint
const HF_LEADERBOARD_URL = 'https://huggingface.co/api/open-llm-leaderboard/v2';

// Fetches benchmark scores for open-source models
// Includes: MMLU, GPQA, HumanEval, etc.
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Error**: `Connection refused` or `could not connect to server`

**Solution**:
- Verify the host and port are correct
- Ensure SSL is enabled
- Check if your IP is whitelisted (Supabase may require this)
- Verify the password from `DIRECT_URL` is correct

#### 2. SSL Certificate Error

**Error**: `SSL connection required`

**Solution**:
- Enable SSL in the PostgreSQL node configuration
- Add `?sslmode=require` to the connection string

#### 3. Authentication Failed

**Error**: `password authentication failed`

**Solution**:
- Verify the password from environment variables
- Check that the username includes the project ref: `postgres.wyxasmtlyrtvhvmggicy`

#### 4. Duplicate Key Error

**Error**: `duplicate key value violates unique constraint`

**Solution**:
- Use `ON CONFLICT (slug) DO UPDATE` in your SQL
- Or use the n8n PostgreSQL "Upsert" operation with conflict columns set to `slug`

### Debugging Queries

Check current models:
```sql
SELECT slug, name, provider, "lastUpdated" 
FROM "Model" 
ORDER BY "lastUpdated" DESC 
LIMIT 10;
```

Check recent price history:
```sql
SELECT m.name, p."inputPrice", p."outputPrice", p."recordedAt"
FROM "PriceHistory" p
JOIN "Model" m ON p."modelId" = m.slug
ORDER BY p."recordedAt" DESC
LIMIT 10;
```

Check for models missing benchmark data:
```sql
SELECT slug, name, provider
FROM "Model"
WHERE "benchmarkScores" IS NULL OR "benchmarkScores" = '{}';
```

---

## Security Best Practices

1. **Store credentials securely**: Use n8n's credential management, never hardcode passwords
2. **Limit API access**: Create a dedicated database user for n8n with limited permissions
3. **Use environment variables**: Reference the `DIRECT_URL` from your `.env` file
4. **Monitor workflows**: Set up alerts for failed workflow executions
5. **Rate limit**: Don't overwhelm provider APIs; use appropriate delays between requests

---

## Support

For issues or questions:
- GitHub Issues: [project-repo]/issues
- Documentation: https://modelgecko.com/api-docs
- Email: support@modelgecko.com
