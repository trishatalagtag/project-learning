"use client"

import {
  AcademicCapIcon,
  BookOpenIcon,
  CheckIcon,
  FolderIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocalStorage } from "@uidotdev/usehooks"
import { useMutation, useQuery } from "convex/react"
import { Loader2, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import * as z from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMediaQuery } from "@/hooks/use-media-query"
import { flattenCategoryTree, normalizeCategoryTree } from "@/lib/categories"

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
type FieldName = keyof FormData

const STEPS = [
  {
    id: 1,
    name: "Basic Info",
    description: "Course title and category",
    fields: ["title", "categoryId"] as FieldName[],
  },
  {
    id: 2,
    name: "Content",
    description: "Description and introduction",
    fields: ["description", "content"] as FieldName[],
  },
  {
    id: 3,
    name: "Teacher",
    description: "Assign faculty member",
    fields: [] as FieldName[],
  },
  {
    id: 4,
    name: "Settings",
    description: "Enrollment options",
    fields: [] as FieldName[],
  },
  {
    id: 5,
    name: "Preview",
    description: "Review and publish",
    fields: [] as FieldName[],
  },
] as const

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
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-primary" />
              {mode === "create" ? "Create New Course" : "Edit Course"}
            </DialogTitle>
          </DialogHeader>
          <CourseFormContent
            mode={mode}
            course={course}
            onSuccess={onSuccess}
            onOpenChange={onOpenChange}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-primary" />
            {mode === "create" ? "Create New Course" : "Edit Course"}
          </DrawerTitle>
        </DrawerHeader>
        <CourseFormContent
          mode={mode}
          course={course}
          onSuccess={onSuccess}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}

