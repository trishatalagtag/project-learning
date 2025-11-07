import { ComboBox, ComboBoxContent, ComboBoxInput, ComboBoxItem } from "@/components/ui/combo-box"

import { Label } from "@/components/ui/field"

import { useCourseCatalog } from "./course-catalog"

export function CourseCatalogEnrollmentFilter() {
  const { filters, onFiltersChange } = useCourseCatalog()

  const currentValue =
    filters.enrollmentOpen === undefined ? "" : filters.enrollmentOpen ? "open" : "closed"

  return (
    <ComboBox
      selectedKey={currentValue}
      onSelectionChange={(key) => {
        onFiltersChange({
          enrollmentOpen: key === "" ? undefined : key === "open" ? true : false,
          page: 1,
        })
      }}
      className="w-full sm:w-48"
    >
      <Label>Enrollment</Label>
      <ComboBoxInput placeholder="All enrollment" />
      <ComboBoxContent>
        <ComboBoxItem id="">All enrollment</ComboBoxItem>
        <ComboBoxItem id="open">Open for Enrollment</ComboBoxItem>
        <ComboBoxItem id="closed">Closed</ComboBoxItem>
      </ComboBoxContent>
    </ComboBox>
  )
}
