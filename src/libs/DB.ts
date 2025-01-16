import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/models/Schema'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'database',
  file: 'DB.ts'
})

// Connection pool configuration
const connectionConfig = {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout after 10 seconds when connecting
  prepare: false, // Disable prepared statements for better connection handling
  onError: (err: Error & { code?: string }) => {
    logger.error(
      'Database connection error',
      { error: err.message, code: err.code },
      'postgres'
    )
  }
}

// Create a single connection pool instance
const client = postgres(process.env.DATABASE_URL!, connectionConfig)

export const db = drizzle(client, { schema })

// Cleanup function for the connection pool
export async function closeConnection() {
  try {
    await client.end()
    logger.info(
      'Database connection closed successfully',
      undefined,
      'closeConnection'
    )
  } catch (error) {
    logger.error(
      'Error closing database connection',
      logger.errorWithData(error),
      'closeConnection'
    )
  }
}
