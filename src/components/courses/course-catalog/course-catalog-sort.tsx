import { ComboBox, ComboBoxContent, ComboBoxInput, ComboBoxItem } from "@/components/ui/combo-box"

import { Label } from "@/components/ui/field"

import { useCourseCatalog } from "./course-catalog"

const sortOptions = [
  { id: "createdAt-desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { id: "createdAt-asc", label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { id: "title-asc", label: "Title (A-Z)", sortBy: "title", sortOrder: "asc" },
  { id: "title-desc", label: "Title (Z-A)", sortBy: "title", sortOrder: "desc" },
  { id: "updatedAt-desc", label: "Recently updated", sortBy: "updatedAt", sortOrder: "desc" },
] as const

export function CourseCatalogSort() {
  const { filters, onFiltersChange } = useCourseCatalog()

  const currentSortId = `${filters.sortBy}-${filters.sortOrder}`

  return (
    <ComboBox
      selectedKey={currentSortId}
      onSelectionChange={(key) => {
        const option = sortOptions.find((opt) => opt.id === key)
        if (option) {
          onFiltersChange({
            sortBy: option.sortBy,
            sortOrder: option.sortOrder,
          })
        }
      }}
      className="w-full sm:w-52"
    >
      <Label>Sort by</Label>
      <ComboBoxInput placeholder="Sort by..." />
      <ComboBoxContent>
        {sortOptions.map((option) => (
          <ComboBoxItem key={option.id} id={option.id}>
            {option.label}
          </ComboBoxItem>
        ))}
      </ComboBoxContent>
    </ComboBox>
  )
}
