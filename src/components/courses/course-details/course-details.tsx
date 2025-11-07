import type { api } from "api"

import type { FunctionReturnType } from "convex/server"
import { createContext, type ReactNode, useContext } from "react"

type Course = FunctionReturnType<typeof api.learner.courses.getCourseDetails>

interface CourseDetailsContextValue {
  course: Course | null | undefined
  isLoading: boolean
}

const CourseDetailsContext = createContext<CourseDetailsContextValue | null>(null)

export function useCourseDetails() {
  const context = useContext(CourseDetailsContext)
  if (!context) {
    throw new Error("CourseDetails components must be wrapped in <CourseDetails />")
  }
  return context
}

interface CourseDetailsProps {
  children: ReactNode
  course: Course | null | undefined
  isLoading?: boolean
}

export function CourseDetails({ children, course, isLoading = false }: CourseDetailsProps) {
  return (
    <CourseDetailsContext.Provider
      value={{
        course,
        isLoading,
      }}
    >
      {children}
    </CourseDetailsContext.Provider>
  )
}
