<!-- 850e6c5c-1505-4e87-bb98-e5e23cba45a8 293af0f4-ba33-45a1-8664-98c7f9d4f8af -->
# Analytics Dashboard Implementation Plan

## Overview

Implement a dedicated analytics dashboard accessible at `/a/analytics` with four main sections:

1. **Overview** (`/a/analytics`) - System-wide statistics dashboard
2. **Enrollment Trends** (`/a/analytics/enrollments`) - Time-series charts with date range filtering
3. **Course Performance** (`/a/analytics/courses`) - Data table with completion metrics
4. **Report Generation** (`/a/analytics/reports`) - Form to generate and export analytics reports

All routes use existing backend queries from `[convex/admin/analytics.ts](convex/admin/analytics.ts)` and follow established admin UI patterns from `[src/components/admin/users/users-table.tsx](src/components/admin/users/users-table.tsx)` and `[src/components/admin/users/user-stats-cards.tsx](src/components/admin/users/user-stats-cards.tsx)`.

## File Structure

### Route Files

- `src/pages/_authenticated._admin.a/analytics/index.tsx` - Overview dashboard
- `src/pages/_authenticated._admin.a/analytics/enrollments.tsx` - Enrollment trends page
- `src/pages/_authenticated._admin.a/analytics/courses.tsx` - Course performance page
- `src/pages/_authenticated._admin.a/analytics/reports.tsx` - Report generation page

### Component Files

- `src/components/admin/analytics/system-stats-cards.tsx` - Stat cards for overview
- `src/components/admin/analytics/date-range-picker.tsx` - Reusable date range picker
- `src/components/admin/analytics/enrollment-trends-chart.tsx` - Chart component using recharts
- `src/components/admin/analytics/course-performance-table.tsx` - Performance data table
- `src/components/admin/analytics/report-generation-form.tsx` - Report form component

## Implementation Details

### 1. Analytics Overview Page (`/a/analytics`)

**Route**: `src/pages/_authenticated._admin.a/analytics/index.tsx`

- Use `createFileRoute` from TanStack Router with breadcrumb "Analytics"
- Fetch data using `useQuery(api.admin.analytics.getSystemStats)`
- Display `SystemStatsCards` component
- Add quick navigation links to other analytics pages
- Follow page structure pattern from `[src/pages/_authenticated._admin.a/users/index.tsx](src/pages/_authenticated._admin.a/users/index.tsx)`

**SystemStatsCards Component** (`src/components/admin/analytics/system-stats-cards.tsx`):

- Accept props: `FunctionReturnType<typeof api.admin.analytics.getSystemStats>`
- Grid layout: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Create stat cards for:
  - Total Users (with Learners/Faculty/Admins breakdown)
  - Total Courses (with Published/Pending breakdown)
  - Total Enrollments (with Active/Completed breakdown)
  - Content Overview (Modules/Lessons/Quizzes/Assignments)
- Follow design pattern from `[src/components/admin/users/user-stats-cards.tsx](src/components/admin/users/user-stats-cards.tsx)`
- Use `Card` and `CardContent` from shadcn/ui
- Use Heroicons for icons (UsersIcon, AcademicCapIcon, CheckCircleIcon, etc.)

### 2. Enrollment Trends Page (`/a/analytics/enrollments`)

**Route**: `src/pages/_authenticated._admin.a/analytics/enrollments.tsx`

- Use `createFileRoute` with breadcrumb "Enrollment Trends"
- Implement date range state: `{ start?: number; end?: number }`
- Fetch data: `useQuery(api.admin.analytics.getEnrollmentTrends, { startDate, endDate })`
- Display `DateRangePicker` and `EnrollmentTrendsChart`
- Default to last 30 days if no date range selected
- Handle loading and empty states

**DateRangePicker Component** (`src/components/admin/analytics/date-range-picker.tsx`):

- Props: `{ startDate?: number; endDate?: number; onDateRangeChange: (range) => void }`
- Use `Popover` + `Calendar` from shadcn/ui (similar to pattern in `[src/pages/_authenticated._admin.a/content-approvals/index.tsx](src/pages/_authenticated._admin.a/content-approvals/index.tsx)`)
- Two date inputs: "From" and "To"
- Convert calendar dates to timestamps (number) for backend
- Format dates for display using `date-fns`
- Include clear button to reset range

**EnrollmentTrendsChart Component** (`src/components/admin/analytics/enrollment-trends-chart.tsx`):

- Props: `{ data: FunctionReturnType<typeof api.admin.analytics.getEnrollmentTrends> }`
- Use `ChartContainer` from `[src/components/ui/chart.tsx](src/components/ui/chart.tsx)`
- Use `LineChart` from recharts (imported via `* as RechartsPrimitive from "recharts"`)
- Chart config:
  ```typescript
  const chartConfig = {
    enrollments: { label: "Enrollments", color: "hsl(var(--chart-1))" },
    completions: { label: "Completions", color: "hsl(var(--chart-2))" },
  }
  ```

