"use client"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

  // Flatten categories for dropdown
  const flatCategories =
    categories?.flatMap((cat) => [
      { id: cat._id, name: cat.name, level: cat.level },
      ...(cat.children || []).flatMap((child) => [
        { id: child._id, name: child.name, level: child.level },
        ...(child.children || []).map((grandchild) => ({
          id: grandchild._id,
          name: grandchild.name,
          level: grandchild.level,
        })),
      ]),
    ]) || []

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
          } else {
            // Unassign teacher - would need unassignFaculty mutation
            // For now, we'll skip this
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Course" : "Edit Course"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Course title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Course description" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Course introduction content" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {flatCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {"  ".repeat(cat.level - 1)}
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {faculty?.map((teacher) => (
                          <SelectItem key={teacher.userId} value={teacher.userId}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isEnrollmentOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enrollment Open</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow learners to enroll in this course
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Course" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