function CourseFormContent({
  mode,
  course,
  onSuccess,
  onOpenChange,
}: {
  mode: "create" | "edit"
  course?: Course
  onSuccess?: ((courseId: Id<"courses">) => void) | (() => void)
  onOpenChange: (open: boolean) => void
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const storageKey = `course-form-${mode}-${course?._id || "new"}`
  const [savedFormState, setSavedFormState] = useLocalStorage<{
    currentStep: number
    formValues: Partial<FormData>
  } | null>(storageKey, null)

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      content: "",
      categoryId: "",
      teacherId: undefined,
      isEnrollmentOpen: false,
    },
  })

  // Restore from localStorage or course data
  useEffect(() => {
    if (!open) return

    if (savedFormState) {
      form.reset(savedFormState.formValues as FormData)
      setCurrentStep(savedFormState.currentStep)
    } else if (course && mode === "edit" && getCourseById) {
      form.reset({
        title: getCourseById.title,
        description: getCourseById.description,
        content: getCourseById.content,
        categoryId: getCourseById.categoryId,
        teacherId: getCourseById.teacherId || undefined,
        isEnrollmentOpen: getCourseById.isEnrollmentOpen,
      })
      setCurrentStep(1)
    }
  }, [open, course, mode, getCourseById, savedFormState, form])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1)
    }
  }, [open])

  // Save form state to localStorage
  const saveFormState = (step: number) => {
    setSavedFormState({
      currentStep: step,
      formValues: form.getValues(),
    })
  }

  // Clear form state
  const clearFormState = () => {
    setSavedFormState(null)
    form.reset({
      title: "",
      description: "",
      content: "",
      categoryId: "",
      teacherId: undefined,
      isEnrollmentOpen: false,
    })
    setCurrentStep(1)
  }

  const nextStep = async () => {
    const currentStepData = STEPS[currentStep - 1]

    // Skip validation for steps with no required fields
    if (currentStepData.fields.length === 0) {
      const nextStepNum = currentStep + 1
      saveFormState(nextStepNum)
      setCurrentStep(nextStepNum)
      return
    }

    // Trigger validation for current step fields
    const isValid = await form.trigger(currentStepData.fields)

    if (!isValid) {
      return
    }

    if (currentStep < STEPS.length) {
      const nextStepNum = currentStep + 1
      saveFormState(nextStepNum)
      setCurrentStep(nextStepNum)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      const prevStepNum = currentStep - 1
      saveFormState(prevStepNum)
      setCurrentStep(prevStepNum)
    }
  }

  const goToStep = async (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      // Validate all previous steps before allowing jump forward
      if (step > currentStep) {
        for (let i = currentStep - 1; i < step - 1; i++) {
          const stepData = STEPS[i]
          if (stepData.fields.length > 0) {
            const isValid = await form.trigger(stepData.fields)
            if (!isValid) {
              return
            }
          }
        }
      }
      saveFormState(step)
      setCurrentStep(step)
    }
  }

  const onSubmit = async (values: FormData) => {
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

        if (values.teacherId) {
          await assignFaculty({
            courseId,
            teacherId: values.teacherId,
          })
        }

        clearFormState()
        onOpenChange(false)
          ; (onSuccess as (courseId: Id<"courses">) => void)?.(courseId)
      } else if (mode === "edit" && course) {
        await updateCourse({
          courseId: course._id,
          title: values.title,
          description: values.description,
          content: values.content,
          categoryId: values.categoryId as Id<"categories">,
          isEnrollmentOpen: values.isEnrollmentOpen,
        })

        const currentTeacherId = course.teacherId
        const newTeacherId = values.teacherId

        if (newTeacherId && newTeacherId !== currentTeacherId) {
          await assignFaculty({
            courseId: course._id,
            teacherId: newTeacherId,
          })
        }

        clearFormState()
        onOpenChange(false)
          ; (onSuccess as () => void)?.()
      }
    } catch (error) {
      console.error("Failed to save course:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col overflow-hidden md:h-[calc(90vh-5rem)]">
        {/* Stepper */}
        <div className="shrink-0 border-b px-4 py-4 md:px-6">
          <Stepper value={currentStep} onValueChange={goToStep} className="w-full">
            {STEPS.map((step, index) => (
              <StepperItem
                key={step.id}
                step={step.id}
                completed={currentStep > step.id}
                className="not-last:flex-1"
              >
                <StepperTrigger asChild>
                  <div className="flex flex-col items-center gap-2">
                    <StepperIndicator />
                    <div className="hidden text-center lg:block">
                      <div className="text-xs font-medium">{step.name}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                </StepperTrigger>
                {index < STEPS.length - 1 && <StepperSeparator />}
              </StepperItem>
            ))}
          </Stepper>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="mx-auto max-w-2xl">
            {currentStep === 1 && <BasicInfoStep categories={flatCategories} />}
            {currentStep === 2 && <ContentStep />}
            {currentStep === 3 && (
              <TeacherStep
                faculty={faculty}
                onOpenTeacherDialog={() => setTeacherDialogOpen(true)}
              />
            )}
            {currentStep === 4 && <SettingsStep />}
            {currentStep === 5 && (
              <PreviewStep categories={flatCategories} faculty={faculty} onGoToStep={goToStep} />
            )}
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div className="shrink-0 border-t px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearFormState()
                  onOpenChange(false)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {currentStep === STEPS.length ? (
                <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "create" ? "Creating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <BookOpenIcon className="mr-2 h-4 w-4" />
                      {mode === "create" ? "Create Course" : "Save Changes"}
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested Dialog for Teacher Selection */}
      <TeacherSelectionDialog
        open={teacherDialogOpen}
        onOpenChange={setTeacherDialogOpen}
        faculty={faculty}
      />
    </FormProvider>
  )
}

// STEP 1: Basic Info
function BasicInfoStep({ categories }: { categories: any[] }) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<FormData>()

  const categoryId = watch("categoryId")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Let's start with the course title and category
        </p>
      </div>

      <FieldGroup className="@container/field-group">
        <Field orientation="responsive" data-invalid={!!errors.title}>
          <FieldContent>
            <FieldLabel htmlFor="title">Course Title</FieldLabel>
            <FieldDescription>Choose a clear, descriptive title</FieldDescription>
          </FieldContent>
          <div className="w-full sm:min-w-[300px]">
            <Input
              id="title"
              placeholder="e.g., Sustainable Crop Production Techniques"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </div>
        </Field>

        <FieldSeparator />

        <Field orientation="responsive" data-invalid={!!errors.categoryId}>
          <FieldContent>
            <FieldLabel htmlFor="categoryId" className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              Category
            </FieldLabel>
            <FieldDescription>Select the course subject area</FieldDescription>
          </FieldContent>
          <div className="w-full sm:min-w-[300px]">
            <Select
              value={categoryId || ""}
              onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
            >
              <SelectTrigger id="categoryId" aria-invalid={!!errors.categoryId}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {!categories ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No categories available
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} className="font-mono">
                      {"\u00A0\u00A0".repeat(Math.max(0, cat.level - 1))}
                      {cat.level > 1 && "└─ "}
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
          </div>
        </Field>
      </FieldGroup>
    </div>
  )
}

