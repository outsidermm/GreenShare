'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import authUser from '../services/authUser';

interface UseAuthResult {
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

export default function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const pathname = usePathname();

  const refreshAuth = useCallback(async () => {
    try {
      const result = await authUser();
      const isValid = result && result.message === "Token is valid and user is in session";
      setIsAuthenticated(isValid);
    } catch (error) {
      console.error("Authentication validation failed:", error);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth, pathname]);

  return { isAuthenticated, refreshAuth };
}
