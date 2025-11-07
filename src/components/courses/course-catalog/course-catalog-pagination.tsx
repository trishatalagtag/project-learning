import {
  Pagination,
  PaginationFirst,
  PaginationGap,
  PaginationItem,
  PaginationLabel,
  PaginationLast,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationSection,
} from "@/components/ui/pagination"

import { useCourseCatalog } from "./course-catalog"

function getPaginationRange(current: number, total: number) {
  const range: (number | "gap")[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      range.push(i)
    }
    return range
  }
  range.push(1)
  if (current > 4) {
    range.push("gap")
  }
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (i !== 1 && i !== total) range.push(i)
  }
  if (current < total - 3) {
    range.push("gap")
  }
  if (total > 1) range.push(total)
  return range
}

export function CourseCatalogPagination() {
  const { total, filters, onFiltersChange } = useCourseCatalog()

  const currentPage = filters.page
  const limit = filters.limit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  function goToPage(page: number) {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onFiltersChange({ page })
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <Pagination>
      <PaginationList className="hidden md:flex">
        <PaginationFirst href="#" onClick={() => goToPage(1)} isDisabled={currentPage === 1} />
        <PaginationPrevious
          href="#"
          onClick={() => goToPage(currentPage - 1)}
          isDisabled={currentPage === 1}
        />
        <PaginationSection>
          {getPaginationRange(currentPage, totalPages).map((entry, idx) => {
            if (entry === "gap") {
              return <PaginationGap key={`gap-${idx}`} />
            }
            return (
              <PaginationItem
                key={entry}
                href="#"
                onClick={() => goToPage(entry as number)}
                isCurrent={currentPage === entry}
              >
                {entry}
              </PaginationItem>
            )
          })}
        </PaginationSection>
        <PaginationNext
          href="#"
          onClick={() => goToPage(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        />
        <PaginationLast
          href="#"
          onClick={() => goToPage(totalPages)}
          isDisabled={currentPage === totalPages}
        />
      </PaginationList>
      <PaginationList className="md:hidden">
        <PaginationFirst href="#" onClick={() => goToPage(1)} isDisabled={currentPage === 1} />
        <PaginationPrevious
          href="#"
          onClick={() => goToPage(currentPage - 1)}
          isDisabled={currentPage === 1}
        />
        <PaginationSection className="rounded-(--section-radius) border px-3 *:min-w-4">
          <PaginationLabel>{currentPage}</PaginationLabel>
          <PaginationLabel className="text-muted-fg">/</PaginationLabel>
          <PaginationLabel>{totalPages}</PaginationLabel>
        </PaginationSection>
        <PaginationNext
          href="#"
          onClick={() => goToPage(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        />
        <PaginationLast
          href="#"
          onClick={() => goToPage(totalPages)}
          isDisabled={currentPage === totalPages}
        />
      </PaginationList>
    </Pagination>
  )
}
