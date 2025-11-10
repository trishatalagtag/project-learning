import { useRouteContext } from "@tanstack/react-router";
import type { UserRole } from "./permissions";

export function useUserRole(): UserRole | null {
  const { auth } = useRouteContext({ strict: false });
  return (auth?.session?.user?.role as UserRole) || null;
}

export function useUserId(): string | null {
  const { auth } = useRouteContext({ strict: false });
  return auth?.session?.user?.userId || null;
}

