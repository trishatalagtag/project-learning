import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getDashboardUrlByRole } from "@/lib/auth/guards"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/staff/login")({
  beforeLoad: ({ context: { auth } }) => {
    const { session, isPending } = auth

    if (isPending) {
      return
    }

    if (session?.user) {
      const dashboardUrl = getDashboardUrlByRole(session.user.role)
      throw redirect({
        to: dashboardUrl,
      })
    }
  },
  component: StaffLoginPage,
})

function StaffLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 self-center font-medium">
          <img src="/disoa.png" alt="DISOA" className="size-10" />
          <span className="text-lg">DISOA Staff Portal</span>
        </Link>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Staff Sign In</CardTitle>
            <CardDescription>
              For administrators and instructors only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@disoa.edu.ph"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </Field>
                <Field>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                  <FieldDescription className="text-center">
                    For learners,{" "}
                    <Link to="/" className="text-primary hover:underline">
                      go to the main site
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <FieldDescription className="px-6 text-center">
          This portal is for DISOA staff members only. Unauthorized access is prohibited.
        </FieldDescription>
      </div>
    </div>
  )
}