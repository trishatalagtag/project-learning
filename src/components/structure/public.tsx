import { Button, buttonStyles } from "@/components/ui/button"
import {
  Navbar,
  NavbarMobile,
  NavbarProvider,
  NavbarSection,
  NavbarSpacer,
  NavbarStart,
} from "@/components/ui/navbar"
import { useAuthParams } from "@/hooks/use-auth-params"
import { authClient } from "@/lib/auth"
import { Link } from "@tanstack/react-router"
import { Skeleton } from "../ui/skeleton"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { openModal } = useAuthParams()
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="min-h-screen">
      <NavbarProvider>
        {/* Desktop */}
        <Navbar>
          <NavbarStart>
            <Link to="/" className="font-bold text-xl">
              Coursera
            </Link>
          </NavbarStart>
          <NavbarSpacer />
          <NavbarSection>
            {isPending ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            ) : session?.user ? (
              <Link to="/learn" className={buttonStyles({ intent: "primary" })}>
                Dashboard
              </Link>
            ) : (
              <>
                <Button intent="plain" onClick={() => openModal("signin", "LEARNER")}>
                  Login
                </Button>
                <Button onClick={() => openModal("signup", "LEARNER")}>Join</Button>
              </>
            )}
          </NavbarSection>
        </Navbar>

        {/* Mobile */}
        <NavbarMobile>
          <Link to="/" className="font-bold text-lg">
            Coursera
          </Link>
          <NavbarSpacer />
          {isPending ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : session?.user ? (
            <Link to="/learn" className={buttonStyles({ intent: "primary", size: "sm" })}>
              Dashboard
            </Link>
          ) : (
            <>
              <Button intent="plain" size="sm" onClick={() => openModal("signin", "LEARNER")}>
                Login
              </Button>
              <Button size="sm" onClick={() => openModal("signup", "LEARNER")}>
                Join
              </Button>
            </>
          )}
        </NavbarMobile>
      </NavbarProvider>
      <main className="container mx-auto">{children}</main>
    </div>
  )
}
