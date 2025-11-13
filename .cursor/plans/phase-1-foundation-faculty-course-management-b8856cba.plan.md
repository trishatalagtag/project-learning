<!-- b8856cba-69b8-42f8-afe8-c4cf588dfcf4 43e118a4-d1c8-4647-a952-ce2ee19233ca -->
# Phase 4 Grading & Progress: Faculty Assessment Grading & Learner Monitoring

## Feature 4.1: Assignment Submissions & Grading Interface

### Overview

Create a paginated and filterable list interface for viewing all student submissions for a specific assignment, with filtering capabilities and navigation to detailed grading views.

### Implementation Steps

#### 1. Submissions List Route

- **New File**: `src/pages/_authenticated._admin.a/courses/$courseId/assignments/$assignmentId/submissions.tsx`
- **Features**:
  - Route guard allowing FACULTY role
  - Fetch assignment data using `api.faculty.assignments.getAssignmentById` (for assignment title/context)
  - Fetch submissions using `api.faculty.grading.listSubmissionsForAssignment`
  - Handle loading, error, and not found states
  - Render `SubmissionsList` component

#### 2. Submissions List Component

- **New File**: `src/components/faculty/courses/assignments/submissions-list.tsx`
- **Features**:
  - Header with assignment title, breadcrumb navigation
  - Filter controls:
    - Status filter dropdown (All, Draft, Submitted, Graded)
    - "Ready to Grade" filter button (shows only submitted but not graded)
    - Search input (by student name/email) with debouncing
  - Data table displaying submissions
  - Pagination controls
  - Loading skeleton
  - Empty state: "No submissions have been received for this assignment yet."
  - Error state with retry button

#### 3. Submissions Data Table

- **New File**: `src/components/faculty/courses/assignments/submissions-table.tsx`
- **Features**:
  - Use TanStack Table (`@tanstack/react-table`) for table functionality
  - Columns:
    - Student Name (clickable, links to learner progress page)
    - Submission Status (badge: Draft, Submitted, Graded)
    - Submitted Date (formatted date, or "Not submitted" if draft)
    - Grade (display grade/maxPoints, or "Not graded" if not graded)
    - Late Indicator (badge if `isLate === true`)
    - Actions (View/Grade button linking to detailed grading view)
  - Sortable columns (by name, date, grade)
  - Row click navigates to detailed grading view
  - Highlight "Ready to Grade" rows (submitted but not graded)
  - Loading skeleton rows

#### 4. Submissions Table Columns

- **New File**: `src/components/faculty/courses/assignments/submissions-columns.tsx`
- **Features**:
  - Define column definitions using TanStack Table
  - Use `DataTableColumnHeader` for sortable headers
  - Format dates using `date-fns`
  - Render status badges with appropriate colors
  - Render action buttons

#### 5. URL State Management

- **Location**: `submissions-list.tsx`
- **Features**:
  - Use TanStack Router search params for filters, search, pagination
  - Schema: `status`, `readyToGrade` (boolean), `search`, `pageIndex`, `pageSize`, `sortBy`, `sortOrder`
  - Sync URL params with component state for shareable/bookmarkable filters

---

## Feature 4.2: Detailed Grading View

### Overview

Create a dedicated view for grading a single submission, displaying the student's work, submission metadata, and a grading form.

### Implementation Steps

#### 1. Grading View Route

- **New File**: `src/pages/_authenticated._admin.a/courses/$courseId/assignments/$assignmentId/submissions/$submissionId.tsx`
- **Features**:
  - Route guard allowing FACULTY role
  - Fetch submission data using `api.faculty.grading.getSubmissionById`
  - Handle loading, error, and not found states
  - Render `GradingView` component

#### 2. Grading View Main Component

- **New File**: `src/components/faculty/courses/assignments/grading-view.tsx`
- **Features**:
  - Two-column layout: Submission Content | Grading Form
  - Header with student name, assignment title, breadcrumb navigation
  - Submission metadata section
  - Loading skeleton
  - Error handling

#### 3. Submission Content Display

- **New File**: `src/components/faculty/courses/assignments/submission-content.tsx`
- **Features**:
  - Display based on `submissionType`:
    - **File**: Show file download link/button, file name, file size (if available)
    - **URL**: Show clickable link with preview (open in new tab)
    - **Text**: Show text content in formatted text area or markdown viewer
  - Submission metadata:
    - Student name and email
    - Submission date
    - Attempt number
    - Late indicator (if late)
    - Current grade (if already graded)
    - Current feedback (if already graded)
  - Use appropriate UI components (Card, Badge, etc.)

#### 4. Grading Form Component

- **New File**: `src/components/faculty/courses/assignments/grading-form.tsx`
- **Features**:
  - Form fields using react-hook-form + zod:
    - Grade (number input, required, min 0, max = assignmentMaxPoints)
    - Teacher Feedback (optional, markdown editor or textarea)
  - Display max points from assignment
  - Show current grade/feedback if already graded (pre-populate form)
  - "Submit Grade" button (if not yet graded)
  - "Update Grade" button (if already graded)
  - Calls `api.faculty.grading.gradeSubmission` or `api.faculty.grading.updateGrade` mutation
  - Loading state on submit
  - Success toast + navigate back to submissions list or stay on page
  - Error handling with user-friendly messages

