import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";

type MutationResult = { success: true } | { success: false; error: string };

export function useCourseMutations(courseId: Id<"courses">) {
  const updateCourse = useMutation(api.faculty.courses.updateCourse);
  const assignFaculty = useMutation(api.admin.courses.assignFaculty);
  const unassignFaculty = useMutation(api.admin.courses.unassignFaculty);
  const updateEnrollmentSettings = useMutation(api.admin.courses.updateEnrollmentSettings);
  const updateEnrollmentCode = useMutation(api.admin.courses.updateEnrollmentCode);
  const approveCourse = useMutation(api.admin.courses.approveCourse);
  const rejectCourse = useMutation(api.admin.courses.rejectCourse);
  const publishCourse = useMutation(api.admin.courses.publishCourse);
  const unpublishCourse = useMutation(api.admin.courses.unpublishCourse);
  const deleteCourse = useMutation(api.admin.courses.deleteCourse);

  const withErrorHandling = async <T extends unknown[]>(
    fn: (...args: T) => Promise<any>,
    successMessage: string,
    errorMessage: string,
    ...args: T
  ): Promise<MutationResult> => {
    try {
      await fn(...args);
      toast.success(successMessage);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateCourseDetails = async (
    title: string,
    description: string,
    categoryId: Id<"categories">
  ): Promise<MutationResult> => {
    return withErrorHandling(
      updateCourse,
      "Course updated successfully",
      "Failed to update course",
      { courseId, title, description, categoryId }
    );
  };

  const assignTeacher = async (teacherId: string): Promise<MutationResult> => {
    return withErrorHandling(
      assignFaculty,
      "Faculty assigned",
      "Failed to assign faculty",
      { courseId, teacherId }
    );
  };

  const unassignTeacher = async (): Promise<MutationResult> => {
    return withErrorHandling(
      unassignFaculty,
      "Faculty unassigned",
      "Failed to unassign faculty",
      { courseId }
    );
  };

  const toggleEnrollment = async (isOpen: boolean): Promise<MutationResult> => {
    return withErrorHandling(
      updateEnrollmentSettings,
      `Enrollment ${isOpen ? "opened" : "closed"}`,
      "Failed to toggle enrollment",
      { courseId, isEnrollmentOpen: isOpen }
    );
  };

  const updateCode = async (enrollmentCode: string): Promise<MutationResult> => {
    return withErrorHandling(
      updateEnrollmentCode,
      "Enrollment code updated",
      "Failed to update code",
      { courseId, enrollmentCode }
    );
  };

  const approve = async (): Promise<MutationResult> => {
    return withErrorHandling(
      approveCourse,
      "Course approved",
      "Failed to approve course",
      { courseId }
    );
  };

  const reject = async (reason: string): Promise<MutationResult> => {
    return withErrorHandling(
      rejectCourse,
      "Course rejected",
      "Failed to reject course",
      { courseId, reason }
    );
  };

  const publish = async (): Promise<MutationResult> => {
    return withErrorHandling(
      publishCourse,
      "Course published",
      "Failed to publish course",
      { courseId }
    );
  };

  const unpublish = async (): Promise<MutationResult> => {
    return withErrorHandling(
      unpublishCourse,
      "Course unpublished",
      "Failed to unpublish course",
      { courseId }
    );
  };

  const deleteCourseAction = async (): Promise<MutationResult> => {
    return withErrorHandling(
      deleteCourse,
      "Course deleted",
      "Failed to delete course",
      { courseId }
    );
  };

  return {
    updateCourse: updateCourseDetails,
    assignTeacher,
    unassignTeacher,
    toggleEnrollment,
    updateCode,
    approve,
    reject,
    publish,
    unpublish,
    delete: deleteCourseAction,
  };
}