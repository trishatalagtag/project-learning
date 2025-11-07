import { buttonStyles } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Note } from "@/components/ui/note"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"

export function CourseDetailsNotFound() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md text-center">
        <Note intent="default" className="mb-6">
          <strong>Course not found</strong>
          <p className="mt-1 text-sm">
            The course you're looking for doesn't exist or is no longer available.
          </p>
        </Note>
        <Link to="/" className={cn(buttonStyles({ intent: "outline" }), "inline-flex")}>
          Back to Courses
        </Link>
      </div>
    </Container>
  )
}
