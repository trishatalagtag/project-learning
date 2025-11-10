import { TermsDialog } from "@/components/dialogs/terms-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAvatarUpload } from "@/hooks/use-avatar-upload"
import { authClient } from "@/lib/auth"
import { getAvatarUrl, getInitials } from "@/lib/avatar"
import type { Mode, Role } from "@/models/schema"
import { CameraIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "@tanstack/react-router"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { PasswordField } from "./password-field"

export type AuthSignUpValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export function AuthSignUpForm({
  role,
  onSuccess,
  onSwitchMode,
}: {
  role: Role
  onSuccess?: () => void
  onSwitchMode?: (mode: Mode) => void
}) {
  const [showTerms, setShowTerms] = useState(false)
  const { uploadAvatar, isUploading, previewUrl } = useAvatarUpload()
  const updateProfile = useMutation(api.shared.users.updateProfile)

  const navigate = useNavigate()

  const [avatarStorageId, setAvatarStorageId] = useState<Id<"_storage"> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AuthSignUpValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  const name = watch("name")
  const password = watch("password")
  const acceptTerms = watch("acceptTerms")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const storageId = await uploadAvatar(files[0])
      if (storageId) {
        setAvatarStorageId(storageId)
      }
    }
  }

  const onSubmit = async (data: AuthSignUpValues) => {
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/dashboard",
      })

      if (result.error) {
        toast.error("Sign Up Failed", {
          description: result.error.message || "Failed to create account",
        })
        return
      }

      if (avatarStorageId) {
        try {
          await updateProfile({
            image: avatarStorageId,
          })
        } catch (error) {
          console.error("Failed to update avatar:", error)
        }
      }

      toast.success("Account created!", {
        description: "Welcome to Coursera. Your account has been created successfully.",
      })

      onSuccess?.()
      navigate({ to: "/" })
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="size-20">
            <AvatarImage src={previewUrl || getAvatarUrl({ name })} alt="Profile picture" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <CameraIcon className="mr-2 size-4" />
            {isUploading ? "Uploading..." : previewUrl ? "Change Photo" : "Upload Photo"}
          </Button>
          <p className="text-muted-foreground text-xs">
            {previewUrl
              ? "Custom photo uploaded"
              : "Auto-generated avatar • Upload your own (optional)"}
          </p>
        </div>

        <Field data-invalid={!!errors.name}>
          <FieldContent>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              aria-invalid={!!errors.name}
              {...register("name", { required: "Name is required" })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </FieldContent>
        </Field>

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
              <FieldDescription>This will be your account email address.</FieldDescription>
            )}
          </FieldContent>
        </Field>

        <PasswordField
          id="password"
          label="Password"
          showStrength
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            validate: (value) => {
              const hasNumber = /[0-9]/.test(value)
              const hasLower = /[a-z]/.test(value)
              const hasUpper = /[A-Z]/.test(value)

              if (!hasNumber || !hasLower || !hasUpper) {
                return "Password must contain numbers and both uppercase and lowercase letters"
              }
              return true
            },
          })}
          value={password}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => {
              if (value !== password) {
                return "Passwords do not match"
              }
              return true
            },
          })}
        />

        <Field data-invalid={!!errors.acceptTerms}>
          <div className="flex items-start gap-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setValue("acceptTerms", checked === true)}
            />
            <div className="space-y-1 leading-none">
              <FieldLabel htmlFor="acceptTerms">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="font-medium text-primary underline hover:no-underline"
                >
                  Terms and Conditions
                </button>
              </FieldLabel>
              <FieldError>{errors.acceptTerms?.message}</FieldError>
            </div>
          </div>
        </Field>

        <input
          type="hidden"
          {...register("acceptTerms", {
            required: "You must accept the terms and conditions",
          })}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            type="button"
            onClick={() => onSwitchMode?.("signin")}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>

      <TermsDialog open={showTerms} onOpenChange={setShowTerms} />
    </>
  )
}
