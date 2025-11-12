import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AcademicCapIcon,
  GlobeAltIcon,
  UsersIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid"

export const Route = createFileRoute("/_public/about")({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="mx-auto w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* Background Cover Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/about-hero.png"
            alt="DISOA About"
            className="size-full object-cover object-center brightness-[0.4] dark:brightness-[0.6]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30 dark:from-primary/60 dark:via-primary/40 dark:to-primary/20" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20 sm:py-24 md:py-28 lg:py-36">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <img
                src="/disoa.png"
                alt="DISOA Logo"
                className="size-24 shadow-primary/50 drop-shadow-sm sm:size-32"
              />
            </div>
            <h1 className="mb-4 font-bold text-3xl text-primary-foreground tracking-tight sm:text-4xl md:text-5xl dark:text-white dark:drop-shadow-md">
              About DISOA
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-primary-foreground/90 dark:text-white/90 dark:drop-shadow-md">
              Dumingag Institute of Sustainable Organic Agriculture
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Mission & Vision */}
      <section className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AcademicCapIcon className="size-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To provide accessible, high-quality agricultural education to Filipino farmers and
                communities through sustainable practices and organic farming methods. We empower
                learners with practical knowledge that promotes food security, environmental
                stewardship, and community resilience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeAltIcon className="size-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To be a leading institution in sustainable organic agriculture education,
                transforming communities through knowledge-sharing and innovative farming practices.
                We envision a future where every Filipino farmer has access to quality training
                and resources for sustainable livelihoods.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Why We Built This LMS */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-8 text-center">
            <ComputerDesktopIcon className="mx-auto mb-4 size-16 text-primary" />
            <h2 className="mb-4 font-bold text-2xl sm:text-3xl">
              Digitizing Agricultural Education
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground leading-relaxed">
              This Learning Management System was created to break down barriers to agricultural
              education in the Philippines.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-3 font-semibold text-lg">Accessibility</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Traditional agricultural training often requires physical presence, creating
                challenges for farmers in remote areas. Our digital platform makes quality
                education accessible to anyone with an internet connection, regardless of
                location.
              </p>
            </div>

            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-3 font-semibold text-lg">Self-Paced Learning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Farmers can learn at their own pace, fitting education around their farming
                schedules and responsibilities. Content remains available 24/7, allowing learners
                to revisit materials as needed.
              </p>
            </div>

            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-3 font-semibold text-lg">Cost-Effective</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                By digitizing our training programs, we eliminate travel costs, accommodation
                expenses, and time away from farms. Education is completely free, removing
                financial barriers to learning.
              </p>
            </div>

            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-3 font-semibold text-lg">Scalable Impact</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Digital delivery allows us to reach thousands of learners simultaneously,
                multiplying our impact beyond what traditional classroom settings could achieve.
                Knowledge spreads faster and further.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Core Values */}
      <section className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-8 text-center font-bold text-2xl sm:text-3xl">Our Core Values</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10">
                <UsersIcon className="size-8 text-primary" />
              </div>
            </div>
            <h3 className="mb-2 font-semibold">Community-Driven</h3>
            <p className="text-muted-foreground text-sm">
              We believe in the power of shared knowledge and collaborative learning within
              agricultural communities.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10">
                <GlobeAltIcon className="size-8 text-primary" />
              </div>
            </div>
            <h3 className="mb-2 font-semibold">Sustainability</h3>
            <p className="text-muted-foreground text-sm">
              Environmental stewardship and sustainable practices are at the heart of everything
              we teach.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10">
                <AcademicCapIcon className="size-8 text-primary" />
              </div>
            </div>
            <h3 className="mb-2 font-semibold">Excellence</h3>
            <p className="text-muted-foreground text-sm">
              We are committed to providing high-quality, practical education that creates real
              impact.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="container mx-auto max-w-5xl px-4 py-12 text-center sm:py-16">
        <h2 className="mb-4 font-bold text-2xl sm:text-3xl">Join Our Community</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          Whether you're a farmer, agricultural professional, or simply interested in sustainable
          agriculture, we invite you to explore our courses and join our growing community.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/c/courses">
            <Button size="lg">Browse Courses</Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}