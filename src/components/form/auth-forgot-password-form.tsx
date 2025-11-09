import { Button } from "@/components/ui/button"
import { Description, FieldError, Fieldset, Label } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { authClient } from "@/lib/auth"
import { Form } from "react-aria-components"
import { Controller, useForm } from "react-hook-form"
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
    control,
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
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10">
          <svg
            className="size-6 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Check your email</h3>
          <p className="mt-2 text-muted-fg text-sm">
            We've sent a password reset link to your email address.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Fieldset>
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Please enter a valid email address",
            },
          }}
          render={({ field: { ref, ...field } }) => (
            <TextField isRequired isInvalid={!!errors.email}>
              <Label>Email</Label>
              <Input {...field} type="email" placeholder="you@example.com" />
              {errors.email ? (
                <FieldError>{errors.email.message}</FieldError>
              ) : (
                <Description>Enter the email address associated with your account</Description>
              )}
            </TextField>
          )}
        />

        <div data-slot="control">
          <Button type="submit" className="w-full" isPending={isSubmitting}>
            {isSubmitting ? "Sending link..." : "Send Reset Link"}
          </Button>
        </div>
      </Fieldset>
    </Form>
  )
}
