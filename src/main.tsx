import { type AuthSession, authClient } from "@/lib/auth"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { ConvexReactClient } from "convex/react"
import { NuqsAdapter } from "nuqs/adapters/react"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { routeTree } from "./routes"

export const router = createRouter({
  routeTree,
  context: { auth: { session: null as AuthSession | null, error: null, isPending: false } },
})

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!

function InnerApp() {
  const { data: session, error, isPending } = authClient.useSession()
  return (
    <StrictMode>
      <NuqsAdapter>
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          <RouterProvider router={router} context={{ auth: { session, error, isPending } }} />
        </ConvexBetterAuthProvider>
      </NuqsAdapter>
    </StrictMode>
  )
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<InnerApp />)
}
