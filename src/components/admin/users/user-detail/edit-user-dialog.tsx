"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { PencilIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import type { User } from "../columns"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    institution: z.string().optional(),
    bio: z.string().optional(),
})

interface EditUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
    const updateUserProfile = useMutation(api.admin.users.updateUserProfile)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            institution: user.institution || "",
            bio: user.bio || "",
        },
    })

    // Reset form when user changes
    useEffect(() => {
        reset({
            name: user.name,
            email: user.email,
            institution: user.institution || "",
            bio: user.bio || "",
        })
    }, [user, reset])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            await updateUserProfile({
                authUserId: user._id,
                name: values.name,
                email: values.email,
                institution: values.institution || undefined,
                bio: values.bio || undefined,
            })
            toast.success("User profile updated successfully")
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update user:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update user profile")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PencilIcon className="h-5 w-5 text-primary" />
                        Edit User Profile
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!errors.name}>
                            <FieldLabel htmlFor="name">Full Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                aria-invalid={!!errors.name}
                                {...register("name")}
                            />
                            <FieldDescription>User's display name</FieldDescription>
                            <FieldError>{errors.name?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.email}>
                            <FieldLabel htmlFor="email">Email Address</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                aria-invalid={!!errors.email}
                                {...register("email")}
                            />
                            <FieldDescription>Must be unique across all users</FieldDescription>
                            <FieldError>{errors.email?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.institution}>
                            <FieldLabel htmlFor="institution">Institution (Optional)</FieldLabel>
                            <Input
                                id="institution"
                                placeholder="e.g., University of Sample"
                                aria-invalid={!!errors.institution}
                                {...register("institution")}
                            />
                            <FieldDescription>Organization or school affiliation</FieldDescription>
                            <FieldError>{errors.institution?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.bio}>
                            <FieldLabel htmlFor="bio">Bio (Optional)</FieldLabel>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about yourself..."
                                rows={4}
                                aria-invalid={!!errors.bio}
                                {...register("bio")}
                            />
                            <FieldDescription>Brief description about the user</FieldDescription>
                            <FieldError>{errors.bio?.message}</FieldError>
                        </Field>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <PencilIcon className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}
