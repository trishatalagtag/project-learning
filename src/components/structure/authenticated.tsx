import {
  Navbar,
  NavbarInset,
  NavbarProvider,
  NavbarSection,
  NavbarStart,
} from "@/components/ui/navbar"
import { UserMenu } from "@/components/user-menu"
import { authClient } from "@/lib/auth"
import { Link, Outlet } from "@tanstack/react-router"

export function AuthenticatedLayout() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return null
  }

  return (
    <NavbarProvider>
      <Navbar isSticky placement="top">
        <NavbarSection>
          <NavbarStart>
            <Link to="/" className="font-bold text-lg">
              Coursera
            </Link>
          </NavbarStart>
        </NavbarSection>
        <NavbarSection>
          <UserMenu />
        </NavbarSection>
      </Navbar>
      <NavbarInset>
        <Outlet />
      </NavbarInset>
    </NavbarProvider>
  )
}