// STEP 2: Content
function ContentStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<FormData>()

  const descriptionLength = watch("description")?.length || 0
  const contentLength = watch("content")?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Course Content</h3>
        <p className="text-sm text-muted-foreground">
          Describe what learners will gain from this course
        </p>
      </div>

      <FieldGroup className="@container/field-group">
        <Field orientation="responsive" data-invalid={!!errors.description}>
          <FieldContent>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <FieldDescription>
              A brief overview of the course ({descriptionLength} characters)
            </FieldDescription>
          </FieldContent>
          <div className="w-full sm:min-w-[300px]">
            <Textarea
              id="description"
              placeholder="Describe what farmers will learn in this course..."
              rows={4}
              aria-invalid={!!errors.description}
              className="resize-none"
              {...register("description")}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </div>
        </Field>

        <FieldSeparator />

        <Field orientation="responsive" data-invalid={!!errors.content}>
          <FieldContent>
            <FieldLabel htmlFor="content">Course Introduction</FieldLabel>
            <FieldDescription>
              Detailed introduction shown to enrolled students ({contentLength} characters)
            </FieldDescription>
          </FieldContent>
          <div className="w-full sm:min-w-[300px]">
            <Textarea
              id="content"
              placeholder="Welcome to the course! In this course, you will learn modern farming practices..."
              rows={6}
              aria-invalid={!!errors.content}
              className="resize-none"
              {...register("content")}
            />
            {errors.content && <FieldError>{errors.content.message}</FieldError>}
          </div>
        </Field>
      </FieldGroup>
    </div>
  )
}

