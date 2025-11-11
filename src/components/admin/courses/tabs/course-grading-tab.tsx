"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import {
  ChartBarIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PlusCircleIcon,
  ScaleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const gradingConfigSchema = z
  .object({
    passingScore: z
      .number()
      .min(0, "Passing score must be at least 0")
      .max(100, "Passing score cannot exceed 100"),
    gradingMethod: z.enum(["numerical", "competency", "weighted"]),
    components: z
      .array(
        z.object({
          name: z.string().min(1, "Component name is required"),
          weight: z
            .number()
            .min(0.01, "Weight must be greater than 0")
            .max(100, "Weight cannot exceed 100"),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.gradingMethod === "weighted") {
        return data.components && data.components.length > 0
      }
      return true
    },
    {
      message: "At least one component is required for weighted grading",
      path: ["components"],
    },
  )
  .refine(
    (data) => {
      if (data.gradingMethod === "weighted" && data.components) {
        const total = data.components.reduce((sum, comp) => sum + comp.weight, 0)
        return Math.abs(total - 100) < 0.01
      }
      return true
    },
    {
      message: "Component weights must sum to exactly 100",
      path: ["components"],
    },
  )

type GradingConfigFormValues = z.infer<typeof gradingConfigSchema>

interface CourseGradingTabProps {
  courseId: Id<"courses">
}

// Preset configurations for quick setup
const GRADING_PRESETS = {
  tesda: [
    { name: "Written Assessment", weight: 40 },
    { name: "Practical Demonstration", weight: 40 },
    { name: "Portfolio/Project", weight: 20 },
  ],
  academic: [
    { name: "Quizzes", weight: 20 },
    { name: "Midterm Exam", weight: 30 },
    { name: "Final Exam", weight: 30 },
    { name: "Class Participation", weight: 20 },
  ],
  practical: [
    { name: "Skills Assessment", weight: 60 },
    { name: "Theory Test", weight: 30 },
    { name: "Attendance", weight: 10 },
  ],
}

export function CourseGradingTab({ courseId }: CourseGradingTabProps) {
  const course = useQuery(api.admin.courses.getCourseById, { courseId })
  const updateGradingConfig = useMutation(api.admin.grading.updateCourseGradingConfig)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const form = useForm<GradingConfigFormValues>({
    resolver: zodResolver(gradingConfigSchema),
    defaultValues: {
      passingScore: 60,
      gradingMethod: "numerical",
      components: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "components",
  })

  const watchGradingMethod = form.watch("gradingMethod")
  const watchComponents = form.watch("components")
  const watchPassingScore = form.watch("passingScore")

  // Calculate total weight
  const totalWeight = watchComponents?.reduce((sum, comp) => sum + (comp.weight || 0), 0) || 0
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01
  const weightProgress = Math.min(totalWeight, 100)

  // Load course data into form
  useEffect(() => {
    if (course?.gradingConfig) {
      form.reset({
        passingScore: course.gradingConfig.passingScore,
        gradingMethod: course.gradingConfig.gradingMethod as any,
        components: course.gradingConfig.components || [],
      })
    }
  }, [course, form])

  const onSubmit = async (values: GradingConfigFormValues) => {
    setIsSubmitting(true)
    try {
      await updateGradingConfig({
        courseId,
        gradingConfig: {
          passingScore: values.passingScore,
          gradingMethod: values.gradingMethod,
          components: values.gradingMethod === "weighted" ? values.components : undefined,
        },
      })
      toast.success("Grading configuration updated successfully")
    } catch (error) {
      console.error("Failed to update grading config:", error)
      toast.error("Failed to update grading configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyPreset = (preset: typeof GRADING_PRESETS.tesda) => {
    replace(preset)
    setShowPresets(false)
    toast.success("Preset applied successfully")
  }

  if (course === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Loading configuration...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const gradingMethodInfo = {
    numerical: {
      title: "Numerical Grading",
      description:
        "Students receive percentage scores (0-100) based on their performance in assessments.",
      icon: ChartBarIcon,
    },
    competency: {
      title: "Competency-Based",
      description:
        'Students are marked as "Competent" or "Not Yet Competent" based on skill mastery.',
      icon: CheckBadgeIcon,
    },
    weighted: {
      title: "Weighted Components",
      description:
        "Multiple assessment components with custom weights (e.g., exams 60%, projects 40%).",
      icon: ScaleIcon,
    },
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grading Configuration</CardTitle>
          <CardDescription>
            Define how students will be assessed and graded in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Grading Method */}
              <FormField
                control={form.control}
                name="gradingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-base">Grading Method</FormLabel>
                    <FormDescription>
                      Choose the assessment approach for this course
                    </FormDescription>
                    <FormControl>
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {(["numerical", "competency", "weighted"] as const).map((method) => {
                          const Icon = gradingMethodInfo[method].icon
                          return (
                            <label
                              key={method}
                              className={`relative flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-all hover:border-primary/50 ${field.value === method
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:shadow-sm"
                                }`}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                value={method}
                                checked={field.value === method}
                                onChange={() => field.onChange(method)}
                                disabled={isSubmitting}
                              />
                              <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">
                                      {gradingMethodInfo[method].title}
                                    </p>
                                    {field.value === method && (
                                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <p className="text-muted-foreground text-xs leading-relaxed">
                                    {gradingMethodInfo[method].description}
                                  </p>
                                </div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Passing Score */}
              <FormField
                control={form.control}
                name="passingScore"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="font-semibold text-base">Passing Score</FormLabel>
                        <FormDescription>
                          Minimum score required to pass this course
                        </FormDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-3xl text-primary">{watchPassingScore}%</div>
                      </div>
                    </div>
                    <FormControl>
                      <div className="mt-4 space-y-4">
                        <Input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          disabled={isSubmitting}
                          className="cursor-pointer"
                        />
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weighted Components Section */}
              {watchGradingMethod === "weighted" && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-semibold text-base">Grading Components</Label>
                        <p className="mt-1 text-muted-foreground text-sm">
                          Define weighted components that sum to 100%
                        </p>
                      </div>
                      {fields.length === 0 ? (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setShowPresets(!showPresets)}
                          disabled={isSubmitting}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Use Preset
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ name: "", weight: 0 })}
                          disabled={isSubmitting}
                        >
                          <PlusCircleIcon className="mr-2 h-4 w-4" />
                          Add Component
                        </Button>
                      )}
                    </div>

                    {/* Presets */}
                    {showPresets && fields.length === 0 && (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Card
                          className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                          onClick={() => applyPreset(GRADING_PRESETS.tesda)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <ScaleIcon className="h-4 w-4" />
                              TESDA Standard
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1 text-xs">
                            {GRADING_PRESETS.tesda.map((comp, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="text-muted-foreground">{comp.name}</span>
                                <span className="font-medium">{comp.weight}%</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card
                          className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                          onClick={() => applyPreset(GRADING_PRESETS.academic)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <ChartBarIcon className="h-4 w-4" />
                              Academic
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1 text-xs">
                            {GRADING_PRESETS.academic.map((comp, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="text-muted-foreground">{comp.name}</span>
                                <span className="font-medium">{comp.weight}%</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card
                          className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                          onClick={() => applyPreset(GRADING_PRESETS.practical)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <CheckBadgeIcon className="h-4 w-4" />
                              Skills-Based
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1 text-xs">
                            {GRADING_PRESETS.practical.map((comp, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="text-muted-foreground">{comp.name}</span>
                                <span className="font-medium">{comp.weight}%</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Weight Progress */}
                    {fields.length > 0 && (
                      <Card
                        className={`${isWeightValid
                          ? "border-primary/50 bg-primary/5"
                          : totalWeight > 100
                            ? "border-destructive/50 bg-destructive/5"
                            : "border-accent/50 bg-accent/5"
                          }`}
                      >
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isWeightValid ? (
                                  <CheckCircleIcon className="h-5 w-5 text-primary" />
                                ) : (
                                  <ExclamationCircleIcon className="h-5 w-5 text-destructive" />
                                )}
                                <span className="font-semibold text-sm">Total Weight</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-2xl">
                                  {totalWeight.toFixed(1)}%
                                </span>
                                {isWeightValid && <Badge variant="default">Valid</Badge>}
                              </div>
                            </div>
                            <Progress
                              value={weightProgress}
                              className={cn(
                                "h-2",
                                isWeightValid && "[&>div]:bg-primary",
                                totalWeight > 100 && "[&>div]:bg-destructive",
                                totalWeight < 100 && !isWeightValid && "[&>div]:bg-accent",
                              )}
                            />
                            {!isWeightValid && (
                              <p className="text-muted-foreground text-xs">
                                {totalWeight < 100
                                  ? `Add ${(100 - totalWeight).toFixed(1)}% more to reach 100%`
                                  : `Reduce by ${(totalWeight - 100).toFixed(1)}% to reach 100%`}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Components List */}
                    {fields.length > 0 ? (
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <Card
                            key={field.id}
                            className="border-2 transition-colors hover:border-primary/50"
                          >
                            <CardContent>
                              <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                  {index + 1}
                                </div>
                                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                  <FormField
                                    control={form.control}
                                    name={`components.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Component Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="e.g., Written Test"
                                            {...field}
                                            disabled={isSubmitting}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`components.${index}.weight`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Weight (%)</FormLabel>
                                        <FormControl>
                                          <div className="flex gap-2">
                                            <Input
                                              type="number"
                                              min={0}
                                              max={100}
                                              step={0.1}
                                              placeholder="0"
                                              {...field}
                                              onChange={(e) =>
                                                field.onChange(parseFloat(e.target.value) || 0)
                                              }
                                              disabled={isSubmitting}
                                              className="flex-1"
                                            />
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    disabled={isSubmitting}
                                                    className="shrink-0"
                                                  >
                                                    <TrashIcon className="h-4 w-4 text-destructive" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Remove component</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={() => append({ name: "", weight: 0 })}
                          disabled={isSubmitting}
                        >
                          <PlusCircleIcon className="mr-2 h-4 w-4" />
                          Add Another Component
                        </Button>
                      </div>
                    ) : (
                      !showPresets && (
                        <Card className="border-dashed">
                          <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4 rounded-full bg-muted p-3">
                              <PlusCircleIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mb-1 font-semibold">No components yet</h3>
                            <p className="mb-4 max-w-sm text-center text-muted-foreground text-sm">
                              Add grading components or use a preset to get started quickly
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() => setShowPresets(true)}
                              >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Browse Presets
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ name: "", weight: 0 })}
                              >
                                <PlusCircleIcon className="mr-2 h-4 w-4" />
                                Add Manually
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>Changes will affect all future assessments</span>
                </div>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (watchGradingMethod === "weighted" && (!isWeightValid || fields.length === 0))
                  }
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Configuration...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Summary Preview Card */}
      {watchGradingMethod && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <InformationCircleIcon className="h-5 w-5" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Method</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = gradingMethodInfo[watchGradingMethod].icon
                    return <Icon className="h-4 w-4 text-primary" />
                  })()}
                  <p className="font-semibold">{gradingMethodInfo[watchGradingMethod].title}</p>
                </div>
              </div>
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Passing Score</p>
                <p className="font-semibold">{watchPassingScore}%</p>
              </div>
            </div>

            {watchGradingMethod === "weighted" && fields.length > 0 && (
              <div>
                <p className="mb-2 text-muted-foreground text-xs">Components</p>
                <div className="space-y-2">
                  {watchComponents?.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{comp.name || `Component ${i + 1}`}</span>
                      <Badge variant="secondary">{comp.weight}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
