import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Attempting to add missing columns to Model table...')

  try {
    // Try to execute raw SQL to add the tags column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}'
    `)
    console.log('Successfully added tags column')

    // Try to add the changelog column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "changelog" JSONB
    `)
    console.log('Successfully added changelog column')

    // Create index on tags
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Model_tags_idx" ON "Model" USING GIN ("tags")
    `)
    console.log('Successfully created index on tags column')

  } catch (error) {
    console.error('Error adding columns:', error)

    // Check which columns already exist
    try {
      const result = await prisma.$queryRaw<Array<{column_name: string}>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Model'
        AND column_name IN ('tags', 'changelog')
      `

      const existingColumns = result.map(r => r.column_name)
      console.log('Existing columns:', existingColumns)

      const missingColumns = ['tags', 'changelog'].filter(col => !existingColumns.includes(col))
      if (missingColumns.length === 0) {
        console.log('All required columns already exist in the database')
      } else {
        console.log('Missing columns that could not be added automatically:', missingColumns)
        console.log('Please run this migration in an environment with direct database access:')
        console.log('  npx prisma db push')
      }
    } catch (checkError) {
      console.error('Error checking column existence:', checkError)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('Script error:', e)
    process.exit(1)
  })
