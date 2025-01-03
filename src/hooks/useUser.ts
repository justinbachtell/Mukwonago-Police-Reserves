import { useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import type { DBUser } from '@/types/user'
import { getCurrentUser } from '@/actions/user'

export function useUser() {
  const { user: clerkUser } = useClerk()
  const [user, setUser] = useState<DBUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (clerkUser) {
        try {
          const dbUser = await getCurrentUser()
          setUser(dbUser)
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
    }

    fetchUser()
  }, [clerkUser])

  return { user }
}
