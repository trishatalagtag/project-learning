"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Switch } from "@/components/ui/switch"
import { useCourseMutations } from "@/hooks/use-course-mutations"
import type { Course } from "@/lib/types/course"
import {
  ArrowPathIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const enrollmentCodeSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters"),
})

interface EnrollmentSettingsCardProps {
  course: Course
}

export function EnrollmentSettingsCard({ course }: EnrollmentSettingsCardProps) {
  const mutations = useCourseMutations(course._id)

  const [editingCode, setEditingCode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const codeForm = useForm<z.infer<typeof enrollmentCodeSchema>>({
    resolver: zodResolver(enrollmentCodeSchema),
    defaultValues: { code: course.enrollmentCode || "" },
  })

  const handleToggleEnrollment = async (isOpen: boolean) => {
    await mutations.toggleEnrollment(isOpen)
  }

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codeForm.setValue("code", code)
  }

  const handleSaveCode = async (values: z.infer<typeof enrollmentCodeSchema>) => {
    setIsSaving(true)
    setError(null)
    const result = await mutations.updateCode(values.code)
    if (result.success) {
      setEditingCode(false)
    } else {
      setError(result.error || "Failed to save")
    }
    setIsSaving(false)
  }

  const handleCopyCode = () => {
    if (course.enrollmentCode) {
      navigator.clipboard.writeText(course.enrollmentCode)
      toast.success("Enrollment code copied to clipboard")
    }
  }

  const handleRegenerateCode = async () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    const result = await mutations.updateCode(newCode)
    if (result.success) {
      toast.success("Enrollment code regenerated")
    }
  }

  const handleCancel = () => {
    codeForm.reset()
    setEditingCode(false)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Settings</CardTitle>
        <CardDescription>Manage course enrollment access</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="space-y-2">
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Open Enrollment</ItemTitle>
              <ItemDescription>Allow students to enroll in this course</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch checked={course.isEnrollmentOpen} onCheckedChange={handleToggleEnrollment} />
            </ItemActions>
          </Item>

          <Item variant="outline">
            {editingCode ? (
              <div className="flex-1 space-y-2">
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(handleSaveCode)} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <FormField
                        control={codeForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} autoFocus disabled={isSaving} />
                            </FormControl>
                            <FormMessage />
                            {error && <p className="text-destructive text-sm">{error}</p>}
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateCode}
                        disabled={isSaving}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <XMarkIcon className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <>
                <ItemContent>
                  <ItemTitle>Enrollment Code</ItemTitle>
                  <ItemDescription>
                    {course.enrollmentCode ? (
                      <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                        {course.enrollmentCode}
                      </code>
                    ) : (
                      "No enrollment code set"
                    )}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {course.enrollmentCode ? (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRegenerateCode}>
                        <ArrowPathIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingCode(true)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditingCode(true)}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Set Enrollment Code
                    </Button>
                  )}
                </ItemActions>
              </>
            )}
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
