import { GET, POST } from '@/app/auth'

// This route is needed for database operations in a non-edge environment
export { GET, POST }

// Export config to be used in middleware
export const runtime = 'nodejs'
