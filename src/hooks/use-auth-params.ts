import { authenticateModes, platformRoles } from "@/models/schema"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { z } from "zod"

const searchSchema = z.object({
  authenticateMode: authenticateModes.optional(),
  role: platformRoles.optional(),
})

type Search = z.infer<typeof searchSchema>

export function useAuthParams() {
  const { authenticateMode, role } = useSearch({ strict: false }) as Search
  const navigate = useNavigate()

  const openModal = (mode: Search["authenticateMode"], modalRole?: Search["role"]) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        authenticateMode: mode,
        role: modalRole,
      }),
    })
  }

  const closeModal = () => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        authenticateMode: undefined,
        role: undefined,
      }),
      replace: true,
    })
  }

  return {
    authenticateMode,
    role,
    openModal,
    closeModal,
  }
}
