"use client";

import type { Course } from "@/lib/types/course";
import { CourseInfoCard } from "./course-info-card";
import { CoverImageCard } from "./cover-image-card";
import { DangerZoneCard } from "./danger-zone-card";
import { EnrollmentSettingsCard } from "./enrollment-settings-card";
import { FacultyAssignmentCard } from "./faculty-assignment-card";
import { LifecycleCard } from "./lifecycle-card";
import { MetadataCard } from "./metadata-card";

interface CourseSettingsTabProps {
  course: Course;
  onDelete: () => void;
}

export function CourseSettingsTab({ course, onDelete }: CourseSettingsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <CourseInfoCard course={course} />
        <CoverImageCard course={course} />
        <EnrollmentSettingsCard course={course} />
        <FacultyAssignmentCard course={course} />
      </div>

      <div className="lg:col-span-1 space-y-6">
        <MetadataCard course={course} />
        <LifecycleCard course={course} />
        <DangerZoneCard course={course} onDelete={onDelete} />
      </div>
    </div>
  );
}

