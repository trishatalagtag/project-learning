import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const ROLE = {
  ADMIN: "ADMIN",
  LEARNER: "LEARNER",
  FACULTY: "FACULTY",
} as const

export type UserRole = (typeof ROLE)[keyof typeof ROLE]

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL || "http://localhost:5173",
  plugins: [
    convexClient(),
    crossDomainClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
        image: {
          type: "string",
          required: false,
        },
        institution: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
})

export type AuthSession = typeof authClient.$Infer.Session

export function isValidRole(role: string | null | undefined): role is UserRole {
  if (!role) return false
  return Object.values(ROLE).includes(role as UserRole)
}
