import { ForgotPasswordDialog } from "@/components/dialogs/forgot-password-dialog"
import { Button } from "@/components/ui/button"
import { Description, FieldError, Fieldset, Label } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { authClient } from "@/lib/auth"
import type { Mode, Role } from "@/models/schema"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { Form } from "react-aria-components"
import { Controller, useForm } from "react-hook-form"
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
    control,
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
      <Form id="signin-form" className="grid" onSubmit={handleSubmit(onSubmit)}>
        <Fieldset>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <TextField isRequired>
                <Label>Email {role !== "LEARNER" ? `(${role.toLowerCase()})` : ""}</Label>
                <Input {...field} type="email" />
                <FieldError>{errors.email?.message}</FieldError>
                <Description>This is your account email address.</Description>
              </TextField>
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <TextField isRequired>
                <Label>Password</Label>
                <Input {...field} type="password" />
                <FieldError>{errors.password?.message}</FieldError>
              </TextField>
            )}
          />

          <div className="flex items-center justify-end">
            <Button
              intent="plain"
              size="sm"
              onPress={() => setShowForgotPassword(true)}
              className="min-h-0 border-0 p-0 text-xs hover:underline"
            >
              Forgot password?
            </Button>
          </div>

          <div data-slot="control">
            <Button type="submit" className={"w-full"} isPending={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-fg">Don't have an account? </span>
            <Button
              intent="plain"
              size="sm"
              onPress={() => onSwitchMode?.("signup")}
              className="min-h-0 border-0 p-0 font-medium text-fg hover:underline"
            >
              Sign up
            </Button>
          </div>
        </Fieldset>
      </Form>

      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        defaultEmail={getValues("email")}
      />
    </>
  )
}
