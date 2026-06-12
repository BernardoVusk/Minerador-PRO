import { useState, useEffect } from "react";

const AUTH_KEY = "vusk_auth";
const AUTH_VALUE = btoa("vusk10");

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY);
      setIsAuthenticated(stored === AUTH_VALUE);
    } catch (e) {
      console.error("Session storage access error on mount:", e);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const authenticate = () => {
    try {
      sessionStorage.setItem(AUTH_KEY, AUTH_VALUE);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Session storage save error:", e);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Session storage clearance error during logout:", e);
    }
  };

  return { isAuthenticated, isChecking, authenticate, logout };
}
