"use client"

import { FieldError, Label } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import type { InputProps } from "react-aria-components"

interface PasswordRequirement {
  met: boolean
  text: string
}

interface PasswordFieldProps extends Omit<InputProps, "type"> {
  label?: string
  error?: string
  showStrength?: boolean
  isRequired?: boolean
}

export function PasswordField({
  label = "Password",
  error,
  showStrength = false,
  isRequired,
  ...props
}: PasswordFieldProps) {
  const id = useId()
  const [isVisible, setIsVisible] = useState(false)
  const password = (props.value as string) || ""

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  const checkStrength = (pass: string): PasswordRequirement[] => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ]

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }))
  }

  const strength = checkStrength(password)

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length
  }, [strength])

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border"
    if (score <= 1) return "bg-red-500"
    if (score <= 2) return "bg-orange-500"
    if (score === 3) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password"
    if (score <= 2) return "Weak password"
    if (score === 3) return "Medium password"
    return "Strong password"
  }

  return (
    <TextField isRequired={isRequired}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          {...props}
          id={id}
          className="pe-9"
          type={isVisible ? "text" : "password"}
          aria-describedby={showStrength ? `${id}-strength` : undefined}
        />
        <button
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-fg/80 outline-none transition-colors hover:text-fg focus:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          tabIndex={-1}
        >
          {isVisible ? (
            <EyeOffIcon size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && <FieldError>{error}</FieldError>}

      {showStrength && password && (
        <>
          {/* Password strength indicator */}
          <div
            className="mt-3 mb-2 h-1 w-full overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuenow={strengthScore}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label="Password strength"
          >
            <div
              className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
              style={{ width: `${(strengthScore / 4) * 100}%` }}
            />
          </div>

          <p id={`${id}-strength`} className="mb-2 font-medium text-fg text-sm">
            {getStrengthText(strengthScore)}. Must contain:
          </p>

          <ul className="space-y-1.5" aria-label="Password requirements">
            {strength.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckIcon size={16} className="text-emerald-500" aria-hidden="true" />
                ) : (
                  <XIcon size={16} className="text-muted-fg/80" aria-hidden="true" />
                )}
                <span
                  className={`text-xs ${req.met ? "text-emerald-600 dark:text-emerald-500" : "text-muted-fg"}`}
                >
                  {req.text}
                  <span className="sr-only">
                    {req.met ? " - Requirement met" : " - Requirement not met"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </TextField>
  )
}
