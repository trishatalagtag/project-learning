"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import { forwardRef, useMemo, useState } from "react"

interface PasswordRequirement {
  met: boolean
  text: string
}

interface PasswordFieldProps extends Omit<React.ComponentProps<"input">, "type" | "ref"> {
  id?: string
  label?: string
  showStrength?: boolean
  error?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label = "Password", showStrength = false, error, value = "", name, onChange, onBlur }, ref) => {
    const [isVisible, setIsVisible] = useState(false)

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

    const passwordValue = typeof value === "string" ? value : String(value || "")
    const strength = checkStrength(passwordValue)

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
      <Field data-invalid={!!error}>
        <FieldContent>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <div className="relative">
            <Input
              ref={ref}
              id={id}
              name={name}
              className="pr-10"
              type={isVisible ? "text" : "password"}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={!!error}
            />
            <button
              className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {isVisible ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {error && <FieldError>{error}</FieldError>}

          {showStrength && passwordValue && (
            <div className="space-y-2">
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-secondary"
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

              <FieldDescription>
                {getStrengthText(strengthScore)}. Must contain:
              </FieldDescription>

              <ul className="space-y-1.5" aria-label="Password requirements">
                {strength.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {req.met ? (
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={`text-xs ${req.met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                    >
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FieldContent>
      </Field>
    )
  }
)

PasswordField.displayName = "PasswordField"
