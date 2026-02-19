# Database Schema Migration - February 19, 2025

## Issue Fixed
Fixed Prisma schema drift where the following columns existed in the Prisma schema but not in the actual database:
- `Model.tags` (TEXT[] with default empty array)
- `Model.changelog` (JSONB)

This was causing runtime errors:
```
The column `Model.tags` does not exist in the current database.
```

## Changes Applied

### 1. Created Migration Script
Created `scripts/add-tags-column.ts` which uses Prisma's raw SQL execution to add the missing columns. This approach works even when direct database access (port 5432) is restricted, as it can execute through the pooler connection.

### 2. Added Database Columns
Successfully added the following columns to the `Model` table:
- `tags`: TEXT[] - Array of tags with default empty array
- `changelog`: JSONB - JSON field for storing model changelog

### 3. Created Index
Created a GIN index on the `tags` column for better query performance when filtering by tags:
```sql
CREATE INDEX IF NOT EXISTS "Model_tags_idx" ON "Model" USING GIN ("tags");
```

### 4. Migration File
Created a standard Prisma migration file at `prisma/migrations/20250219_add_model_tags/migration.sql` that can be applied using:
```bash
npx prisma migrate deploy
```

## Verification

### API Endpoints Working
- `/api/models` - Returns model data with tags and changelog fields
- `/api/models?category=xxx` - Filtering by tags now works
- `/api/v1/models` - Protected endpoint working correctly

### Homepage Loading
- Homepage loads without errors
- Title: "ModelGecko - AI Model Rankings & Benchmarks"

## How to Apply in Production

### Option 1: Using the Migration Script (Recommended)
```bash
cd /home/engine/project
npx tsx scripts/add-tags-column.ts
```

This script:
- Adds both missing columns safely
- Creates necessary indexes
- Checks if columns already exist before adding them

### Option 2: Using Prisma Migrate (Requires Direct DB Access)
```bash
cd /home/engine/project
npx prisma migrate deploy
```

This will apply all pending migrations from the `prisma/migrations/` directory.

### Option 3: Using Prisma Push (Development)
```bash
cd /home/engine/project
npx prisma db push
```

This will push the entire schema to the database (use with caution in production).

## Network Considerations

In this environment:
- Direct database connection (port 5432) is blocked
- Pooler connection (port 6543) is accessible
- The migration script uses raw SQL execution which works through the pooler

For environments with direct database access, standard Prisma migration commands (`prisma migrate dev` or `prisma migrate deploy`) are preferred.

## Acceptance Criteria Met

- [x] Database schema matches Prisma schema
- [x] No more "column does not exist" errors
- [x] API endpoints return data correctly
- [x] Homepage loads without errors
- [x] .gitignore properly excludes sensitive files (.env, prisma/migrations/)

## Files Changed

1. `scripts/add-tags-column.ts` - New migration script
2. `prisma/migrations/20250219_add_model_tags/migration.sql` - Migration file
3. `prisma/migrations/20250219_add_model_tags/` - Migration directory created

## Notes

- The `tags` column is used for categorizing and filtering models
- The `changelog` column stores version history and updates for each model
- Both columns use appropriate PostgreSQL types (TEXT[] for tags, JSONB for changelog)
- Index on tags column improves query performance for tag-based filtering
