"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import authUser from "../services/user/authUser";

interface UseAuthResult {
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

// Custom React hook to manage and track user authentication status
export default function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const pathname = usePathname();

  // Asynchronously verifies the user's authentication status via a backend call
  const refreshAuth = useCallback(async () => {
    try {
      const result = await authUser();
      if (result.message === "Token is valid and user is in session")
        setIsAuthenticated(true);
      else setIsAuthenticated(false);
    } catch (error) {
      console.error("Authentication validation failed:", error);
      setIsAuthenticated(false);
    }
  }, []);

  // Re-run authentication check whenever the pathname changes (i.e., route navigation)
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth, pathname]);

  return { isAuthenticated, refreshAuth };
}
