"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useCategoryMutations } from "@/hooks/use-category-mutations"
import { flattenCategoryTree, normalizeCategoryTree } from "@/lib/categories"
import { FolderIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Category } from "./columns"

interface CategoryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: Category | null
    onSuccess?: () => void
}

const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
    description: z
        .string()
        .min(3, "Description must be at least 3 characters")
        .max(500, "Description is too long"),
    level: z.number().int().min(1).max(3),
    parentId: z.string().optional(),
    order: z
        .any()
        .optional()
        .transform((val) => {
            if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
                return undefined
            }
            return Number(val)
        })
        .pipe(z.number().int().min(0).optional()),
})

type FormValues = {
    name: string
    description: string
    level: number
    parentId?: string
    order?: number
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryFormDialogProps) {
    const categories = useQuery(api.shared.categories.listAllCategories)
    const normalizedCategories = useMemo(
        () => (categories ? normalizeCategoryTree(categories) : []),
        [categories],
    )
    const flatCategories = useMemo(
        () => flattenCategoryTree(normalizedCategories),
        [normalizedCategories],
    )
    const mutations = useCategoryMutations()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditMode = !!category

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            level: 1,
            parentId: "",
            order: undefined,
        },
    })

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                description: category.description,
                level: category.level,
                parentId: category.parentId || "",
                order: category.order,
            })
        } else {
            form.reset({
                name: "",
                description: "",
                level: 1,
                parentId: "",
                order: undefined,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    const level = form.watch("level")
    const parentId = form.watch("parentId")

    // Filter available parents based on level
    const availableParents = useMemo(() => {
        if (flatCategories.length === 0) return []
        return flatCategories.filter((cat) => {
            if (isEditMode && cat._id === category?._id) return false
            return cat.level === level - 1
        })
    }, [flatCategories, isEditMode, category?._id, level])

    // Reset parent when level changes
    useEffect(() => {
        if (level === 1) {
            form.setValue("parentId", "")
        } else if (level > 1 && !availableParents.find((p) => p._id === parentId)) {
            form.setValue("parentId", "")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level, availableParents, parentId])

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            if (isEditMode && category) {
                const result = await mutations.update({
                    categoryId: category._id,
                    name: values.name,
                    description: values.description,
                    order: values.order,
                })
                if (result.success) {
                    onOpenChange(false)
                    form.reset()
                    onSuccess?.()
                }
            } else {
                const result = await mutations.create({
                    name: values.name,
                    description: values.description,
                    level: values.level,
                    parentId: values.parentId ? (values.parentId as Id<"categories">) : undefined,
                    order: values.order,
                })
                if (result.success) {
                    onOpenChange(false)
                    form.reset()
                    onSuccess?.()
                }
            }
        } catch (error) {
            console.error("Failed to save category:", error)
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
                        <FolderIcon className="h-5 w-5 text-primary" />
                        {isEditMode ? "Edit Category" : "Create New Category"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!errors.name}>
                            <FieldLabel htmlFor="name">Category Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="e.g., Agriculture"
                                aria-invalid={!!errors.name}
                                {...form.register("name")}
                            />
                            <FieldDescription>Choose a clear, descriptive name</FieldDescription>
                            <FieldError>{errors.name?.message}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.description}>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea
                                id="description"
                                placeholder="Describe this category..."
                                rows={3}
                                aria-invalid={!!errors.description}
                                {...form.register("description")}
                            />
                            <FieldDescription>A brief overview of what this category covers</FieldDescription>
                            <FieldError>{errors.description?.message}</FieldError>
                        </Field>

                        {!isEditMode && (
                            <>
                                <Field data-invalid={!!errors.level}>
                                    <FieldLabel htmlFor="level">Level</FieldLabel>
                                    <Select
                                        value={level.toString()}
                                        onValueChange={(value) => form.setValue("level", parseInt(value, 10))}
                                    >
                                        <SelectTrigger id="level" aria-invalid={!!errors.level}>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Level 1 (Top Level)</SelectItem>
                                            <SelectItem value="2">Level 2 (Subcategory)</SelectItem>
                                            <SelectItem value="3">Level 3 (Sub-subcategory)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Categories can have up to 3 levels of hierarchy
                                    </FieldDescription>
                                    <FieldError>{errors.level?.message}</FieldError>
                                </Field>

                                {level > 1 && (
                                    <Field data-invalid={!!errors.parentId}>
                                        <FieldLabel htmlFor="parentId">Parent Category</FieldLabel>
                                        <Select
                                            value={parentId || ""}
                                            onValueChange={(value) => form.setValue("parentId", value)}
                                            disabled={categories === undefined}
                                        >
                                            <SelectTrigger id="parentId" aria-invalid={!!errors.parentId}>
                                                <SelectValue placeholder="Select parent category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories === undefined ? (
                                                    <div className="flex items-center justify-center px-2 py-1.5 text-muted-foreground text-sm">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : availableParents.length === 0 ? (
                                                    <div className="px-2 py-1.5 text-muted-foreground text-sm">
                                                        No parent categories available
                                                    </div>
                                                ) : (
                                                    availableParents.map((parent) => (
                                                        <SelectItem key={parent._id} value={parent._id}>
                                                            {"\u00A0\u00A0".repeat(parent.level - 1)}
                                                            {parent.level > 1 && "└─ "}
                                                            {parent.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            {level === 2
                                                ? "Select a Level 1 category as parent"
                                                : "Select a Level 2 category as parent"}
                                        </FieldDescription>
                                        <FieldError>{errors.parentId?.message}</FieldError>
                                    </Field>
                                )}

                            </>
                        )}

                    </FieldGroup>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

