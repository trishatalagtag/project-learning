"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { flattenCategoryTree, normalizeCategoryTree } from "@/lib/categories"
import {
  AcademicCapIcon,
  BookOpenIcon,
  FolderIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { Course } from "./columns"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  teacherId: z.string().optional(),
  isEnrollmentOpen: z.boolean(),
})

type CourseFormProps =
  | {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: "create"
    course?: never
    onSuccess?: (courseId: Id<"courses">) => void
  }
  | {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: "edit"
    course: Course
    onSuccess?: () => void
  }

export function CourseForm({ open, onOpenChange, mode, course, onSuccess }: CourseFormProps) {
  const createCourse = useMutation(api.faculty.courses.createCourse)
  const updateCourse = useMutation(api.faculty.courses.updateCourse)
  const assignFaculty = useMutation(api.admin.courses.assignFaculty)
  const getCourseById = useQuery(
    api.faculty.courses.getCourseById,
    course && mode === "edit" ? { courseId: course._id } : "skip",
  )

  const categories = useQuery(api.shared.categories.listAllCategories)
  const normalizedCategories = useMemo(
    () => (categories ? normalizeCategoryTree(categories) : []),
    [categories],
  )
  const flatCategories = useMemo(
    () => flattenCategoryTree(normalizedCategories),
    [normalizedCategories],
  )
  const faculty = useQuery(api.admin.users.listUsersByRole, { role: "FACULTY" })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      content: "",
      categoryId: course?.categoryId || "",
      teacherId: course?.teacherId || "unassigned",
      isEnrollmentOpen: course?.isEnrollmentOpen ?? false,
    },
  })

  // Reset form when course changes or when course details are loaded
  useEffect(() => {
    if (course && mode === "edit") {
      // If we have full course details with content, use them
      if (getCourseById) {
        form.reset({
          title: getCourseById.title,
          description: getCourseById.description,
          content: getCourseById.content,
          categoryId: getCourseById.categoryId,
          teacherId: getCourseById.teacherId || "unassigned",
          isEnrollmentOpen: getCourseById.isEnrollmentOpen,
        })
      } else {
        // Fallback to basic course data
        form.reset({
          title: course.title,
          description: course.description,
          content: "",
          categoryId: course.categoryId,
          teacherId: course.teacherId || "unassigned",
          isEnrollmentOpen: course.isEnrollmentOpen,
        })
      }
    } else if (mode === "create") {
      form.reset({
        title: "",
        description: "",
        content: "",
        categoryId: "",
        teacherId: "unassigned",
        isEnrollmentOpen: false,
      })
    }
  }, [course, mode, form, getCourseById])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (mode === "create") {
        const courseId = await createCourse({
          title: values.title,
          description: values.description,
          content: values.content,
          categoryId: values.categoryId as Id<"categories">,
          isEnrollmentOpen: values.isEnrollmentOpen,
        })

        // Assign teacher if provided
        if (values.teacherId && values.teacherId !== "unassigned") {
          await assignFaculty({
            courseId,
            teacherId: values.teacherId,
          })
        }

        onOpenChange(false)
        form.reset()
        onSuccess?.(courseId)
      } else if (mode === "edit" && course) {
        await updateCourse({
          courseId: course._id,
          title: values.title,
          description: values.description,
          content: values.content,
          categoryId: values.categoryId as Id<"categories">,
          isEnrollmentOpen: values.isEnrollmentOpen,
        })

        // Update teacher assignment if changed
        const currentTeacherId = course.teacherId || "unassigned"
        const newTeacherId = values.teacherId || "unassigned"

        if (newTeacherId !== currentTeacherId) {
          if (newTeacherId !== "unassigned") {
            await assignFaculty({
              courseId: course._id,
              teacherId: newTeacherId,
            })
          }
        }

        onOpenChange(false)
        form.reset()
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to save course:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-primary" />
            {mode === "create" ? "Create New Course" : "Edit Course"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Course Title</FieldLabel>
              <Input
                id="title"
                placeholder="e.g., Sustainable Crop Production Techniques"
                aria-invalid={!!errors.title}
                {...form.register("title")}
              />
              <FieldDescription>Choose a clear, descriptive title</FieldDescription>
              <FieldError>{errors.title?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe what farmers will learn in this course..."
                rows={3}
                aria-invalid={!!errors.description}
                {...form.register("description")}
              />
              <FieldDescription>A brief overview of the course content</FieldDescription>
              <FieldError>{errors.description?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.content}>
              <FieldLabel htmlFor="content">Course Introduction</FieldLabel>
              <Textarea
                id="content"
                placeholder="Welcome to the course! In this course, you will learn modern farming practices..."
                rows={4}
                aria-invalid={!!errors.content}
                {...form.register("content")}
              />
              <FieldDescription>
                Detailed introduction content shown to enrolled students
              </FieldDescription>
              <FieldError>{errors.content?.message}</FieldError>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.categoryId}>
                <FieldContent>
                  <FieldLabel htmlFor="categoryId" className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    Category
                  </FieldLabel>
                  <FieldDescription>Course subject area</FieldDescription>
                </FieldContent>
                <Select
                  value={form.watch("categoryId")}
                  onValueChange={(value) => form.setValue("categoryId", value)}
                >
                  <SelectTrigger id="categoryId" aria-invalid={!!errors.categoryId}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories === undefined ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : flatCategories.length === 0 ? (
                      <div className="px-2 py-1.5 text-muted-foreground text-sm">
                        No categories available
                      </div>
                    ) : (
                      flatCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id} className="font-mono">
                          {"\u00A0\u00A0".repeat(Math.max(0, cat.level - 1))}
                          {cat.level > 1 && "└─ "}
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FieldError>{errors.categoryId?.message}</FieldError>
              </Field>

              <Field data-invalid={!!errors.teacherId}>
                <FieldContent>
                  <FieldLabel htmlFor="teacherId" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Teacher
                  </FieldLabel>
                  <FieldDescription>Assign a faculty member (optional)</FieldDescription>
                </FieldContent>
                <Select
                  value={form.watch("teacherId") || "unassigned"}
                  onValueChange={(value) => form.setValue("teacherId", value)}
                >
                  <SelectTrigger id="teacherId">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <span className="text-muted-foreground">Unassigned</span>
                    </SelectItem>
                    {faculty?.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.teacherId?.message}</FieldError>
              </Field>
            </div>

            <Field orientation="horizontal">
              <Switch
                id="isEnrollmentOpen"
                checked={form.watch("isEnrollmentOpen")}
                onCheckedChange={(checked) => form.setValue("isEnrollmentOpen", checked)}
              />
              <FieldContent>
                <FieldLabel htmlFor="isEnrollmentOpen">Open for Enrollment</FieldLabel>
                <FieldDescription>Allow learners to enroll in this course</FieldDescription>
              </FieldContent>
            </Field>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <BookOpenIcon className="mr-2 h-4 w-4 animate-pulse" />
                    Saving...
                  </>
                ) : mode === "create" ? (
                  <>
                    <BookOpenIcon className="mr-2 h-4 w-4" />
                    Create Course
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}