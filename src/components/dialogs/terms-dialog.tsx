import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TermsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h3 className="font-semibold text-base">1. Acceptance of Terms</h3>
            <p className="text-sm">
              By accessing and using this learning platform, you accept and agree to be bound by the
              terms and provision of this agreement.
            </p>

            <h3 className="mt-4 font-semibold text-base">2. Use License</h3>
            <p className="text-sm">
              Permission is granted to temporarily access the materials on Coursera's learning
              platform for personal, non-commercial transitory viewing only.
            </p>

            <h3 className="mt-4 font-semibold text-base">3. User Accounts</h3>
            <p className="text-sm">
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h3 className="mt-4 font-semibold text-base">4. Content Ownership</h3>
            <p className="text-sm">
              All course materials are the intellectual property of Coursera and its partners. You
              may not reproduce, distribute, or create derivative works without explicit permission.
            </p>

            <h3 className="mt-4 font-semibold text-base">5. Code of Conduct</h3>
            <p className="text-sm">
              Users must maintain professional and respectful behavior. Harassment, discrimination,
              or inappropriate content will not be tolerated and may result in account suspension.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>I Understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