// STEP 3: Teacher Assignment
function TeacherStep({
  faculty,
  onOpenTeacherDialog,
}: {
  faculty: any[] | undefined
  onOpenTeacherDialog: () => void
}) {
  const { watch, setValue } = useFormContext<FormData>()
  const selectedTeacherId = watch("teacherId")
  const selectedTeacher = faculty?.find((t) => t._id === selectedTeacherId)

  const handleSkip = () => {
    setValue("teacherId", undefined, { shouldValidate: true, shouldDirty: true })
  }

  const handleRemove = () => {
    setValue("teacherId", undefined, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Assign Teacher</h3>
        <p className="text-sm text-muted-foreground">
          Assign a faculty member to teach this course (optional)
        </p>
      </div>

      {selectedTeacher ? (
        <div className="space-y-4">
          <Item variant="outline" className="border-2 border-primary/20 bg-primary/5">
            <ItemMedia variant="icon">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedTeacher.image} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedTeacher.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-base">{selectedTeacher.name}</ItemTitle>
              <ItemDescription>{selectedTeacher.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button type="button" variant="outline" size="sm" onClick={onOpenTeacherDialog}>
                Change
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </ItemActions>
          </Item>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Teacher assigned successfully</p>
                <p className="text-muted-foreground">
                  {selectedTeacher.name} will be able to manage this course
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed p-8 text-center md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UserIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="mt-4 font-medium">No teacher assigned</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            You can assign a teacher now or skip and assign later
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onOpenTeacherDialog}>
              <UserIcon className="mr-2 h-4 w-4" />
              Select Teacher
            </Button>
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// STEP 4: Settings
function SettingsStep() {
  const { watch, setValue } = useFormContext<FormData>()
  const isEnrollmentOpen = watch("isEnrollmentOpen")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Course Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure enrollment and visibility options
        </p>
      </div>

      <FieldGroup className="@container/field-group">
        <Field orientation="horizontal" className="rounded-lg border p-4">
          <Switch
            id="isEnrollmentOpen"
            checked={isEnrollmentOpen}
            onCheckedChange={(checked) =>
              setValue("isEnrollmentOpen", checked, { shouldValidate: true, shouldDirty: true })
            }
          />
          <FieldContent>
            <FieldLabel htmlFor="isEnrollmentOpen" className="text-base">
              Open for Enrollment
            </FieldLabel>
            <FieldDescription>
              {isEnrollmentOpen
                ? "Learners can enroll in this course immediately"
                : "Enrollment is closed. You can open it later from course settings"}
            </FieldDescription>
          </FieldContent>
        </Field>

        <FieldSeparator />

        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">Enrollment Status</h4>
          <p className="text-sm text-muted-foreground">
            {isEnrollmentOpen ? (
              <>
                When enrollment is open, learners will be able to discover and enroll in this
                course from the course catalog.
              </>
            ) : (
              <>
                When enrollment is closed, only you and assigned teachers can access the course.
                You can manually enroll specific learners.
              </>
            )}
          </p>
        </div>
      </FieldGroup>
    </div>
  )
}

// STEP 5: Preview
function PreviewStep({
  categories,
  faculty,
  onGoToStep,
}: {
  categories: any[]
  faculty: any[] | undefined
  onGoToStep: (step: number) => void
}) {
  const { watch } = useFormContext<FormData>()
  const values = watch()
  const category = categories?.find((c) => c._id === values.categoryId)
  const teacher = faculty?.find((t) => t._id === values.teacherId)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review Course</h3>
        <p className="text-sm text-muted-foreground">
          Review your course details before publishing
        </p>
      </div>

      <div className="space-y-6 rounded-lg border-2 bg-card p-4 md:p-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xl font-bold leading-tight md:text-2xl">
              {values.title || "Untitled Course"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(1)}
              className="shrink-0 text-muted-foreground"
            >
              Edit
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Badge variant="outline" className="gap-1">
                <FolderIcon className="h-3 w-3" />
                {category.name}
              </Badge>
            )}
            {values.isEnrollmentOpen ? (
              <Badge variant="default" className="bg-green-500">
                Open for Enrollment
              </Badge>
            ) : (
              <Badge variant="secondary">Enrollment Closed</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold">Description</h5>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(2)}
              className="text-muted-foreground"
            >
              Edit
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {values.description || "No description provided"}
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold">Course Introduction</h5>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(2)}
              className="text-muted-foreground"
            >
              Edit
            </Button>
          </div>
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm leading-relaxed">{values.content || "No introduction provided"}</p>
          </div>
        </div>

        {/* Teacher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold">Assigned Teacher</h5>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(3)}
              className="text-muted-foreground"
            >
              Edit
            </Button>
          </div>
          {teacher ? (
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={teacher.image} />
                  <AvatarFallback>
                    {teacher.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{teacher.name}</ItemTitle>
                <ItemDescription>{teacher.email}</ItemDescription>
              </ItemContent>
            </Item>
          ) : (
            <p className="text-sm text-muted-foreground">No teacher assigned</p>
          )}
        </div>
      </div>
    </div>
  )
}

// NESTED DIALOG: Teacher Selection
function TeacherSelectionDialog({
  open,
  onOpenChange,
  faculty,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  faculty: any[] | undefined
}) {
  const { watch, setValue } = useFormContext<FormData>()
  const selectedTeacherId = watch("teacherId")
  const [search, setSearch] = useState("")

  const filteredFaculty = faculty?.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = (teacherId: string) => {
    setValue("teacherId", teacherId, { shouldValidate: true, shouldDirty: true })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-full max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Select Teacher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {faculty === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFaculty && filteredFaculty.length > 0 ? (
              <ItemGroup>
                {filteredFaculty.map((teacher) => {
                  const isSelected = selectedTeacherId === teacher._id
                  return (
                    <Item
                      key={teacher._id}
                      variant={isSelected ? "muted" : "default"}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => handleSelect(teacher._id)}
                    >
                      <ItemMedia variant="icon">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={teacher.image} />
                          <AvatarFallback
                            className={isSelected ? "bg-primary text-primary-foreground" : ""}
                          >
                            {teacher.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="font-medium">{teacher.name}</ItemTitle>
                        <ItemDescription>{teacher.email}</ItemDescription>
                      </ItemContent>
                      {isSelected && (
                        <ItemActions>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <CheckIcon className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </ItemActions>
                      )}
                    </Item>
                  )
                })}
              </ItemGroup>
            ) : (
              <div className="py-12 text-center">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 font-medium">No teachers found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search ? "Try adjusting your search" : "No faculty members available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}