#### 5. File Download/Preview

- **Location**: `submission-content.tsx`
- **Features**:
  - If `fileUrl` exists, show download button
  - If file type is image, show image preview
  - If file type is PDF, show PDF viewer or download link
  - For other file types, show download button with file name
  - Handle missing file URLs gracefully

---

## Feature 4.3: Learner Progress Monitoring

### Overview

Create an overview interface showing all learners' progress in a course, with detailed metrics and navigation to individual learner progress pages.

### Implementation Steps

#### 1. Add Progress Tab to Course Detail Page

- **File**: `src/components/faculty/courses/faculty-course-detail-page.tsx` (from Phase 1)
- **Change**: Add "Progress" tab to the existing tabbed interface
  - Add `TabsTrigger` with value "progress"
  - Add `TabsContent` for progress
  - Update tab search param type to include "progress"
  - Route: `/a/courses/$courseId` with `tab="progress"`

#### 2. Course Progress Tab Component

- **New File**: `src/components/faculty/courses/tabs/progress-tab.tsx`
- **Features**:
  - Fetch progress data using `api.faculty.progress.getCourseProgress` with `courseId`
  - Display data in sortable data table
  - Loading skeleton
  - Empty state: "No learners are enrolled in this course yet."
  - Error state with retry button

#### 3. Learner Progress Data Table

- **New File**: `src/components/faculty/courses/progress/learner-progress-table.tsx`
- **Features**:
  - Use TanStack Table (`@tanstack/react-table`) for table functionality
  - Columns:
    - Student Name (clickable, links to individual progress page)
    - Overall Progress (percentage with progress bar)
    - Lesson Progress (X/Y completed, percentage)
    - Average Quiz Score (percentage or "N/A" if no quizzes)
    - Assignments Submitted (X/Y submitted)
    - Average Assignment Score (percentage or "N/A" if no graded assignments)
  - Sortable columns (by name, overall progress, quiz score, assignment score)
  - Progress bars for visual representation
  - Row click navigates to individual learner progress page
  - Loading skeleton rows

#### 4. Learner Progress Table Columns

- **New File**: `src/components/faculty/courses/progress/learner-progress-columns.tsx`
- **Features**:
  - Define column definitions using TanStack Table
  - Use `DataTableColumnHeader` for sortable headers
  - Render progress bars using shadcn/ui Progress component
  - Format percentages consistently
  - Render "N/A" for missing data

#### 5. Individual Learner Progress Route

- **New File**: `src/pages/_authenticated._admin.a/courses/$courseId/learners/$userId.tsx`
- **Features**:
  - Route guard allowing FACULTY role
  - Fetch learner progress using `api.faculty.progress.getLearnerProgress` with `courseId` and `userId`
  - Handle loading, error, and not found states
  - Render `LearnerProgressDetail` component

#### 6. Individual Learner Progress Component

- **New File**: `src/components/faculty/courses/progress/learner-progress-detail.tsx`
- **Features**:
  - Header with learner name, email, enrollment date, breadcrumb navigation
  - Sections:
    - **Overview**: Overall progress, enrollment status, completion date (if completed)
    - **Lessons**: List of all lessons with completion status, organized by module
    - **Quizzes**: List of all quizzes with attempt count, best score, latest score
    - **Assignments**: List of all assignments with submission status, grade, max points
  - Progress indicators for each section
  - Loading skeleton
  - Error handling

#### 7. Learner Progress Sections

- **New File**: `src/components/faculty/courses/progress/learner-lessons-section.tsx`
  - Display lessons grouped by module
  - Show completion status (checkmark or incomplete indicator)
  - Show completion date if completed
  - Use Card components for each lesson

- **New File**: `src/components/faculty/courses/progress/learner-quizzes-section.tsx`
  - Display list of quizzes
  - Show: quiz title, attempt count, best score, latest score, last attempt date
  - Use Card components for each quiz

- **New File**: `src/components/faculty/courses/progress/learner-assignments-section.tsx`
  - Display list of assignments
  - Show: assignment title, submission status, grade/maxPoints, submitted date
  - Link to grading view if submitted
  - Use Card components for each assignment

---

## Technical Implementation Notes

### Component Structure

```
submissions-list.tsx
└── SubmissionsTable
    └── Row click → /courses/$courseId/assignments/$assignmentId/submissions/$submissionId

grading-view.tsx
├── SubmissionContent
└── GradingForm

progress-tab.tsx
└── LearnerProgressTable
    └── Row click → /courses/$courseId/learners/$userId

learner-progress-detail.tsx
├── Overview Section
├── LearnerLessonsSection
├── LearnerQuizzesSection
└── LearnerAssignmentsSection
```

