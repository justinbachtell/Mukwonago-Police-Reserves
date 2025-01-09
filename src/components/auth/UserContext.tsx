import { createContext } from 'react'
import type { DBUser } from '@/types/user'

export const UserContext = createContext<DBUser | null>(null)
