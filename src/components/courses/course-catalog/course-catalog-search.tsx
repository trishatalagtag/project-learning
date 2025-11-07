import { SearchField, SearchInput } from "@/components/ui/search-field"

import { useCourseCatalog } from "./course-catalog"

export function CourseCatalogSearch() {
  const { filters, onFiltersChange } = useCourseCatalog()

  return (
    <SearchField
      value={filters.search}
      onChange={(value) => onFiltersChange({ search: value, page: 1 })}
      className="w-full sm:max-w-sm"
    >
      <SearchInput placeholder="Search courses..." />
    </SearchField>
  )
}