### Data Flow

- **List Submissions**: `useQuery(api.faculty.grading.listSubmissionsForAssignment, { assignmentId, ...filters })`
- **Get Submission**: `useQuery(api.faculty.grading.getSubmissionById, { submissionId })`
- **Grade Submission**: `useMutation(api.faculty.grading.gradeSubmission)`
- **Update Grade**: `useMutation(api.faculty.grading.updateGrade)`
- **Get Course Progress**: `useQuery(api.faculty.progress.getCourseProgress, { courseId })`
- **Get Learner Progress**: `useQuery(api.faculty.progress.getLearnerProgress, { courseId, userId })`

### Form Validation Schemas

#### Grading Form Schema

```typescript
const gradingFormSchema = z.object({
  grade: z.number().min(0, "Grade cannot be negative"),
  teacherFeedback: z.string().optional(),
})
```

### URL State Management

- **Submissions List**: Use search params for filters, search, pagination, sorting
- **Progress Tab**: Use search params for sorting (optional, can be client-side)

### Table Implementation

- Use TanStack Table (`@tanstack/react-table`) following existing patterns
- Reuse `DataTablePagination`, `DataTableColumnHeader`, `DataTableViewOptions` components
- Follow patterns from `src/components/admin/courses/courses-table.tsx` and `src/components/admin/users/users-table.tsx`

### Progress Bar Component

- Use shadcn/ui Progress component (check if exists, or create simple progress bar)
- Format: `X%` with visual bar
- Color coding: green for high progress, yellow for medium, red for low

### Date Formatting

- Use `date-fns` format function
- Format: "MMM d, yyyy 'at' h:mm a" (e.g., "Jan 15, 2024 at 2:30 PM")
- Or relative time: "2 hours ago", "3 days ago" for recent dates

### File Handling

- File URLs come from `getSubmissionById` query
- Use Convex storage URL for file downloads
- Handle different file types appropriately (images, PDFs, documents)

### UI/UX Patterns

- **Filter Buttons**: Use Badge or Button variants to show active filters
- **Status Badges**: Color-coded (Draft: gray, Submitted: blue, Graded: green)
- **Progress Indicators**: Visual progress bars with percentage text
- **Action Buttons**: "View/Grade" buttons in table rows
- **Loading States**: Skeleton loaders matching table structure
- **Empty States**: Helpful messages with context
- **Error States**: User-friendly error messages with retry buttons

### Type Safety

- Use `FunctionReturnType<typeof api.faculty.grading.listSubmissionsForAssignment>` for submission types
- Use `FunctionReturnType<typeof api.faculty.grading.getSubmissionById>` for submission detail types
- Use `FunctionReturnType<typeof api.faculty.progress.getCourseProgress>` for progress types
- Use `FunctionReturnType<typeof api.faculty.progress.getLearnerProgress>` for learner detail types
- Use `Id<"assignmentSubmissions">`, `Id<"assignments">`, `Id<"courses">`, `Id<"users">` for IDs

### Dependencies & Prerequisites

#### Existing Backend Functions (Ready)

- `api.faculty.grading.listSubmissionsForAssignment` ✓
- `api.faculty.grading.getSubmissionById` ✓
- `api.faculty.grading.gradeSubmission` ✓
- `api.faculty.grading.updateGrade` ✓
- `api.faculty.progress.getCourseProgress` ✓
- `api.faculty.progress.getLearnerProgress` ✓

#### Required Components (Available)

- TanStack Table components (`@tanstack/react-table`) ✓
- `DataTablePagination`, `DataTableColumnHeader`, `DataTableViewOptions` from existing tables ✓
- `MarkdownEditor` from `src/components/shared/content/editor/markdown-editor.tsx` (for feedback) ✓
- shadcn/ui Card, Badge, Button, Input, Progress components ✓
- `useDebounce` from `@uidotdev/usehooks` (already in use) ✓

#### Required Libraries (Check if installed)

- `@tanstack/react-table` - for data tables (already in use) ✓
- `date-fns` - for date formatting (already in use) ✓
- `zod` - for form validation (already in use) ✓
- `react-hook-form` - for form management (already in use) ✓
- `sonner` - for toast notifications (already in use) ✓

### Error Handling

- All queries: Handle `undefined` (loading), `null` (error/not found), and empty arrays
- All mutations: Loading states on buttons, success/error toasts
- Backend validation errors: Display user-friendly messages
- Authorization errors: Graceful handling with appropriate messages
- File download errors: Handle missing or inaccessible files

### Accessibility

- All buttons must have proper ARIA labels
- Table components must be keyboard navigable
- Progress bars must have ARIA labels with percentage values
- Screen reader announcements for status changes
- Focus management in modals/dialogs (handled by shadcn/ui)

### Navigation Flow

- Submissions list → Click row → Grading view → Submit grade → Back to submissions list
- Progress tab → Click student name → Individual learner progress → Back to progress tab
- Individual learner progress → Click assignment → Grading view (if submitted)