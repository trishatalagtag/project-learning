import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { FunctionReturnType } from "convex/server"

type SharedCategoryTreeNode = FunctionReturnType<
    typeof api.shared.categories.listAllCategories
>[number]

export interface NormalizedCategoryNode {
    _id: Id<"categories">
    name: string
    description: string
    level: number
    order: number
    createdAt: number
    parentId?: Id<"categories">
    parentName?: string
    courseCount?: number
    children: NormalizedCategoryNode[]
}

/**
 * Converts the shared categories tree into a normalized hierarchy with parent metadata.
 */
export function normalizeCategoryTree(
    categories: SharedCategoryTreeNode[],
): NormalizedCategoryNode[] {
    const traverse = (
        nodes: SharedCategoryTreeNode[],
        parent?: NormalizedCategoryNode,
    ): NormalizedCategoryNode[] => {
        return nodes
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((node) => {
                const normalized: NormalizedCategoryNode = {
                    _id: node._id as Id<"categories">,
                    name: node.name,
                    description: node.description,
                    level: node.level,
                    order: node.order,
                    createdAt: node.createdAt ?? node._creationTime ?? Date.now(),
                    parentId: parent?._id,
                    parentName: parent?.name,
                    courseCount: (node as { courseCount?: number }).courseCount,
                    children: [],
                }

                const children = (node.children ?? []) as SharedCategoryTreeNode[]
                normalized.children = traverse(children, normalized)

                return normalized
            })
    }

    return traverse(categories)
}

/**
 * Flattens a normalized category tree into a simple list for table views.
 */
export function flattenCategoryTree(
    nodes: NormalizedCategoryNode[],
): NormalizedCategoryNode[] {
    const result: NormalizedCategoryNode[] = []

    const walk = (node: NormalizedCategoryNode) => {
        result.push(node)
        node.children.forEach(walk)
    }

    nodes.forEach(walk)
    return result
}
