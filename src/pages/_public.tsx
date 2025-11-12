import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Navbar, NavbarLeft, NavbarRight } from "@/components/ui/navbar"
import { Separator } from "@/components/ui/separator"
import { useAuthParams } from "@/hooks/use-auth-params"
import { authClient, getDashboardUrlByRole } from "@/lib/auth/guards"
import { Bars3Icon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Drawer } from "vaul"

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
})

function PublicLayout() {
  const { openModal } = useAuthParams()
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: "/" })
  }

  const getDashboardUrl = () => {
    if (!session?.user) return "/" as const
    return getDashboardUrlByRole(session.user.role)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4">
          <Navbar>
            <NavbarLeft>
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <img src="/disoa.png" alt="DISOA" className="size-8" />
                <span className="hidden font-semibold text-lg sm:inline">DISOA</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="ml-8 hidden items-center gap-6 md:flex">
                <Link
                  to="/"
                  className="text-sm transition-colors hover:text-foreground/80 [&.active]:text-foreground"
                >
                  Home
                </Link>
                <Link
                  to="/courses"
                  className="text-sm transition-colors hover:text-foreground/80"
                >
                  Courses
                </Link>
                <Link
                  to="/about"
                  className="text-sm transition-colors hover:text-foreground/80 [&.active]:text-foreground"
                >
                  About
                </Link>
                <Link
                  to="/faq"
                  className="text-sm transition-colors hover:text-foreground/80 [&.active]:text-foreground"
                >
                  FAQ
                </Link>
              </nav>
            </NavbarLeft>

            <NavbarRight>
              {session ? (
                <>
                  {/* Dashboard Button */}
                  <Link to={getDashboardUrl()} className="hidden md:inline-flex">
                    <Button>Dashboard</Button>
                  </Link>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden md:flex">
                        <UserCircleIcon className="size-6" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {session.user.role === "LEARNER" && (
                        <DropdownMenuItem asChild>
                          <Link to="/c/courses">My Courses</Link>
                        </DropdownMenuItem>
                      )}
                      {session.user.role === "ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link to="/a">Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                      {session.user.role === "FACULTY" && (
                        <DropdownMenuItem asChild>
                          <Link to="/a">Faculty Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Sign In Link - Desktop */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => openModal("signin", "LEARNER")}
                    className="hidden text-sm md:inline-flex"
                  >
                    Sign In
                  </Button>

                  {/* Get Started Button - Desktop */}
                  <Button onClick={() => openModal("signup", "LEARNER")} className="hidden md:inline-flex">
                    Get Started
                  </Button>
                </>
              )}

              {/* Mobile Menu Trigger */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden"
                aria-label="Open menu"
              >
                <Bars3Icon className="size-6" />
              </Button>
            </NavbarRight>
          </Navbar>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <Drawer.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content
            className="fixed right-0 bottom-0 left-0 z-50 flex h-[96%] flex-col rounded-t-[10px] bg-background"
            style={{
              backfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {/* Drawer Handle */}
            <div className="mx-auto mt-4 mb-6 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b px-6 pb-4">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-lg"
                onClick={closeMobileMenu}
              >
                <img src="/disoa.png" alt="DISOA" className="size-8" />
                <span>DISOA</span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <XMarkIcon className="size-5" />
              </Button>
            </div>

            {/* Drawer Content */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-6">
              {session ? (
                <>
                  <Link
                    to="/"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <Link
                    to="/courses"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    Browse Courses
                  </Link>
                  <Link
                    to={getDashboardUrl()}
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/about"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                  <Link
                    to="/faq"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    FAQ
                  </Link>

                  <Separator className="my-4" />

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      handleSignOut()
                      closeMobileMenu()
                    }}
                    className="justify-start rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <Link
                    to="/courses"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    Courses
                  </Link>
                  <Link
                    to="/about"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                  <Link
                    to="/faq"
                    className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={closeMobileMenu}
                  >
                    FAQ
                  </Link>

                  <Separator className="my-4" />

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      openModal("signin", "LEARNER")
                      closeMobileMenu()
                    }}
                    className="justify-start rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      openModal("signup", "LEARNER")
                      closeMobileMenu()
                    }}
                    className="mx-4 mt-2"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </nav>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* About */}
            <div>
              <h3 className="mb-4 font-semibold">About DISOA</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link to="/about" className="hover:underline">
                    Mission & Vision
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Learners */}
            <div>
              <h3 className="mb-4 font-semibold">For Learners</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link to="/courses" className="hover:underline">
                    Browse Courses
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:underline">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => openModal("signup", "LEARNER")}
                    className="h-auto p-0 text-muted-foreground text-sm hover:underline"
                  >
                    Create Account
                  </Button>
                </li>
              </ul>
            </div>

            {/* For Staff */}
            <div>
              <h3 className="mb-4 font-semibold">For Staff</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link to="/staff/login" className="hover:underline">
                    Staff Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 font-semibold">Contact</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link to="/contact" className="hover:underline">
                    Visit Us
                  </Link>
                </li>
                <li>
                  <a
                    href="https://facebook.com/disoa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <img src="/disoa.png" alt="DISOA" className="size-6" />
              <span className="text-sm">DISOA</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Dumingag Institute of Sustainable Organic Agriculture
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}