"use client"

import {
  AcademicCapIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CheckIcon,
  FolderIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { Loader2, Search } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
import { cn } from "@/lib/utils"

import type { Course } from "./columns"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  teacherId: z.string().optional(),
  isEnrollmentOpen: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

const STEPS = [
  { id: 1, name: "Basic Info", description: "Title & Category" },
  { id: 2, name: "Content", description: "Description" },
  { id: 3, name: "Teacher", description: "Assignment" },
  { id: 4, name: "Settings", description: "Enrollment" },
  { id: 5, name: "Review", description: "Preview" },
] as const

type CourseFormProps =
  | {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    mode: "create"
    course?: never
    onSuccess?: (courseId: Id<"courses">) => void
  }
  | {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    mode: "edit"
    course: Course
    onSuccess?: () => void
  }

export function CourseForm({ onOpenChange, mode, course, onSuccess }: CourseFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

  const createCourse = useMutation(api.faculty.courses.createCourse)
  const updateCourse = useMutation(api.faculty.courses.updateCourse)
  const assignFaculty = useMutation(api.admin.courses.assignFaculty)

  const categories = useQuery(api.shared.categories.listAllCategories)
  const faculty = useQuery(api.admin.users.listUsersByRole, { role: "FACULTY" })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      content: course?.content || "",
      categoryId: course?.categoryId || "",
      teacherId: course?.teacherId || undefined,
      isEnrollmentOpen: course?.isEnrollmentOpen || false,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = form

  const onSubmit = async (values: FormData) => {
    try {
      if (mode === "create") {
        const courseId = await createCourse({
          title: values.title,
          description: values.description,
          content: values.content,
          categoryId: values.categoryId as Id<"categories">,
          isEnrollmentOpen: values.isEnrollmentOpen,
        })

        if (values.teacherId) {
          await assignFaculty({
            courseId,
            teacherId: values.teacherId,
          })
        }

        toast.success("Course created successfully")
        onSuccess?.(courseId as any)
      } else if (course) {
        await updateCourse({
          courseId: course._id,
          title: values.title,
          description: values.description,
          content: values.content,
          categoryId: values.categoryId as Id<"categories">,
          isEnrollmentOpen: values.isEnrollmentOpen,
        })

        if (values.teacherId && values.teacherId !== course.teacherId) {
          await assignFaculty({
            courseId: course._id,
            teacherId: values.teacherId,
          })
        }

        toast.success("Course updated successfully")
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to save course:", error)
      toast.error("Failed to save course. Please try again.")
    }
  }

  const canGoToStep = (step: number) => {
    if (step === 1) return true
    if (step === 2) return !!watch("title") && !!watch("categoryId")
    if (step === 3) return !!watch("description") && !!watch("content")
    return true
  }

  const goToStep = (step: number) => {
    if (canGoToStep(step)) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (currentStep < 5 && canGoToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 font-semibold text-2xl">
                <AcademicCapIcon className="h-6 w-6 text-primary" />
                {mode === "create" ? "Create New Course" : "Edit Course"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={!canGoToStep(step.id)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full font-medium text-sm transition-all",
                      currentStep === step.id &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      currentStep > step.id && "bg-primary/20 text-primary hover:bg-primary/30",
                      currentStep < step.id && "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <CheckIcon className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="hidden text-center md:block">
                    <div
                      className={cn(
                        "font-medium text-xs",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </div>
                    <div className="text-muted-foreground text-xs">{step.description}</div>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-[2px] flex-1",
                      currentStep > step.id ? "bg-primary/30" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="min-h-[400px]">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="fade-in-50 animate-in space-y-6 duration-300">
                <div>
                  <h2 className="font-semibold text-xl">Basic Information</h2>
                  <p className="text-muted-foreground">
                    Let's start with the course title and category
                  </p>
                </div>

                <FieldGroup>
                  <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="title">Course Title</FieldLabel>
                    <Input
                      id="title"
                      placeholder="e.g., Sustainable Crop Production Techniques"
                      aria-invalid={!!errors.title}
                      {...register("title")}
                    />
                    <FieldDescription>Choose a clear, descriptive title for your course</FieldDescription>
                    {errors.title && <FieldError>{errors.title.message}</FieldError>}
                  </Field>

                  <FieldSeparator />

                  <Field data-invalid={!!errors.categoryId}>
                    <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                    <Select
                      value={watch("categoryId") || ""}
                      onValueChange={(value) => setValue("categoryId", value)}
                    >
                      <SelectTrigger id="categoryId" aria-invalid={!!errors.categoryId}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {!categories ? (
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : categories.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            No categories available
                          </div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              <span className="flex items-center gap-2">
                                <FolderIcon className="h-4 w-4 text-muted-foreground" />
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Select the subject area for this course</FieldDescription>
                    {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
                  </Field>
                </FieldGroup>
              </div>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <div className="fade-in-50 animate-in space-y-6 duration-300">
                <div>
                  <h2 className="font-semibold text-xl">Course Content</h2>
                  <p className="text-muted-foreground">
                    Describe what learners will gain from this course
                  </p>
                </div>

                <FieldGroup>
                  <Field data-invalid={!!errors.description}>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Describe what farmers will learn in this course..."
                      rows={4}
                      aria-invalid={!!errors.description}
                      className="resize-none"
                      {...register("description")}
                    />
                    <FieldDescription>
                      A brief overview that will appear in course listings ({watch("description")?.length || 0} characters)
                    </FieldDescription>
                    {errors.description && <FieldError>{errors.description.message}</FieldError>}
                  </Field>

                  <FieldSeparator />

                  <Field data-invalid={!!errors.content}>
                    <FieldLabel htmlFor="content">Course Introduction</FieldLabel>
                    <Textarea
                      id="content"
                      placeholder="Welcome to the course! In this course, you will learn..."
                      rows={8}
                      aria-invalid={!!errors.content}
                      className="resize-none"
                      {...register("content")}
                    />
                    <FieldDescription>
                      Detailed introduction shown to enrolled students ({watch("content")?.length || 0} characters)
                    </FieldDescription>
                    {errors.content && <FieldError>{errors.content.message}</FieldError>}
                  </Field>
                </FieldGroup>
              </div>
            )}

            {/* Step 3: Teacher */}
            {currentStep === 3 && (
              <div className="fade-in-50 animate-in space-y-6 duration-300">
                <div>
                  <h2 className="font-semibold text-xl">Assign Teacher</h2>
                  <p className="text-muted-foreground">
                    Optionally assign a faculty member to teach this course
                  </p>
                </div>

                {watch("teacherId") ? (
                  <TeacherCard
                    teacher={faculty?.find((t) => t._id === watch("teacherId"))}
                    onRemove={() => setValue("teacherId", undefined)}
                    onChange={() => setTeacherDialogOpen(true)}
                  />
                ) : (
                  <div className="rounded-lg border-2 border-dashed p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="mt-4 font-medium">No teacher assigned</h4>
                    <p className="mt-2 text-muted-foreground text-sm">
                      You can assign a teacher now or skip this step
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6"
                      onClick={() => setTeacherDialogOpen(true)}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      Select Teacher
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Settings */}
            {currentStep === 4 && (
              <div className="fade-in-50 animate-in space-y-6 duration-300">
                <div>
                  <h2 className="font-semibold text-xl">Course Settings</h2>
                  <p className="text-muted-foreground">
                    Configure enrollment and visibility options
                  </p>
                </div>

                <FieldGroup>
                  <Field orientation="horizontal" className="rounded-lg border p-6">
                    <Switch
                      id="enrollment"
                      checked={watch("isEnrollmentOpen")}
                      onCheckedChange={(checked) => setValue("isEnrollmentOpen", checked)}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="enrollment">Open for Enrollment</FieldLabel>
                      <FieldDescription>
                        {watch("isEnrollmentOpen")
                          ? "Learners can enroll in this course immediately"
                          : "Course is closed. You can open it later"}
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <FieldSeparator />

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-medium text-sm">About Enrollment</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {watch("isEnrollmentOpen") ? (
                        <>
                          When enrollment is open, learners can discover and enroll in this course
                          from the catalog. You can close it anytime.
                        </>
                      ) : (
                        <>
                          When enrollment is closed, only you and assigned teachers can access the
                          course. You can manually enroll specific learners.
                        </>
                      )}
                    </p>
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* Step 5: Preview */}
            {currentStep === 5 && (
              <div className="fade-in-50 animate-in space-y-6 duration-300">
                <div>
                  <h2 className="font-semibold text-xl">Review & Submit</h2>
                  <p className="text-muted-foreground">
                    Review your course details before publishing
                  </p>
                </div>

                <div className="space-y-6 rounded-lg border-2 bg-card p-6">
                  {/* Header */}
                  <div className="space-y-3 border-b pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-2xl leading-tight">{watch("title")}</h3>
                      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(1)}>
                        Edit
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <FolderIcon className="h-3 w-3" />
                        {categories?.find((c) => c._id === watch("categoryId"))?.name}
                      </Badge>
                      <Badge variant={watch("isEnrollmentOpen") ? "default" : "secondary"}>
                        {watch("isEnrollmentOpen") ? "Open for Enrollment" : "Enrollment Closed"}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Description</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(2)}>
                        Edit
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {watch("description")}
                    </p>
                  </div>

                  {/* Introduction */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Introduction</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(2)}>
                        Edit
                      </Button>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm leading-relaxed">{watch("content")}</p>
                    </div>
                  </div>

                  {/* Teacher */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Assigned Teacher</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(3)}>
                        Edit
                      </Button>
                    </div>
                    {watch("teacherId") ? (
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Avatar>
                          <AvatarImage
                            src={faculty?.find((t) => t._id === watch("teacherId"))?.image}
                          />
                          <AvatarFallback>
                            {faculty
                              ?.find((t) => t._id === watch("teacherId"))
                              ?.name.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {faculty?.find((t) => t._id === watch("teacherId"))?.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {faculty?.find((t) => t._id === watch("teacherId"))?.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No teacher assigned</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 border-t bg-card">
          <div className="container mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-muted-foreground text-sm">
                Step {currentStep} of {STEPS.length}
              </div>

              {currentStep === 5 ? (
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BookOpenIcon className="mr-2 h-4 w-4" />
                      {mode === "create" ? "Create Course" : "Save Changes"}
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} disabled={!canGoToStep(currentStep + 1)}>
                  Next
                  <CheckIcon className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Teacher Selection Dialog */}
      <TeacherSelectionDialog
        open={teacherDialogOpen}
        onOpenChange={setTeacherDialogOpen}
        faculty={faculty}
        selectedId={watch("teacherId")}
        onSelect={(id) => {
          setValue("teacherId", id)
          setTeacherDialogOpen(false)
        }}
      />
    </div>
  )
}

function TeacherCard({
  teacher,
  onRemove,
  onChange,
}: {
  teacher: any
  onRemove: () => void
  onChange: () => void
}) {
  if (!teacher) return null

  return (
    <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={teacher.image} alt={teacher.name} />
          <AvatarFallback className="bg-primary/10 text-lg text-primary">
            {teacher.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-base">{teacher.name}</p>
          <p className="text-muted-foreground text-sm">{teacher.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onChange}>
          Change
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function TeacherSelectionDialog({
  open,
  onOpenChange,
  faculty,
  selectedId,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  faculty: any[] | undefined
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = faculty?.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Select Teacher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {!faculty ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered && filtered.length > 0 ? (
              filtered.map((teacher) => (
                <button
                  key={teacher._id}
                  type="button"
                  onClick={() => onSelect(teacher._id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all hover:bg-muted/50",
                    selectedId === teacher._id &&
                    "border-primary bg-primary/5 ring-2 ring-primary/20"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.image} alt={teacher.name} />
                    <AvatarFallback>
                      {teacher.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-muted-foreground text-sm">{teacher.email}</p>
                  </div>
                  {selectedId === teacher._id && <CheckIcon className="h-5 w-5 text-primary" />}
                </button>
              ))
            ) : (
              <div className="py-12 text-center">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No teachers found</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  {search ? "Try a different search term" : "No faculty members available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}