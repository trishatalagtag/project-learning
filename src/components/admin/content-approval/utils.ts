import { formatDistanceToNow } from "date-fns"
import type { ContentItem, ContentItemWithId } from "./types"

export function mapItemWithId(item: ContentItem): ContentItemWithId {
  return { ...item, id: item._id }
}

export function mapItemsWithId(items: ContentItem[]): ContentItemWithId[] {
  return items.map(mapItemWithId)
}

export function formatTimeAgo(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

export function getItemDisplayTitle(item: ContentItem): string {
  return item.title || "Untitled"
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export function groupItemsByStatus(items: ContentItem[]) {
  return items.reduce(
    (acc, item) => {
      const status = item.status as "pending" | "approved" | "draft"
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(item)
      return acc
    },
    {} as Record<"pending" | "approved" | "draft", ContentItem[]>,
  )
}
