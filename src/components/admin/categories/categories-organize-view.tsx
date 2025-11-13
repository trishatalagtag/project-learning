"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sortable, SortableItem, SortableItemHandle } from "@/components/ui/sortable"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useCategoryMutations } from "@/hooks/use-category-mutations"
import { type NormalizedCategoryNode, normalizeCategoryTree } from "@/lib/categories"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { FolderIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid"
import { useMutation, useQuery } from "convex/react"
import { GripVertical, Loader2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { CategoryDeleteDialog } from "./category-delete-dialog"
import { CategoryFormDialog } from "./category-form-dialog"
import { CategoryMoveDialog } from "./category-move-dialog"

type CategoryNode = NormalizedCategoryNode

interface CategoriesOrganizeViewProps {
    onCreateCategory?: () => void
}

export function CategoriesOrganizeView({ onCreateCategory }: CategoriesOrganizeViewProps) {
    const categories = useQuery(api.shared.categories.listAllCategories)
    const updateCategoryOrder = useMutation(api.admin.categories.updateCategory).withOptimisticUpdate(
        (localStore, args) => {
            if (!args || typeof args !== "object" || args === null || args.order === undefined) return

            const existing = localStore.getQuery(api.shared.categories.listAllCategories, {})
            if (!existing) return

            const updated = existing.map((category) =>
                category._id === args.categoryId ? { ...category, order: args.order as number } : category,
            )

            localStore.setQuery(api.shared.categories.listAllCategories, {}, updated)
        },
    )

    const mutations = useCategoryMutations()
    const [tree, setTree] = useState<NormalizedCategoryNode[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<NormalizedCategoryNode | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<NormalizedCategoryNode | null>(null)
    const [addSubcategoryTo, setAddSubcategoryTo] = useState<{
        parentId: Id<"categories">
        level: number
    } | null>(null)
    const [moveDialog, setMoveDialog] = useState<{
        category: NormalizedCategoryNode
        newLevel: number
        newParentId: Id<"categories"> | null
    } | null>(null)
    const [draggedCategory, setDraggedCategory] = useState<NormalizedCategoryNode | null>(null)
    const levelMapRef = useRef<Map<string, number>>(new Map())

    const formatCourseCount = (count?: number) => {
        const value = count ?? 0
        return `${value} ${value === 1 ? "course" : "courses"}`
    }

    useEffect(() => {
        if (categories) {
            const normalized = normalizeCategoryTree(categories)
            setTree(normalized)

            levelMapRef.current.clear()
            const setLevels = (nodes: NormalizedCategoryNode[], level: number) => {
                nodes.forEach((node) => {
                    levelMapRef.current.set(node._id, level)
                    if (node.children.length > 0) {
                        setLevels(node.children, level + 1)
                    }
                })
            }
            setLevels(normalized, 1)
        }
    }, [categories])

    const persistOrders = async (nodes: CategoryNode[], message: string) => {
        setIsSaving(true)
        try {
            const updates = nodes.map((node, index) =>
                updateCategoryOrder({
                    categoryId: node._id as Id<"categories">,
                    order: index,
                }),
            )

            await Promise.all(updates)
            toast.success(message)
        } catch (error) {
            console.error("Failed to persist order", error)
            toast.error("Failed to update category order")
        } finally {
            setIsSaving(false)
        }
    }

    const handleParentReorder = (groups: CategoryNode[]) => {
        const reordered = groups.map((group, index) => ({
            ...group,
            order: index,
        }))
        setTree(reordered)
        void persistOrders(reordered, "Top-level categories reordered")
    }

    const handleChildReorder = (parentId: Id<"categories">, children: CategoryNode[]) => {
        setTree((prev) =>
            prev.map((group) => {
                if (group._id !== parentId) return group
                const reorderedChildren = children.map((child, index) => ({
                    ...child,
                    order: index,
                }))
                return {
                    ...group,
                    children: reorderedChildren,
                }
            }),
        )

        const reordered = children.map((child, index) => ({
            ...child,
            order: index,
        }))
        void persistOrders(reordered, "Subcategories reordered")
    }

    const handleGrandchildReorder = (
        parentId: Id<"categories">,
        childId: Id<"categories">,
        grandchildren: CategoryNode[],
    ) => {
        setTree((prev) =>
            prev.map((group) => {
                if (group._id !== parentId) return group
                return {
                    ...group,
                    children: group.children.map((child) => {
                        if (child._id !== childId) return child
                        const reorderedGrandchildren = grandchildren.map((grandchild, index) => ({
                            ...grandchild,
                            order: index,
                        }))
                        return {
                            ...child,
                            children: reorderedGrandchildren,
                        }
                    }),
                }
            }),
        )

        const reordered = grandchildren.map((grandchild, index) => ({
            ...grandchild,
            order: index,
        }))
        void persistOrders(reordered, "Nested categories reordered")
    }

    const handleCreate = () => {
        setEditingCategory(null)
        setAddSubcategoryTo(null)
        setIsFormOpen(true)
        onCreateCategory?.()
    }

    const handleEdit = (category: NormalizedCategoryNode) => {
        setEditingCategory(category)
        setAddSubcategoryTo(null)
        setIsFormOpen(true)
    }

    const handleDelete = (category: NormalizedCategoryNode) => {
        setDeletingCategory(category)
    }

    const handleAddSubcategory = (parentId: Id<"categories">, parentLevel: number) => {
        setEditingCategory(null)
        setAddSubcategoryTo({
            parentId,
            level: parentLevel + 1,
        })
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        setEditingCategory(null)
        setAddSubcategoryTo(null)
    }

    const handleDeleteSuccess = () => {
        setDeletingCategory(null)
    }

    const findCategoryInTree = useCallback((categoryId: string): CategoryNode | null => {
        for (const group of tree) {
            if (group._id === categoryId) return group
            for (const child of group.children) {
                if (child._id === categoryId) return child
                for (const grandchild of child.children) {
                    if (grandchild._id === categoryId) return grandchild
                }
            }
        }
        return null
    }, [tree])

    const countChildren = useCallback((category: CategoryNode): number => {
        let count = category.children.length
        category.children.forEach((child) => {
            count += countChildren(child)
        })
        return count
    }, [])

    const handleGlobalDragStart = useCallback(
        (event: DragStartEvent) => {
            const category = findCategoryInTree(event.active.id as string)
            setDraggedCategory(category)
        },
        [findCategoryInTree],
    )

    const handleGlobalDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event
            setDraggedCategory(null)

            if (!over || !draggedCategory) return

            const activeId = active.id as string
            const overId = over.id as string

            const activeLevel = levelMapRef.current.get(activeId)
            const overLevel = levelMapRef.current.get(overId)

            if (!activeLevel || !overLevel) return

            if (activeLevel === overLevel) {
                return
            }

            let newParentId: Id<"categories"> | null = null
            const newLevel = overLevel

            if (newLevel === 1) {
                newParentId = null
            } else if (newLevel === 2) {
                const overCategory = findCategoryInTree(overId)
                if (overCategory && overCategory.level === 1) {
                    newParentId = overCategory._id as Id<"categories">
                } else {
                    const parentGroup = tree.find((g) => g._id === overId || g.children.some((c) => c._id === overId))
                    if (parentGroup) {
                        newParentId = parentGroup._id as Id<"categories">
                    }
                }
            } else if (newLevel === 3) {
                const overCategory = findCategoryInTree(overId)
                if (overCategory && overCategory.level === 2) {
                    newParentId = overCategory._id as Id<"categories">
                } else {
                    for (const group of tree) {
                        for (const child of group.children) {
                            if (child._id === overId) {
                                newParentId = child._id as Id<"categories">
                                break
                            }
                        }
                        if (newParentId) break
                    }
                }
            }

            if (newLevel !== activeLevel) {
                setMoveDialog({
                    category: draggedCategory,
                    newLevel,
                    newParentId,
                })
            }
        },
        [draggedCategory, findCategoryInTree, tree],
    )

    const handleMoveConfirm = useCallback(async () => {
        if (!moveDialog) return

        setIsSaving(true)
        try {
            await mutations.update({
                categoryId: moveDialog.category._id as Id<"categories">,
                level: moveDialog.newLevel,
                parentId: moveDialog.newParentId,
            })
            toast.success("Category moved successfully")
            setMoveDialog(null)
        } catch (error) {
            console.error("Failed to move category", error)
            toast.error("Failed to move category")
        } finally {
            setIsSaving(false)
        }
    }, [moveDialog, mutations])

    const handleMoveCancel = useCallback(() => {
        setMoveDialog(null)
        setDraggedCategory(null)
    }, [])

    if (categories === undefined) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (categories.length === 0) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold text-lg">No categories yet</h3>
                    <p className="mt-2 text-muted-foreground text-sm">
                        Get started by creating your first category.
                    </p>
                    <Button onClick={handleCreate} className="mt-4">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Category
                    </Button>
                </div>
                <CategoryFormDialog
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSuccess={handleFormSuccess}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {isSaving && (
                <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">Saving changes...</span>
                </div>
            )}

            <Sortable
                value={tree}
                onValueChange={handleParentReorder}
                getItemValue={(item) => item._id}
                className="space-y-4"
                onDragStart={handleGlobalDragStart}
                onDragEnd={(event) => {
                    handleGlobalDragEnd(event)
                }}
            >
                {tree.map((group) => (
                    <SortableItem key={group._id} value={group._id}>
                        <Card>
                            <CardHeader className="flex flex-col gap-2 border-border border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <SortableItemHandle className="text-muted-foreground transition-colors hover:text-foreground">
                                            <GripVertical className="h-4 w-4" />
                                        </SortableItemHandle>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <FolderIcon className="h-5 w-5 text-primary" />
                                            {group.name}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
                                            Level 1 · {formatCourseCount(group.courseCount)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(group)}
                                            className="h-8 gap-1"
                                        >
                                            <PencilIcon className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAddSubcategory(group._id as Id<"categories">, 1)}
                                            className="h-8 gap-1"
                                        >
                                            <PlusIcon className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Add Sub</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(group)}
                                            className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-4">
                                {group.children.length === 0 ? (
                                    <p className="rounded-md border border-muted border-dashed px-3 py-4 text-muted-foreground text-sm">
                                        No subcategories yet. Add Level 2 categories to organize within this group.
                                    </p>
                                ) : (
                                    <Sortable
                                        value={group.children}
                                        onValueChange={(value) => handleChildReorder(group._id as Id<"categories">, value)}
                                        getItemValue={(item) => item._id}
                                        className="space-y-3 pl-1"
                                        onDragStart={handleGlobalDragStart}
                                        onDragEnd={(event) => {
                                            handleGlobalDragEnd(event)
                                        }}
                                    >
                                        {group.children.map((child) => (
                                            <SortableItem key={child._id} value={child._id}>
                                                <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <SortableItemHandle className="text-muted-foreground transition-colors hover:text-foreground">
                                                                <GripVertical className="h-4 w-4" />
                                                            </SortableItemHandle>
                                                            <div>
                                                                <p className="font-medium text-sm">{child.name}</p>
                                                                <p className="text-muted-foreground text-xs">
                                                                    Level 2 · {formatCourseCount(child.courseCount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(child)}
                                                                className="h-7 gap-1"
                                                            >
                                                                <PencilIcon className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleAddSubcategory(child._id as Id<"categories">, 2)}
                                                                className="h-7 gap-1"
                                                            >
                                                                <PlusIcon className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(child)}
                                                                className="h-7 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <TrashIcon className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {child.children.length > 0 && (
                                                        <div className="mt-4 space-y-2 border-muted/70 border-l border-dashed pl-4">
                                                            <Sortable
                                                                value={child.children}
                                                                onValueChange={(value) =>
                                                                    handleGrandchildReorder(
                                                                        group._id as Id<"categories">,
                                                                        child._id as Id<"categories">,
                                                                        value,
                                                                    )
                                                                }
                                                                getItemValue={(item) => item._id}
                                                                className="space-y-2"
                                                                onDragStart={handleGlobalDragStart}
                                                                onDragEnd={(event) => {
                                                                    handleGlobalDragEnd(event)
                                                                }}
                                                            >
                                                                {child.children.map((grandchild) => (
                                                                    <SortableItem key={grandchild._id} value={grandchild._id}>
                                                                        <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
                                                                            <SortableItemHandle className="text-muted-foreground transition-colors hover:text-foreground">
                                                                                <GripVertical className="h-4 w-4" />
                                                                            </SortableItemHandle>
                                                                            <span className="flex-1 font-medium">{grandchild.name}</span>
                                                                            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                                                                                Level 3 · {formatCourseCount(grandchild.courseCount)}
                                                                            </span>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEdit(grandchild)}
                                                                                className="h-6 w-6 p-0"
                                                                            >
                                                                                <PencilIcon className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDelete(grandchild)}
                                                                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                            >
                                                                                <TrashIcon className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </SortableItem>
                                                                ))}
                                                            </Sortable>
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableItem>
                                        ))}
                                    </Sortable>
                                )}
                            </CardContent>
                        </Card>
                    </SortableItem>
                ))}
            </Sortable>

            {/* Create Category Button at Bottom */}
            <div className="flex justify-center pt-4">
                <Button onClick={handleCreate} size="lg" variant="outline">
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Create Category
                </Button>
            </div>

            <CategoryFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                category={editingCategory ? {
                    _id: editingCategory._id as Id<"categories">,
                    name: editingCategory.name,
                    description: editingCategory.description,
                    level: editingCategory.level,
                    parentId: editingCategory.parentId,
                    order: editingCategory.order,
                    courseCount: editingCategory.courseCount,
                    createdAt: editingCategory.createdAt,
                    updatedAt: editingCategory.updatedAt,
                } : undefined}
                level={addSubcategoryTo?.level}
                parentId={addSubcategoryTo?.parentId}
                onSuccess={handleFormSuccess}
            />

            {deletingCategory && (
                <CategoryDeleteDialog
                    open={!!deletingCategory}
                    onOpenChange={(open) => !open && setDeletingCategory(null)}
                    category={{
                        _id: deletingCategory._id as Id<"categories">,
                        name: deletingCategory.name,
                        description: deletingCategory.description,
                        level: deletingCategory.level,
                        parentId: deletingCategory.parentId,
                        order: deletingCategory.order,
                        courseCount: deletingCategory.courseCount,
                        createdAt: deletingCategory.createdAt,
                        updatedAt: deletingCategory.updatedAt,
                    }}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {moveDialog && (
                <CategoryMoveDialog
                    open={!!moveDialog}
                    onOpenChange={(open) => !open && handleMoveCancel()}
                    categoryName={moveDialog.category.name}
                    currentLevel={moveDialog.category.level}
                    newLevel={moveDialog.newLevel}
                    childrenCount={countChildren(moveDialog.category)}
                    onConfirm={handleMoveConfirm}
                />
            )}
        </div>
    )
}

