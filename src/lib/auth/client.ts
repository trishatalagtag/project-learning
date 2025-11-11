import type { ParsedLocation } from "@tanstack/react-router"
import { redirect } from "@tanstack/react-router"
import { type AuthSession, isValidRole, type UserRole } from "./guards"

export function requireAuth(
  session: AuthSession | null | undefined,
  _location: ParsedLocation,
  isPending?: boolean,
): asserts session is AuthSession & { user: { role: UserRole } } {
  if (isPending) {
    return
  }

  if (!session?.user) {
    throw redirect({
      to: "/",
      search: {
        authenticateMode: "signin",
        role: "LEARNER",
      },
    })
  }
}

export function requireRole(
  session: AuthSession | null | undefined,
  allowedRoles: UserRole | UserRole[],
  isPending?: boolean,
): asserts session is AuthSession & { user: { role: UserRole } } {
  if (isPending) {
    return
  }

  const userRole = session?.user?.role

  const isValid = isValidRole(userRole)

  if (!isValid) {
    throw redirect({
      to: "/",
      search: {
        authenticateMode: "signin",
        role: "LEARNER",
      },
    })
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  const roleIncluded = roles.includes(userRole)

  if (!roleIncluded) {
    throw redirect({
      to: "/",
      search: {
        authenticateMode: "signin",
        role: "LEARNER",
      },
    })
  }
}
