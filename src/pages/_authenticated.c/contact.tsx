import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useMutationWithToast } from "@/hooks/use-mutation-with-toast"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { EnvelopeIcon, LifebuoyIcon } from "@heroicons/react/24/solid"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_authenticated/c/contact")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
    },
    component: ContactPage,
})

function ContactPage() {
    const [subject, setSubject] = useState("")
    const [category, setCategory] = useState<string>("")
    const [message, setMessage] = useState("")

    const submitFeedback = useMutationWithToast(api.learner.feedback.submitLearnerFeedback, {
        successMessage: "Message sent successfully! We'll get back to you soon.",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Submit feedback using the correct API format
        await submitFeedback.execute({
            targetType: "course", // Default to course for general feedback
            targetId: "", // Empty for general feedback
            feedbackType: category as "broken_link" | "incorrect_info" | "not_loading" | "suggestion" | "other",
            message: `${subject}\n\n${message}`,
        })

        // Reset form
        setSubject("")
        setCategory("")
        setMessage("")
    }

    const isValid = subject.trim() && category && message.trim()

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto max-w-3xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <LifebuoyIcon className="size-8 text-primary" />
                    </div>
                    <h1 className="mb-2 font-bold text-3xl">Contact Support</h1>
                    <p className="text-muted-foreground">
                        Have questions or need help? We're here to assist you.
                    </p>
                </div>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send us a message</CardTitle>
                        <CardDescription>
                            Fill out the form below and we'll respond as soon as possible
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                        <SelectItem value="content">Content Question</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Provide details about your question or issue..."
                                    rows={8}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={!isValid} className="w-full">
                                <EnvelopeIcon className="mr-2 size-4" />
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base">Response Time</CardTitle>
                            <CardDescription className="text-sm">
                                We typically respond within 24-48 hours during business days
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base">View Your Feedback</CardTitle>
                            <CardDescription className="text-sm">
                                Check your submitted feedback and our responses in your feedback history
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}
