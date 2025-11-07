import { ComboBox, ComboBoxContent, ComboBoxInput, ComboBoxItem } from "@/components/ui/combo-box"
import { Label } from "@/components/ui/field"
import { api } from "api"
import { useQuery } from "convex/react"
import { useCourseCatalog } from "./course-catalog"

export function CourseCatalogCategoryFilter() {
  const { filters, onFiltersChange } = useCourseCatalog()

  const categories = useQuery(api.learner.categories.listCategories)

  return (
    <ComboBox
      selectedKey={filters.categoryId}
      onSelectionChange={(key) =>
        onFiltersChange({
          categoryId: key ? String(key) : undefined,
          page: 1,
        })
      }
      className="w-full sm:w-48"
    >
      <Label>Category</Label>
      <ComboBoxInput placeholder="All categories" />
      <ComboBoxContent>
        <ComboBoxItem id="">All categories</ComboBoxItem>
        {categories?.map((category) => (
          <ComboBoxItem key={category._id} id={category._id}>
            {category.name}
          </ComboBoxItem>
        ))}
      </ComboBoxContent>
    </ComboBox>
  )
}
