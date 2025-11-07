import { _CustomErrorComponent } from "@/components/common/error"
import { NotFoundComponent } from "@/components/common/not-found"
import { NavbarProvider } from "@/components/ui/navbar"
import { Toast } from "@/components/ui/toast"
import type { AuthSession } from "@/lib/auth"
import { authenticateModes, platformRoles } from "@/models/schema"
import { GlobalModalsProvider } from "@/providers/global-modals"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

export const globalSearchSchema = z.object({
  authenticateMode: authenticateModes.optional(),
  role: platformRoles.optional(),
})

const RootLayout = () => (
  <>
    <NavbarProvider>
      <Outlet />
      <GlobalModalsProvider />
      <Toast />
    </NavbarProvider>
  </>
)

interface RootContext {
  auth: {
    session: AuthSession | null
    error: Error | null
    isPending: boolean
  }
}
export const Route = createRootRouteWithContext<RootContext>()({
  validateSearch: zodValidator(globalSearchSchema),
  component: RootLayout,
  errorComponent: _CustomErrorComponent,
  notFoundComponent: NotFoundComponent,
})
