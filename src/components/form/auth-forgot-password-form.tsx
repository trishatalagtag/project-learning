import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type ForgotPasswordValues = {
  email: string
}

interface ForgotPasswordFormProps {
  defaultEmail?: string
  onSuccess?: () => void
}

export function ForgotPasswordForm({ defaultEmail, onSuccess }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: defaultEmail || "",
    },
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      const result = await authClient.forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      })

      if (result.error) {
        toast.error("Failed to send reset email", {
          description: result.error.message || "Please try again later",
        })
        return
      }

      toast.success("Reset link sent!", {
        description: "Check your email for password reset instructions.",
        duration: 5000,
      })

      setTimeout(() => onSuccess?.(), 2000)
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="size-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Check your email</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            We've sent a password reset link to your email address.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field data-invalid={!!errors.email}>
        <FieldContent>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Please enter a valid email address",
              },
            })}
          />
          {errors.email ? (
            <FieldError>{errors.email.message}</FieldError>
          ) : (
            <FieldDescription>
              Enter the email address associated with your account
            </FieldDescription>
          )}
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending link..." : "Send Reset Link"}
      </Button>
    </form>
  )
}
