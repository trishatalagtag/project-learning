import { TermsDialog } from "@/components/dialogs/terms-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Description, FieldError, Fieldset, Label } from "@/components/ui/field"
import { FileTrigger } from "@/components/ui/file-trigger"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { useAvatarUpload } from "@/hooks/use-avatar-upload"
import { authClient } from "@/lib/auth"
import { getAvatarUrl, getInitials } from "@/lib/avatar"
import type { Mode, Role } from "@/models/schema"
import { CameraIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "@tanstack/react-router"
import { api } from "api"
import type { Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useState } from "react"
import { Form } from "react-aria-components"
import { Controller, useForm } from "react-hook-form"
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
    control,
    handleSubmit,
    watch,
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

  const handleAvatarSelect = async (files: FileList | null) => {
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
      <Form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Fieldset>
          <div className="flex flex-col items-center gap-3">
            <Avatar
              src={previewUrl || getAvatarUrl({ name })}
              alt="Profile picture"
              size="xl"
              isSquare={false}
              initials={getInitials(name)}
            />
            <FileTrigger
              acceptedFileTypes={["image/*"]}
              allowsMultiple={false}
              onSelect={handleAvatarSelect}
            >
              <Button type="button" intent="secondary" size="sm" isPending={isUploading}>
                <CameraIcon className="size-4" />
                {isUploading ? "Uploading..." : previewUrl ? "Change Photo" : "Upload Photo"}
              </Button>
            </FileTrigger>
            <p className="text-muted-fg text-xs">
              {previewUrl
                ? "Custom photo uploaded"
                : "Auto-generated avatar • Upload your own (optional)"}
            </p>
          </div>

          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field: { ref, ...field } }) => (
              <TextField isRequired>
                <Label>Full name</Label>
                <Input {...field} />
                <FieldError>{errors.name?.message}</FieldError>
              </TextField>
            )}
          />

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
                <Description>This will be your account email address.</Description>
              </TextField>
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
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
            }}
            render={({ field: { ref, ...field } }) => (
              <PasswordField
                {...field}
                error={errors.password?.message}
                showStrength={true}
                isRequired
                label="Password"
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: (value) => {
                const password = watch("password")
                if (value !== password) {
                  return "Passwords do not match"
                }
                return true
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <PasswordField
                {...field}
                error={errors.confirmPassword?.message}
                label="Confirm Password"
                isRequired
              />
            )}
          />

          <Controller
            name="acceptTerms"
            control={control}
            rules={{
              required: "You must accept the terms and conditions",
            }}
            render={({ field: { value, onChange, ...field } }) => (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox {...field} isSelected={value} onChange={onChange} className="mt-0.5">
                    <span className="text-sm">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="font-medium text-fg underline hover:no-underline"
                      >
                        Terms and Conditions
                      </button>
                    </span>
                  </Checkbox>
                </div>
                {errors.acceptTerms && (
                  <p className="text-danger text-sm">{errors.acceptTerms.message}</p>
                )}
              </div>
            )}
          />

          <div data-slot="control">
            <Button type="submit" className={"w-full"} isPending={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-fg">Already have an account? </span>
            <Button
              variant="outline"
              size="sm"
              onPress={() => onSwitchMode?.("signin")}
              className="min-h-0 border-0 p-0 font-medium text-fg hover:underline"
            >
              Sign in
            </Button>
          </div>
        </Fieldset>
      </Form>

      <TermsDialog isOpen={showTerms} onOpenChange={setShowTerms} />
    </>
  )
}
