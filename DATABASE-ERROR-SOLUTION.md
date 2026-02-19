# Database Error: Solution & Root Cause

## The Problem

The error you're seeing:
```
Application error: a server-side exception has occurred
Digest: 1874501711

Can't reach database server at `db.wyxasmtlyrtvhvmggicy.supabase.co:5432`
```

**Root Cause**: The Supabase database connection is failing because:
1. The database is **paused** (Supabase free tier pauses after 7 days of inactivity)
2. The connection credentials are **incorrect or expired**
3. The Supabase project has been **deleted or paused**

## Immediate Solution

### Step 1: Check Supabase Status
1. Go to [supabase.com](https://supabase.com) and sign in
2. Check if your project `wyxasmtlyrtvhvmggicy` is:
   - **Active** ✅
   - **Paused** ⏸️ (click "Resume")
   - **Deleted** ❌ (needs new project)

### Step 2: If Project is Paused
- Click "Resume Project" in the Supabase dashboard
- Wait 2-3 minutes for full resume
- Database connection will work immediately
- Redeploy to Vercel (or just wait)

### Step 3: If Project is Active but Still Failing
1. Go to Project Settings → Database
2. Copy the connection string from "URI" field
3. Update your `.env` file:
   ```bash
   DATABASE_URL="postgresql://postgres:[NEW-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
4. Redeploy to Vercel

### Step 4: If Project Doesn't Exist
Create a new Supabase project:
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name and region
3. Wait for project creation
4. Get connection string from Settings → Database
5. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:NEW-PASSWORD@db.NEW-PROJECT-REF.supabase.co:5432/postgres"
   ```
6. Push schema:
   ```bash
   npx prisma db push
   ```
7. Seed data (optional):
   ```bash
   npm run db:seed
   ```
8. Redeploy to Vercel

## What I Fixed in the Code

I've added better error handling so the app doesn't crash:

### 1. Graceful Database Errors (`lib/db.ts`)
- Now catches database connection errors
- Returns empty arrays instead of crashing
- Logs errors for debugging

### 2. Build-Time Resilience
- All API routes handle errors gracefully
- Pages work without database at build time
- Empty state shown when database unavailable

### 3. Documentation
- `DATABASE-SETUP.md` - Complete setup guide
- `DATABASE-ERROR-SOLUTION.md` - This file
- Better comments in `.env` file

## How to Test

1. Update `.env` with correct DATABASE_URL
2. Test locally:
   ```bash
   npm run dev
   ```
3. Check Vercel deployment logs after redeploy

## Environment Variables Checklist

Make sure these are set in Vercel:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `UNKEY_ROOT_KEY` - Unkey API key
- [ ] `UNKEY_API_ID` - Unkey API ID
- [ ] `DODO_PUBLIC_KEY` - Dodo payments
- [ ] `DODO_SECRET_KEY` - Dodo payments secret

## If Problems Persist

1. **Check Vercel logs**: Go to Vercel Dashboard → Deployments → View Function Logs
2. **Verify DATABASE_URL format**:
   ```
   postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
   ```
3. **Test connection**: Replace `PASSWORD` with your actual password
4. **Check project status**: Ensure Supabase project is active (not paused)

## Support

If you need help:
1. Check the Vercel deployment logs
2. Verify all environment variables in Vercel dashboard
3. Ensure database is accessible from your deployment region

---

**TL;DR**: Your Supabase database is probably paused. Go to [supabase.com](https://supabase.com), resume your project, and redeploy to Vercel.