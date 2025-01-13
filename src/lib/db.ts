import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'lib',
  file: 'db.ts'
})

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  logger.error('DATABASE_URL is not defined', {}, 'db')
  throw new Error('DATABASE_URL is not defined')
}

const client = postgres(connectionString)
export const db = drizzle(client)
