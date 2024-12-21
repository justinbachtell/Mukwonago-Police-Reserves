'use client';

import type { DBUser } from '@/types/user';
import { getCurrentUser } from '@/actions/user';
import { useAuth } from '@clerk/nextjs';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type UserContextType = {
  user: DBUser | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<DBUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (isSignedIn) {
        const response = await getCurrentUser();
        setUser(response as DBUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchUser();
    }
  }, [isLoaded, fetchUser]);

  const value = useMemo(() => ({
    user,
    isLoading,
    error,
    refetch: fetchUser,
  }), [user, isLoading, error, fetchUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
