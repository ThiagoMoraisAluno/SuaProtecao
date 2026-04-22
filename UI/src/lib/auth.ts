import { getCurrentUser, logout as storageLogout } from "@/lib/storage";
import type { UserRole } from "@/types";

export { getCurrentUser, logout } from "@/lib/storage";

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

export function requireAuth(navigate: (path: string) => void) {
  if (!isAuthenticated()) {
    navigate("/login");
    return false;
  }
  return true;
}
