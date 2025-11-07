"use client"

import { Label } from "@/components/ui/field"
import { SearchField, SearchInput } from "@/components/ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { type JSX, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import type { ContentFilters, ContentType } from "./types"

interface ContentFilterFormProps {
  onFilterChange: (filters: ContentFilters) => void
}

const CONTENT_TYPES = [
  { id: "all", name: "All Types" },
  { id: "module", name: "Modules" },
  { id: "lesson", name: "Lessons" },
  { id: "quiz", name: "Quizzes" },
  { id: "assignment", name: "Assignments" },
] as const

export function ContentFilterForm({ onFilterChange }: ContentFilterFormProps): JSX.Element {
  const { control, watch } = useForm<ContentFilters>({
    defaultValues: {
      search: "",
      contentType: "all",
    },
  })

  const filters = watch()

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Controller
        control={control}
        name="search"
        render={({ field }) => (
          <SearchField
            value={field.value}
            onChange={field.onChange}
            aria-label="Search Content"
            className="flex-grow"
          >
            <SearchInput placeholder="Search content..." />
          </SearchField>
        )}
      />

      <Controller
        control={control}
        name="contentType"
        render={({ field }) => (
          <Select
            selectedKey={field.value}
            onSelectionChange={(key) => field.onChange(key as ContentType)}
            placeholder="Filter by type"
          >
            <Label className="sr-only">Content Type</Label>
            <SelectTrigger />
            <SelectContent items={CONTENT_TYPES}>
              {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}
