import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Grade an assignment submission.
 */
export async function gradeAssignmentSubmission(
  ctx: MutationCtx,
  submissionId: Id<"assignmentSubmissions">,
  grade: number,
  feedback: string,
  gradedBy: string
): Promise<void> {
  const submission = await ctx.db.get(submissionId);
  
  if (!submission) {
    throw new Error("Submission not found");
  }
  
  if (submission.status !== "submitted") {
    throw new Error("Only submitted assignments can be graded");
  }
  
  const assignment = await ctx.db.get(submission.assignmentId);
  
  if (!assignment) {
    throw new Error("Assignment not found");
  }
  
  if (grade < 0 || grade > assignment.maxPoints) {
    throw new Error(`Grade must be between 0 and ${assignment.maxPoints}`);
  }
  
  await ctx.db.patch(submissionId, {
    grade,
    teacherFeedback: feedback,
    gradedBy,
    gradedAt: Date.now(),
    status: "graded",
  });
}

/**
 * Update an existing grade.
 */
export async function updateGrade(
  ctx: MutationCtx,
  submissionId: Id<"assignmentSubmissions">,
  grade: number,
  feedback: string
): Promise<void> {
  const submission = await ctx.db.get(submissionId);
  
  if (!submission) {
    throw new Error("Submission not found");
  }
  
  if (submission.status !== "graded") {
    throw new Error("Submission must be graded first");
  }
  
  const assignment = await ctx.db.get(submission.assignmentId);
  
  if (!assignment) {
    throw new Error("Assignment not found");
  }
  
  if (grade < 0 || grade > assignment.maxPoints) {
    throw new Error(`Grade must be between 0 and ${assignment.maxPoints}`);
  }
  
  await ctx.db.patch(submissionId, {
    grade,
    teacherFeedback: feedback,
    gradedAt: Date.now(),
  });
}

/**
 * Get all submissions for an assignment.
 */
export async function getAssignmentSubmissions(
  ctx: QueryCtx,
  assignmentId: Id<"assignments">,
  statusFilter?: "draft" | "submitted" | "graded"
): Promise<Doc<"assignmentSubmissions">[]> {
  let query = ctx.db
    .query("assignmentSubmissions")
    .withIndex("by_assignment", (q) => q.eq("assignmentId", assignmentId));
  
  let submissions = await query.collect();
  
  if (statusFilter) {
    submissions = submissions.filter((s) => s.status === statusFilter);
  }
  
  return submissions;
}

/**
 * Calculate assignment statistics for a class.
 */
export async function calculateAssignmentStatistics(
  ctx: QueryCtx,
  assignmentId: Id<"assignments">
) {
  const submissions = await ctx.db
    .query("assignmentSubmissions")
    .withIndex("by_assignment", (q) => q.eq("assignmentId", assignmentId))
    .filter((q) => q.eq(q.field("status"), "graded"))
    .collect();
  
  if (submissions.length === 0) {
    return {
      totalSubmissions: 0,
      gradedSubmissions: 0,
      averageGrade: null,
      highestGrade: null,
      lowestGrade: null,
      lateSubmissions: 0,
      onTimeSubmissions: 0,
    };
  }
  
  const grades = submissions.map((s) => s.grade!).filter((g) => g !== null);
  const lateCount = submissions.filter((s) => s.isLate).length;
  
  return {
    totalSubmissions: submissions.length,
    gradedSubmissions: grades.length,
    averageGrade: grades.reduce((sum, g) => sum + g, 0) / grades.length,
    highestGrade: Math.max(...grades),
    lowestGrade: Math.min(...grades),
    lateSubmissions: lateCount,
    onTimeSubmissions: submissions.length - lateCount,
  };
}

/**
 * Calculate quiz statistics for a class.
 */
export async function calculateQuizStatistics(
  ctx: QueryCtx,
  quizId: Id<"quizzes">
) {
  const attempts = await ctx.db
    .query("quizAttempts")
    .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
    .collect();
  
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      uniqueStudents: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      passRate: null,
    };
  }
  
  const scores = attempts.map((a) => a.percentage);
  const uniqueStudents = new Set(attempts.map((a) => a.userId)).size;
  const quiz = await ctx.db.get(quizId);
  const passCount = quiz?.passingScore 
    ? attempts.filter((a) => a.percentage >= quiz.passingScore!).length 
    : null;
  
  return {
    totalAttempts: attempts.length,
    uniqueStudents,
    averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passRate: passCount !== null ? (passCount / uniqueStudents) * 100 : null,
  };
}

/**
 * Update course grading configuration.
 */
export async function updateCourseGradingConfig(
  ctx: MutationCtx,
  courseId: Id<"courses">,
  gradingConfig: {
    passingScore: number;
    gradingMethod: "numerical" | "competency" | "weighted";
    components?: Array<{ name: string; weight: number }>;
  }
): Promise<void> {
  const course = await ctx.db.get(courseId);
  
  if (!course) {
    throw new Error("Course not found");
  }
  
  // Validate grading config
  if (gradingConfig.passingScore < 0 || gradingConfig.passingScore > 100) {
    throw new Error("Passing score must be between 0 and 100");
  }
  
  if (gradingConfig.gradingMethod === "weighted") {
    if (!gradingConfig.components || gradingConfig.components.length === 0) {
      throw new Error("Weighted grading requires components");
    }
    
    const totalWeight = gradingConfig.components.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error("Component weights must sum to 100");
    }
  }
  
  await ctx.db.patch(courseId, {
    gradingConfig: gradingConfig as any,
    updatedAt: Date.now(),
  });
}
