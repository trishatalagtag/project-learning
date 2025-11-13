import { AuthSignInForm } from "@/components/form/auth-signin-form"
import { AuthSignUpForm } from "@/components/form/auth-signup-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuthParams } from "@/hooks/use-auth-params"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Mode, Role } from "@/lib/models/schema"
import { useCallback, useRef } from "react"
import { Drawer } from "vaul"

function getTitle(mode: Mode, role: Role) {
  const action = mode === "signin" ? "Sign In" : "Sign Up"
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase()
  return `${action} as ${roleLabel}`
}

function getDescription(mode: Mode) {
  return mode === "signin"
    ? "Welcome back. Access your account."
    : "Create an account to get started."
}

export function AuthDialog() {
  const { authenticateMode, role, closeModal, openModal } = useAuthParams()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Track last valid mode+role in a ref (handles modal transitions)
  const snapshot = useRef({ mode: authenticateMode, role })

  if (authenticateMode && role) {
    snapshot.current = { mode: authenticateMode as Mode, role: role as Role }
  }

  const { mode, role: snapshotRole } = snapshot.current
  const isOpen = Boolean(authenticateMode && role)

  const handleSuccess = useCallback(() => {
    // closeModal()
  }, [])

  const switchMode = useCallback(
    (newMode: Mode) => {
      openModal(newMode, snapshotRole)
    },
    [openModal, snapshotRole],
  )

  if (!mode || !snapshotRole) {
    return null
  }

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-md flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 space-y-1.5 border-border border-b px-6 pt-6 pb-4">
            <DialogTitle>{getTitle(mode, snapshotRole)}</DialogTitle>
            <DialogDescription>{getDescription(mode)}</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {mode === "signin" ? (
              <AuthSignInForm
                role={snapshotRole}
                onSuccess={handleSuccess}
                onSwitchMode={switchMode}
                open={isOpen}
              />
            ) : (
              <AuthSignUpForm
                role={snapshotRole}
                onSuccess={handleSuccess}
                onSwitchMode={switchMode}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      dismissible={true}
      modal={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 mt-24 flex max-h-[96vh] flex-col rounded-t-[10px] bg-background">
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />

          <div className="flex max-h-[96vh] flex-col">
            <div className="shrink-0 border-border border-b px-4 pt-3 pb-4">
              <Drawer.Title className="font-semibold text-lg">
                {getTitle(mode, snapshotRole)}
              </Drawer.Title>
              <Drawer.Description className="text-muted-foreground text-sm">
                {getDescription(mode)}
              </Drawer.Description>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
              {mode === "signin" ? (
                <AuthSignInForm
                  role={snapshotRole}
                  onSuccess={handleSuccess}
                  onSwitchMode={switchMode}
                  open={isOpen}
                />
              ) : (
                <AuthSignUpForm
                  role={snapshotRole}
                  onSuccess={handleSuccess}
                  onSwitchMode={switchMode}
                />
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}