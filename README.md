# ModelGecko

A CoinGecko-like platform for AI models featuring real-time rankings, benchmarks, pricing, and capabilities tracking for LLMs, image, video, audio, and multimodal AI models.

## Features

- **Real-time Rankings**: Track model performance across multiple benchmarks (MMLU, GPQA, HumanEval, etc.)
- **Comprehensive Data**: Access pricing, context windows, capabilities, and specifications
- **API Access**: Programmatic access to all model data with usage-based billing
- **Dashboard**: Manage API keys, view usage, and upgrade plans

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: Supabase PostgreSQL with Prisma ORM
- **API Key Management**: Unkey (free tier)
- **Payments**: Dodo Payments
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel (free tier)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account
- An Unkey account
- A Dodo Payments account

### 1. Clone and Install

```bash
cd modelgecko
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Unkey (https://unkey.dev)
UNKEY_ROOT_KEY="[YOUR-UNKEY-ROOT-KEY]"
UNKEY_API_ID="[YOUR-UNKEY-API-ID]"

# Dodo Payments (https://dodopayments.com)
DODO_SECRET_KEY="[YOUR-DODO-SECRET-KEY]"
DODO_PUBLIC_KEY="[YOUR-DODO-PUBLIC-KEY]"
DODO_WEBHOOK_SECRET="[YOUR-DODO-WEBHOOK-SECRET]"
NEXT_PUBLIC_DODO_PUBLIC_KEY="[YOUR-DODO-PUBLIC-KEY]"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Get your connection string from Settings > Database
3. Run the Prisma migration:

```bash
npx prisma db push
```

4. Seed the database with sample data:

```bash
npm run db:seed
```

### 4. Set Up Unkey

1. Create an account at [Unkey](https://unkey.dev)
2. Create a new API
3. Copy your Root Key and API ID to `.env`

### 5. Set Up Dodo Payments

1. Create an account at [Dodo Payments](https://dodopayments.com)
2. Create products/pricing plans in the Dodo dashboard
3. Get your API keys and webhook secret
4. Configure your webhook URL in Dodo to point to:
   ```
   https://your-app.vercel.app/api/webhooks/dodo
   ```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
modelgecko/
├── app/
│   ├── api/
│   │   ├── checkout/         # Dodo checkout sessions
│   │   ├── keys/            # API key management
│   │   ├── leaderboards/    # Benchmark rankings
│   │   ├── models/          # Model data endpoints
│   │   ├── modalities/      # List modalities
│   │   ├── portal/          # Customer portal
│   │   ├── pricing/         # Pricing plans
│   │   ├── providers/       # List providers
│   │   └── webhooks/dodo/   # Dodo webhook handler
│   ├── api-docs/            # API documentation page
│   ├── dashboard/           # User dashboard
│   ├── leaderboard/         # Rankings page
│   ├── models/              # Models list page
│   └── page.tsx             # Home page
├── components/              # UI components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── dodo.ts             # Dodo Payments integration
│   ├── unkey.ts            # Unkey API integration
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
└── public/                  # Static assets
```

## API Endpoints

### Public Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/models` | List models with filters |
| `GET /api/models/[slug]` | Get model details |
| `GET /api/leaderboards/[benchmark]` | Get rankings |
| `GET /api/providers` | List providers |
| `GET /api/modalities` | List modalities |
| `GET /api/pricing` | List pricing plans |

### Protected Endpoints (Require API Key)

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/models` | Full model data |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set these in Vercel:
- `DATABASE_URL`
- `UNKEY_ROOT_KEY`
- `UNKEY_API_ID`
- `DODO_SECRET_KEY`
- `DODO_PUBLIC_KEY`
- `DODO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Data Updates

As per your requirements, the founder will manually manage the database and run an n8n workflow every 3 hours to update model data. To update models manually:

1. Connect to your Supabase database
2. Use Prisma Studio to add/edit models:
   ```bash
   npx prisma studio
   ```

Or use the seed file to add sample data and then manually update as needed.

## License

MIT
