import { ForgotPasswordDialog } from "@/components/dialogs/forgot-password-dialog"
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
import type { Mode, Role } from "@/models/schema"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export type AuthSignInValues = {
  email: string
  password: string
}

interface AuthSignInFormProps {
  role: Role
  onSuccess?: () => void
  onSwitchMode?: (mode: Mode) => void
  open?: boolean
}

export function AuthSignInForm({ role, onSuccess, onSwitchMode, open }: AuthSignInFormProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    reset,
  } = useForm<AuthSignInValues>()

  const wasOpen = useRef<boolean | undefined>(open)

  useEffect(() => {
    if (wasOpen.current && open === false) {
      reset()
    }
    wasOpen.current = open
  }, [open, reset])

  const onSubmit = async (data: AuthSignInValues) => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error("Sign In Failed", {
          description: result.error.message || "Invalid email or password",
        })
        return
      }

      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      })

      onSuccess?.()
      navigate({ to: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field data-invalid={!!errors.email}>
          <FieldContent>
            <FieldLabel htmlFor="email">
              Email {role !== "LEARNER" ? `(${role.toLowerCase()})` : ""}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email ? (
              <FieldError>{errors.email.message}</FieldError>
            ) : (
              <FieldDescription>This is your account email address.</FieldDescription>
            )}
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldContent>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              aria-invalid={!!errors.password}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </FieldContent>
        </Field>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <button
            type="button"
            onClick={() => onSwitchMode?.("signup")}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
      </form>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        defaultEmail={getValues("email")}
      />
    </>
  )
}