- X-axis: dates (format from YYYY-MM-DD to readable format)
- Y-axis: count
- Include `ChartTooltip` and `ChartLegend`
- Two data series: `enrollments` and `completions`

### 3. Course Performance Page (`/a/analytics/courses`)

**Route**: `src/pages/_authenticated._admin.a/analytics/courses.tsx`

- Use `createFileRoute` with breadcrumb "Course Performance"
- Fetch data: `useQuery(api.admin.analytics.getCourseCompletionRates, { limit: 50 })`
- Display `CoursePerformanceTable` component
- Handle loading and empty states

**CoursePerformanceTable Component** (`src/components/admin/analytics/course-performance-table.tsx`):

- Props: `{ data: FunctionReturnType<typeof api.admin.analytics.getCourseCompletionRates> }`
- Use TanStack Table (follow pattern from `[src/components/admin/users/users-table.tsx](src/components/admin/users/users-table.tsx)`)
- Columns:
  - Course Name (link to `/a/courses/$courseId`)
  - Total Enrollments (number)
  - Active Enrollments (number)
  - Completed Enrollments (number)
  - Completion Rate (percentage, 2 decimals)
  - Average Completion Time (format as "X days" or "N/A" if undefined)
- Sortable columns
- Responsive: mobile list view using `ItemGroup`, desktop table view
- Use `Table`, `TableHeader`, `TableBody` from shadcn/ui

### 4. Report Generation Page (`/a/analytics/reports`)

**Route**: `src/pages/_authenticated._admin.a/analytics/reports.tsx`

- Use `createFileRoute` with breadcrumb "Report Generation"
- Display `ReportGenerationForm` component
- Handle form submission and show success/error states

**ReportGenerationForm Component** (`src/components/admin/analytics/report-generation-form.tsx`):

- Use shadcn/ui `Form` components with React Hook Form
- Form fields:
  - Report Type: `Select` (enrollments, completions, user_activity)
  - Format: `Select` (CSV, JSON)
  - Date Range: Optional `DateRangePicker`
- Use `useMutation(api.admin.analytics.exportAnalyticsReport)`
- Submit button with loading state
- Show toast notifications using `sonner` for success/error
- Note: Backend currently returns placeholder - handle gracefully with user message

## Type Safety

- Use `FunctionReturnType<typeof api.admin.analytics.getSystemStats>` for stats
- Use `FunctionReturnType<typeof api.admin.analytics.getEnrollmentTrends>` for trends
- Use `FunctionReturnType<typeof api.admin.analytics.getCourseCompletionRates>` for course stats
- Use `Id<"courses">` for course IDs
- Import types from `@/convex/_generated/api` and `@/convex/_generated/dataModel`
- No manual type definitions - use generated Convex types only

## Styling & UX

- Use shadcn/ui components exclusively (Card, Table, Form, Select, Popover, Calendar, etc.)
- Follow spacing patterns: `space-y-6` for page sections, `gap-4` for grids
- Responsive: mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- Loading states: Use `Loader2` from lucide-react with `Empty` component
- Empty states: Use `Empty` component from shadcn/ui
- Icons: Heroicons (24/outline for most, 24/solid for active)
- Consistent with existing admin pages in layout and spacing

## Sidebar Configuration

Sidebar already configured in `[src/config/sidebar/admin.ts](src/config/sidebar/admin.ts)` (lines 112-135) with analytics routes. No changes needed.

## Testing Requirements

- All routes accessible and render correctly
- System stats load and display in cards
- Date range picker updates chart data
- Chart displays enrollment trends with tooltips
- Course performance table sorts correctly
- Report form submits (handles placeholder response)
- Loading states show during data fetch
- Error states handle gracefully
- Mobile responsive layout works
- Navigation and breadcrumbs work correctly

### To-dos

- [ ] Create all 4 route files: analytics/index.tsx, analytics/enrollments.tsx, analytics/courses.tsx, analytics/reports.tsx with basic structure and routing
- [ ] Create SystemStatsCards component with stat cards for users, courses, enrollments, and content counts following UserStatsCards pattern
- [ ] Implement analytics overview page with SystemStatsCards and quick navigation links
- [ ] Create reusable DateRangePicker component using Popover + Calendar from shadcn/ui
- [ ] Create EnrollmentTrendsChart component using ChartContainer and LineChart from recharts
- [ ] Implement enrollment trends page with DateRangePicker and EnrollmentTrendsChart, default to last 30 days
- [ ] Create CoursePerformanceTable component using TanStack Table with sortable columns for course metrics
- [ ] Implement course performance page with CoursePerformanceTable, handle loading and empty states
- [ ] Create ReportGenerationForm component with form fields for report type, format, and optional date range
- [ ] Implement report generation page with ReportGenerationForm, handle mutation and toast notifications
- [ ] Add loading states using Loader2 and Empty component to all pages
- [ ] Polish UI, ensure responsive design works on mobile, verify spacing and styling consistency