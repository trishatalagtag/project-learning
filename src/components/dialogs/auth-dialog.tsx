import { AuthSignInForm } from "@/components/form/auth-signin-form"
import { AuthSignUpForm } from "@/components/form/auth-signup-form"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import { useAuthParams } from "@/hooks/use-auth-params"
import type { Mode, Role } from "@/models/schema"
import { useCallback, useRef } from "react"

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

  // i have to track of last valid mode+role in a ref (handles modal transitions)
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

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{getTitle(mode, snapshotRole)}</ModalTitle>
          <ModalDescription>{getDescription(mode)}</ModalDescription>
        </ModalHeader>

        <ModalBody>
          {mode === "signin" ? (
            <AuthSignInForm
              role={snapshotRole}
              onSuccess={handleSuccess}
              onSwitchMode={switchMode}
            />
          ) : (
            <AuthSignUpForm
              role={snapshotRole}
              onSuccess={handleSuccess}
              onSwitchMode={switchMode}
            />
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
