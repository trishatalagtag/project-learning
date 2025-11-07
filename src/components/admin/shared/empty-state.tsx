"use client"

import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { FilesIcon } from "@phosphor-icons/react"
import type { JSX, ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: ReactNode
  actions?: ReactNode
  message?: string // Deprecated: prefers 'title'
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  message,
}: EmptyStateProps): JSX.Element {
  return (
    <Empty>
      {icon !== undefined ? (
        <EmptyMedia>{icon}</EmptyMedia>
      ) : (
        <EmptyMedia>
          <FilesIcon size={48} weight="duotone" className="mx-auto text-muted-foreground" />
        </EmptyMedia>
      )}
      <EmptyTitle>{title ?? message}</EmptyTitle>
      {description && <EmptyDescription>{description}</EmptyDescription>}
      {actions && <EmptyContent>{actions}</EmptyContent>}
    </Empty>
  )
}
