# Database Setup Guide

## Overview
ModelGecko requires a PostgreSQL database to store AI model data, user information, and usage logs. This guide will help you set up and configure the database.

## Database Provider
This project is configured to use Supabase (PostgreSQL), but you can use any PostgreSQL database.

## Quick Fix for Current Error
The error `Can't reach database server at db.wyxasmtlyrtvhvmggicy.supabase.co:5432` indicates:

### Possible Causes:
1. **Database Paused**: Supabase free tier databases pause after 7 days of inactivity
2. **Wrong Credentials**: The password in DATABASE_URL is incorrect or has changed
3. **Project Deleted/Paused**: The Supabase project may have been deleted or paused
4. **Network Issue**: Temporary network connectivity problem

### Solution Steps:

#### 1. Check Supabase Dashboard
- Go to [supabase.com](https://supabase.com) and sign in
- Navigate to your project dashboard
- Check if the project is **Active** (not Paused)

#### 2. If Project is Paused:
- Click "Resume Project" in the dashboard
- Wait for it to fully resume (may take a few minutes)
- Database connection should work immediately

#### 3. If Project is Active, Update Connection String:
- Go to Project Settings → Database
- Copy the connection string from "URI" (use the "postgres" user)
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- Update your `.env` file with the correct connection string
- Redeploy to Vercel

#### 4. Alternative: Create New Supabase Project
If the old project is no longer available:

```bash
# Create new project at https://supabase.com
# Get the connection string
# Update .env file
DATABASE_URL="postgresql://postgres:NEW_PASSWORD@db.NEW_PROJECT_REF.supabase.co:5432/postgres"

# Push database schema
npx prisma db push

# Seed with initial data (optional)
npm run db:seed
```

## Environment Variables

Required in `.env` file:

```bash
# Database connection string
DATABASE_URL="postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"

# Supabase (optional - for other features)
NEXT_PUBLIC_SUPABASE_URL="https://your_project_ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

## Database Schema

The application uses the following main tables:
- `Model`: AI model data (name, provider, benchmarks, pricing, etc.)
- `ApiUser`: User accounts and API key information
- `UsageLog`: API usage tracking
- `PricingPlan`: Subscription plans and pricing

## Seeding Data

To add sample model data:

```bash
npm run db:seed
```

## Troubleshooting

### "Database does not exist"
- Ensure the database URL is correct
- Check if the project is active in Supabase

### "Authentication failed"
- Verify the password in DATABASE_URL
- Ensure you're using the correct user (postgres)

### "Connection timeout"
- Check network connectivity
- Verify the project is not paused
- Try reconnecting after a few minutes

### Build Errors
- Ensure DATABASE_URL is set in your deployment environment
- On Vercel: Project Settings → Environment Variables

## Production Considerations

1. **Database Size**: Monitor your usage to avoid hitting limits
2. **Connection Pooling**: Configure connection pooling for high traffic
3. **Backups**: Enable automatic backups in Supabase
4. **Monitoring**: Set up alerts for database performance

## Support

If you continue to experience issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Ensure the database is accessible from your deployment region
4. Contact support if the problem persists