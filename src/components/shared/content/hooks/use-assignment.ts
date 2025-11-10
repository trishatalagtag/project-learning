import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"

export function useAssignment(assignmentId: Id<"assignments">) {
  const assignment = useQuery(
    api.faculty.assignments.getAssignmentById,
    assignmentId ? { assignmentId } : "skip",
  )

  return {
    assignment,
    isLoading: assignment === undefined,
    isNotFound: assignment === null,
  } as const
}
