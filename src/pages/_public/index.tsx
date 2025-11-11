import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api } from "@/convex/_generated/api"
import { useAuthParams } from "@/hooks/use-auth-params"
import { AcademicCapIcon, BookOpenIcon, RocketLaunchIcon, UserPlusIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useRef } from "react"
import { z } from "zod"

const courseSearchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(9),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  enrollmentOpen: z.boolean().optional(),
})

export const Route = createFileRoute("/_public/")({
  validateSearch: courseSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { openModal } = useAuthParams()
  const coursesRef = useRef<HTMLElement>(null)

  const recentCourses = useQuery(api.learner.courses.getRecentlyAddedCourses, { limit: 3 })

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="mx-auto w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-agriculture.jpg"
            alt=""
            aria-hidden="true"
            className="size-full object-cover object-center brightness-[0.4] dark:brightness-[0.6]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30 dark:from-primary/60 dark:via-primary/40 dark:to-primary/20" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-20 sm:py-24 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <img
                src="/disoa.png"
                alt="DISOA Logo"
                className="size-16 shadow-primary/50 drop-shadow-sm sm:size-20 md:size-24"
              />
            </div>

            {/* Heading */}
            <h1 className="mb-6 font-bold text-4xl text-primary-foreground tracking-tight sm:text-5xl md:text-6xl lg:text-7xl dark:text-white dark:drop-shadow-md">
              Empowering Future Organic Agriculturists
            </h1>

            {/* Subtitle */}
            <p className="mb-4 text-primary-foreground/90 text-xl sm:text-2xl dark:text-white/90 dark:drop-shadow-md">
              Dumingag Institute of Sustainable Organic Agriculture
            </p>

            {/* Description */}
            <p className="mb-8 max-w-2xl text-balance text-base text-primary-foreground/95 leading-relaxed sm:text-lg md:mb-10 dark:text-white/95 dark:drop-shadow-md">
              Accessible agricultural education for Filipino farmers and communities through digital learning.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to="/courses">
                <Button size="lg" className="w-full bg-primary-foreground text-primary shadow-lg hover:bg-primary-foreground/90 sm:w-auto">
                  <BookOpenIcon className="mr-2 size-5" />
                  Browse Courses
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openModal("signup", "LEARNER")}
                className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto dark:text-white"
              >
                <UserPlusIcon className="mr-2 size-5" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <h2 className="mb-8 text-center font-bold text-2xl sm:text-3xl">How to Get Started</h2>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-4 flex size-16 items-center justify-center rounded-lg bg-primary/10">
                <UserPlusIcon className="size-8 text-primary" />
              </div>
              <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Register for free using your email. No payment or enrollment fees required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex size-16 items-center justify-center rounded-lg bg-primary/10">
                <BookOpenIcon className="size-8 text-primary" />
              </div>
              <CardTitle>Choose a Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse our agricultural programs and enroll in courses that match your goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex size-16 items-center justify-center rounded-lg bg-primary/10">
                <RocketLaunchIcon className="size-8 text-primary" />
              </div>
              <CardTitle>Start Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete lessons, pass assessments, and gain practical agricultural knowledge.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Featured Courses - Recently Added */}
      {recentCourses && recentCourses.length > 0 && (
        <>
          <section className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-bold text-2xl sm:text-3xl">Recently Added Courses</h2>
              <Button variant="ghost" onClick={scrollToCourses}>
                View All →
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentCourses.map((course) => (
                <Card key={course._id} className="flex h-full flex-col transition-shadow hover:shadow-md">
                  {/* Cover Image */}
                  {course.coverImageUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={course.coverImageUrl}
                        alt={course.title}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-t-lg bg-muted">
                      <AcademicCapIcon className="size-16 text-muted-foreground" />
                    </div>
                  )}

                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {course.categoryName}
                      </Badge>
                      {course.isNew && (
                        <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                      )}
                      {course.isEnrollmentOpen && (
                        <Badge className="bg-green-600 text-white text-xs">Open</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                    {course.description && (
                      <CardDescription className="line-clamp-2 text-sm">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="mt-auto">
                    {course.teacherName && (
                      <p className="mb-3 text-muted-foreground text-sm">
                        Instructor: {course.teacherName}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        Added {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      <Link to="/courses/$courseId" params={{ courseId: course._id }}>
                        <Button size="sm">View Course</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          <Separator />
        </>
      )}

      <Separator />

      {/* About DISOA Section */}
      <section id="about" className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="mb-6 flex justify-center">
            <img src="/disoa.png" alt="DISOA Logo" className="size-24 sm:size-32" />
          </div>
          <h2 className="mb-4 font-bold text-2xl sm:text-3xl">About DISOA</h2>
          <p className="mx-auto mb-6 max-w-3xl text-muted-foreground leading-relaxed">
            The Dumingag Institute of Sustainable Organic Agriculture (DISOA) is committed to
            providing accessible agricultural education to Filipino farmers and communities. This
            learning management system was created to digitize agricultural training, making quality
            education available to everyone, regardless of location. Our courses focus on sustainable
            practices, organic farming, and community-driven learning.
          </p>
          <Link to="/about">
            <Button variant="outline">Learn More About DISOA →</Button>
          </Link>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="container mx-auto max-w-5xl px-4 py-12 text-center sm:py-16">
        <h2 className="mb-4 font-bold text-2xl sm:text-3xl">Ready to Start Learning?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          Join Filipino farmers and agricultural professionals advancing their skills through free,
          accessible courses.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => openModal("signup", "LEARNER")}>
            Create Free Account
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToCourses}>
            Browse Courses
          </Button>
        </div>
      </section>
    </div>
  )
}