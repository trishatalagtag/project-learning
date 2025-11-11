"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useCourseMutations } from "@/hooks/use-course-mutations"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import type { Course } from "@/lib/types/course"
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const titleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
})

const descriptionSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
})

const categorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
})

interface CourseInfoCardProps {
  course: Course
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
  const mutations = useCourseMutations(course._id)
  const categories = useQuery(api.admin.categories.listCategories)

  const [editingField, setEditingField] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleForm = useForm<z.infer<typeof titleSchema>>({
    resolver: zodResolver(titleSchema),
    defaultValues: { title: course.title },
  })

  const descriptionForm = useForm<z.infer<typeof descriptionSchema>>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: { description: course.description },
  })

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { categoryId: course.categoryId },
  })

  const handleSaveTitle = async (values: z.infer<typeof titleSchema>) => {
    setIsSaving(true)
    setError(null)
    const result = await mutations.updateCourse(
      values.title,
      course.description,
      course.categoryId as Id<"categories">,
    )
    if (result.success) {
      setEditingField(null)
    } else {
      setError(result.error || "Failed to save")
    }
    setIsSaving(false)
  }

  const handleSaveDescription = async (values: z.infer<typeof descriptionSchema>) => {
    setIsSaving(true)
    setError(null)
    const result = await mutations.updateCourse(
      course.title,
      values.description,
      course.categoryId as Id<"categories">,
    )
    if (result.success) {
      setEditingField(null)
    } else {
      setError(result.error || "Failed to save")
    }
    setIsSaving(false)
  }

  const handleSaveCategory = async (values: z.infer<typeof categorySchema>) => {
    setIsSaving(true)
    setError(null)
    const result = await mutations.updateCourse(
      course.title,
      course.description,
      values.categoryId as Id<"categories">,
    )
    if (result.success) {
      setEditingField(null)
    } else {
      setError(result.error || "Failed to save")
    }
    setIsSaving(false)
  }

  const handleCancel = (field: string) => {
    if (field === "title") titleForm.reset()
    if (field === "description") descriptionForm.reset()
    if (field === "category") categoryForm.reset()
    setEditingField(null)
    setError(null)
  }

  const getCategoryIndentation = (level: number) => {
    return "\u00A0".repeat((level - 1) * 4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Manage core details about this course</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="space-y-2">
          {/* TITLE */}
          <Item variant="outline" className={editingField === "title" ? "bg-accent/50" : ""}>
            {editingField === "title" ? (
              <div className="flex-1 space-y-3">
                <Form {...titleForm}>
                  <form onSubmit={titleForm.handleSubmit(handleSaveTitle)} className="space-y-3">
                    <FormField
                      control={titleForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-muted-foreground text-xs">
                            Course Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoFocus
                              disabled={isSaving}
                              placeholder="Enter course title"
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <div className="rounded-md bg-destructive/10 p-2">
                        <p className="text-destructive text-xs">{error}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="submit" size="sm" disabled={isSaving} className="gap-2">
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving
                                </>
                              ) : (
                                <>
                                  <CheckIcon className="h-4 w-4" />
                                  Save
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save changes</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel("title")}
                              disabled={isSaving}
                              className="gap-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Discard changes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <>
                <ItemContent>
                  <ItemTitle className="font-medium text-sm">Course Title</ItemTitle>
                  <ItemDescription className="mt-1 font-semibold text-base text-foreground">
                    {course.title}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingField("title")}
                          className="h-8 w-8 p-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit title</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit title</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </ItemActions>
              </>
            )}
          </Item>

          {/* DESCRIPTION */}
          <Item variant="outline" className={editingField === "description" ? "bg-accent/50" : ""}>
            {editingField === "description" ? (
              <div className="flex-1 space-y-3">
                <Form {...descriptionForm}>
                  <form
                    onSubmit={descriptionForm.handleSubmit(handleSaveDescription)}
                    className="space-y-3"
                  >
                    <FormField
                      control={descriptionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-muted-foreground text-xs">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              autoFocus
                              disabled={isSaving}
                              placeholder="Enter course description"
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <div className="rounded-md bg-destructive/10 p-2">
                        <p className="text-destructive text-xs">{error}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="submit" size="sm" disabled={isSaving} className="gap-2">
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving
                                </>
                              ) : (
                                <>
                                  <CheckIcon className="h-4 w-4" />
                                  Save
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save changes</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel("description")}
                              disabled={isSaving}
                              className="gap-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Discard changes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <>
                <ItemContent>
                  <ItemTitle className="font-medium text-sm">Description</ItemTitle>
                  <ItemDescription className="mt-1 whitespace-pre-wrap text-foreground/80 text-sm">
                    {course.description}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingField("description")}
                          className="h-8 w-8 p-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit description</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit description</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </ItemActions>
              </>
            )}
          </Item>

          {/* CATEGORY */}
          <Item variant="outline" className={editingField === "category" ? "bg-accent/50" : ""}>
            {editingField === "category" ? (
              <div className="flex-1 space-y-3">
                <Form {...categoryForm}>
                  <form
                    onSubmit={categoryForm.handleSubmit(handleSaveCategory)}
                    className="space-y-3"
                  >
                    <FormField
                      control={categoryForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-muted-foreground text-xs">
                            Category
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            disabled={isSaving || !categories}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {!categories ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                              ) : (
                                categories.map((cat) => (
                                  <SelectItem key={cat._id} value={cat._id} className="font-mono">
                                    {getCategoryIndentation(cat.level)}
                                    {cat.level > 1 && "└─ "}
                                    {cat.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <div className="rounded-md bg-destructive/10 p-2">
                        <p className="text-destructive text-xs">{error}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="submit" size="sm" disabled={isSaving} className="gap-2">
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving
                                </>
                              ) : (
                                <>
                                  <CheckIcon className="h-4 w-4" />
                                  Save
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save changes</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel("category")}
                              disabled={isSaving}
                              className="gap-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Discard changes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <>
                <ItemContent>
                  <ItemTitle className="font-medium text-sm">Category</ItemTitle>
                  <ItemDescription className="mt-1 text-foreground/80 text-sm">
                    {course.categoryName}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingField("category")}
                          className="h-8 w-8 p-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit category</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit category</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </ItemActions>
              </>
            )}
          </Item>

          {/* STATUS */}
          <Item variant="outline">
            <ItemContent>
              <ItemTitle className="font-medium text-sm">Status</ItemTitle>
              <div className="mt-1">
                <Badge
                  variant={course.status === CONTENT_STATUS.PUBLISHED ? "default" : "secondary"}
                  className="capitalize"
                >
                  {course.status}
                </Badge>
              </div>
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
