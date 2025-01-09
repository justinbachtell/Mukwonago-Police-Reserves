'use client'
import { UserContext } from './UserContext'
import type { DBUser } from '@/types/user'

export function UserProvider({
  children,
  user
}: {
  children: React.ReactNode
  user: DBUser | null
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
