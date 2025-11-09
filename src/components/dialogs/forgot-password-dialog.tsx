import { ForgotPasswordForm } from "@/components/form/auth-forgot-password-form"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"

interface ForgotPasswordDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultEmail?: string
}

export function ForgotPasswordDialog({
  isOpen,
  onOpenChange,
  defaultEmail,
}: ForgotPasswordDialogProps) {
  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Reset Password</ModalTitle>
          <ModalDescription>
            Enter your email address and we'll send you a link to reset your password.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <ForgotPasswordForm defaultEmail={defaultEmail} onSuccess={() => onOpenChange(false)} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
