"use client"

import { Label } from "@/components/ui/field"
import { SearchField, SearchInput } from "@/components/ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { type JSX, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import type { CourseFilters } from "./types"

interface CourseFilterFormProps {
  onFilterChange: (filters: CourseFilters) => void
}

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
] as const

export function CourseFilterForm({ onFilterChange }: CourseFilterFormProps): JSX.Element {
  const { control, watch } = useForm<CourseFilters>({
    defaultValues: {
      search: "",
      category: "all",
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
            aria-label="Search Courses"
            className="flex-grow"
          >
            <SearchInput placeholder="Search courses..." />
          </SearchField>
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <Select
            selectedKey={field.value}
            onSelectionChange={(key) => field.onChange(String(key))}
            placeholder="Filter by category"
          >
            <Label className="sr-only">Category</Label>
            <SelectTrigger />
            <SelectContent items={CATEGORIES}>
              {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}
