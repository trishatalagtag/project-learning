"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const COMMON_ISSUES = [
    "Grammar/spelling errors",
    "Content doesn't meet TESDA standards",
    "Missing required information",
    "Quality issues in materials",
    "Incorrect formatting",
    "Missing assessments or activities",
    "Content not aligned with learning objectives",
]

interface RequestChangesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contentId: string
    contentType: "module" | "lesson" | "quiz" | "assignment"
    contentTitle: string
}

export function RequestChangesDialog({
    open,
    onOpenChange,
    contentId,
    contentType,
    contentTitle,
}: RequestChangesDialogProps) {
    const requestChanges = useMutation(api.admin.content.requestChanges)
    const [selectedIssues, setSelectedIssues] = useState<string[]>([])
    const [feedback, setFeedback] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleToggleIssue = (issue: string) => {
        if (selectedIssues.includes(issue)) {
            setSelectedIssues(selectedIssues.filter((i) => i !== issue))
        } else {
            setSelectedIssues([...selectedIssues, issue])
        }
    }

    const handleSubmit = async () => {
        if (selectedIssues.length === 0 && !feedback.trim()) {
            toast.error("Please select at least one issue or provide feedback")
            return
        }

        setIsSubmitting(true)
        try {
            await requestChanges({
                contentType,
                contentId,
                issues: selectedIssues,
                feedback: feedback.trim(),
            })
            toast.success("Changes requested. Creator will be notified.")
            onOpenChange(false)
            setSelectedIssues([])
            setFeedback("")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to request changes")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        Request Changes
                    </DialogTitle>
                    <DialogDescription>
                        Request revisions for <strong>{contentTitle}</strong>. The creator will be notified
                        with your feedback.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Issues Checklist */}
                    <div className="space-y-3">
                        <Label className="text-base">Common Issues (select all that apply)</Label>
                        <div className="grid gap-2">
                            {COMMON_ISSUES.map((issue) => (
                                <div key={issue} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={issue}
                                        checked={selectedIssues.includes(issue)}
                                        onCheckedChange={() => handleToggleIssue(issue)}
                                    />
                                    <label
                                        htmlFor={issue}
                                        className="cursor-pointer font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {issue}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Feedback */}
                    <div className="space-y-2">
                        <Label htmlFor="feedback">Additional Feedback (optional)</Label>
                        <Textarea
                            id="feedback"
                            placeholder="Provide specific details about what needs to be changed..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={6}
                            disabled={isSubmitting}
                            className="resize-none"
                        />
                        <p className="text-muted-foreground text-xs">
                            Be specific to help the creator address the issues quickly
                        </p>
                    </div>

                    {/* Preview */}
                    {(selectedIssues.length > 0 || feedback.trim()) && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                            <p className="mb-2 font-medium text-sm">Preview of feedback to creator:</p>
                            {selectedIssues.length > 0 && (
                                <div className="mb-2">
                                    <p className="mb-1 text-xs">Issues to address:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedIssues.map((issue) => (
                                            <Badge key={issue} variant="outline" className="text-xs">
                                                {issue}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {feedback.trim() && (
                                <p className="text-sm italic">"{feedback.trim()}"</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (selectedIssues.length === 0 && !feedback.trim())}
                        className="bg-yellow-600 hover:bg-yellow-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
                                Request Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

