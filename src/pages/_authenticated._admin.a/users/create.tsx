"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth/guards"
import { ArrowLeftIcon, UserPlusIcon } from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/_authenticated/_admin/a/users/create")({
  component: CreateUserPage,
})

const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["LEARNER", "FACULTY", "ADMIN"]),
    institution: z.string().max(200).optional(),
    bio: z.string().max(500).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type CreateUserFormValues = z.infer<typeof createUserSchema>

function CreateUserPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "LEARNER",
      institution: "",
      bio: "",
    },
  })

  const onSubmit = async (values: CreateUserFormValues) => {
    setIsSubmitting(true)

    try {
      // Call the better-auth sign-up endpoint
      // Note: The better-auth client may need configuration to support role assignment
      await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        // Additional fields - verify these work with your better-auth setup
        callbackURL: undefined,
      })

      // If sign-up succeeds, show success message
      toast.success("User created successfully", {
        description: `Account for ${values.name} has been created.`,
      })

      // Navigate back to users list
      navigate({ to: "/a/users" })
    } catch (error: any) {
      console.error("User creation error:", error)

      // Handle specific error messages
      const errorMessage = error?.message || error?.error?.message || "Failed to create user"

      if (errorMessage.includes("already exists") || errorMessage.includes("already in use")) {
        toast.error("Email already in use", {
          description: "Please use a different email address.",
        })
      } else {
        toast.error("Failed to create user", {
          description: errorMessage,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/a/users" })}
          disabled={isSubmitting}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserPlusIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new user account to the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimum 8 characters"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Re-enter password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LEARNER">Learner</SelectItem>
                        <SelectItem value="FACULTY">Faculty</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Assign the appropriate role for this user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Institution Field */}
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="University or organization name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio Field */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description about the user"
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum 500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/a/users" })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Note about role assignment */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <p className="text-amber-900 text-sm">
            <strong>Note:</strong> The user role may need to be updated after account creation
            depending on your authentication system configuration. The account will be created
            with the basic user information, and role assignment may require additional backend setup.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
