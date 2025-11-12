"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Sortable, SortableItem, SortableItemHandle } from "@/components/ui/sortable"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { normalizeCategoryTree, type NormalizedCategoryNode } from "@/lib/categories"
import { ArrowLeftIcon, FolderIcon } from "@heroicons/react/24/outline"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { GripVertical, Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/_admin/a/categories/organize")({
  component: OrganizeCategoriesPage,
})

type CategoryNode = NormalizedCategoryNode

function OrganizeCategoriesPage() {
  const navigate = useNavigate()
  const categories = useQuery(api.shared.categories.listAllCategories)
  const normalizedTree = useMemo(
    () => (categories ? normalizeCategoryTree(categories) : []),
    [categories],
  )
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

  const [tree, setTree] = useState<CategoryNode[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (categories) {
      setTree(normalizedTree)
    }
  }, [categories, normalizedTree])

  const isLoading = categories === undefined
  const isEmpty = normalizedTree.length === 0

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Loading categories...</EmptyTitle>
            <EmptyDescription>Please wait while we fetch your data.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>Create categories first before organizing them.</EmptyDescription>
          </EmptyHeader>
          <div className="mt-4">
            <Button onClick={() => navigate({ to: "/a/categories" })}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </div>
        </Empty>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Organize Categories</h1>
          <p className="text-muted-foreground">
            Drag and drop categories to control their display order. Changes are saved automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </div>
          )}
          <Button variant="outline" onClick={() => navigate({ to: "/a/categories" })}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </div>
      </div>

      <Sortable value={tree} onValueChange={handleParentReorder} getItemValue={(item) => item._id} className="space-y-4">
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
                  <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
                    Level 1 · {group.courseCount} {group.courseCount === 1 ? "course" : "courses"}
                  </span>
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
                                  Level 2 · {child.courseCount} {child.courseCount === 1 ? "course" : "courses"}
                                </p>
                              </div>
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
                              >
                                {child.children.map((grandchild) => (
                                  <SortableItem key={grandchild._id} value={grandchild._id}>
                                    <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
                                      <SortableItemHandle className="text-muted-foreground transition-colors hover:text-foreground">
                                        <GripVertical className="h-4 w-4" />
                                      </SortableItemHandle>
                                      <span className="font-medium">{grandchild.name}</span>
                                      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                                        Level 3 · {grandchild.courseCount} {grandchild.courseCount === 1 ? "course" : "courses"}
                                      </span>
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
    </div>
  )
}
