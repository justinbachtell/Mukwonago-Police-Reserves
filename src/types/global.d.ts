import type { DBUser } from './user'

declare global {
  // Type for the currently authenticated user
  type CurrentUser = DBUser | null | undefined
}

export {}
